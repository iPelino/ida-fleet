import React, { useState } from 'react';
import { Badge } from './ui/Badge';
import { Customer, Role, Trip } from '../types';
import { Users, Plus, Search, MapPin, Phone, Mail, Package, TrendingUp, MoreVertical, PenTool, Trash2, X, Save, Building } from 'lucide-react';
import { useCurrency } from '../services/currencyContext';

interface CustomersProps {
  userRole: Role;
}

const Customers: React.FC<CustomersProps> = ({ userRole }) => {
  const { convert, format, displayCurrency } = useCurrency();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, tripsData] = await Promise.all([
          import('../services/api').then(m => m.customers.getAll()),
          import('../services/api').then(m => m.trips.getAll())
        ]);
        setCustomers(customersData);
        setTrips(tripsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // --- Filtering & Stats Logic ---
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate customer statistics based on current trips data
  const customerStats = filteredCustomers.map(customer => {
    const customerTrips = trips.filter(t => t.customerId === customer.id);
    // Dynamic conversion using global context
    const totalRevenue = customerTrips.reduce((sum, t) => sum + convert(t.totalPrice, t.currency), 0);
    const activeTrips = customerTrips.filter(t => t.status !== 'Delivered').length;
    return {
      ...customer,
      tripCount: customerTrips.length,
      totalRevenue,
      isActive: activeTrips > 0
    };
  });

  const totalClients = customers.length; // Use total count, not filtered
  const activeClients = customerStats.filter(c => c.isActive).length; // Based on filtered for now
  const totalRevenue = customerStats.reduce((sum, c) => sum + c.totalRevenue, 0);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Customer Name is required');
      return;
    }

    try {
      if (isEditMode && editingId) {
        // Update existing customer
        const updatedCustomer = await import('../services/api').then(m => m.customers.update(editingId, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        }));

        setCustomers(customers.map(c => c.id === editingId ? updatedCustomer : c));
      } else {
        // Create new customer
        const newCustomer = await import('../services/api').then(m => m.customers.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        }));

        setCustomers([newCustomer, ...customers]);
      }
      
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingId(null);

      // Reset Form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setEditingId(customer.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await import('../services/api').then(m => m.customers.delete(id));
      setCustomers(customers.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Customer Management</h1>
          <p className="text-steel mt-1">Manage client relationships. Revenue shown in <span className="font-bold text-primary">{displayCurrency}</span>.</p>
        </div>
        {(userRole === 'admin' || userRole === 'manager') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-5 rounded-xl border border-steel-lighter shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-steel uppercase tracking-wider">Total Clients</p>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-3xl font-bold text-primary">{totalClients}</h3>
          <p className="text-xs text-steel mt-1">Registered partners</p>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-steel-lighter shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-steel uppercase tracking-wider">Active Now</p>
            <Package className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="text-3xl font-bold text-secondary">{activeClients}</h3>
          <p className="text-xs text-steel mt-1">With ongoing shipments</p>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-steel-lighter shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-steel uppercase tracking-wider">Total Revenue</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-green-700">{format(totalRevenue)}</h3>
          <p className="text-xs text-steel mt-1">Lifetime value from filtered clients</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-steel-lighter shadow-sm">
        <div className="relative max-w-lg">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="w-full pl-4 pr-10 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-0 top-0 bottom-0 px-3 bg-primary text-white rounded-r-lg hover:bg-primary-hover">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {customerStats.map(customer => (
          <div key={customer.id} className="bg-surface rounded-xl border border-steel-lighter shadow-sm hover:shadow-md transition-all group flex flex-col">
            <div className="p-5 flex-1">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-primary line-clamp-1">{customer.name}</h3>
                    <p className="text-xs text-steel">Customer since {new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {(userRole === 'admin' || userRole === 'manager') && (
                  <button className="text-steel-light hover:text-primary">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Stats Badge Row */}
              <div className="flex gap-2 mb-6">
                <Badge variant="neutral" className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {customer.tripCount} Trips
                </Badge>
                {customer.isActive && (
                  <Badge variant="transit">Active Shipment</Badge>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {customer.email && (
                  <div className="flex items-center gap-3 text-sm text-steel">
                    <Mail className="w-4 h-4 text-steel-light shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3 text-sm text-steel">
                    <Phone className="w-4 h-4 text-steel-light shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-3 text-sm text-steel">
                    <MapPin className="w-4 h-4 text-steel-light shrink-0" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-slate-50 border-t border-steel-lighter rounded-b-xl flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-steel font-medium uppercase">Lifetime Revenue</span>
                <span className="text-lg font-bold text-green-700">{format(customer.totalRevenue)}</span>
              </div>

              {(userRole === 'admin' || userRole === 'manager') && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-steel hover:text-primary hover:bg-white rounded-full transition-colors border border-transparent hover:border-steel-lighter"
                  >
                    <PenTool className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-steel hover:text-red-600 hover:bg-white rounded-full transition-colors border border-transparent hover:border-steel-lighter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-steel-light" />
            </div>
            <h3 className="text-lg font-medium text-primary">No customers found</h3>
            <p className="text-steel">Try adjusting your search terms or add a new customer.</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-lg rounded-xl shadow-xl border border-steel-lighter">
            <div className="p-6 border-b border-steel-lighter flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-primary">{isEditMode ? 'Edit Customer' : 'New Customer'}</h2>
                <p className="text-sm text-steel mt-1">{isEditMode ? 'Update customer details.' : 'Register a new client partner.'}</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    address: ''
                  });
                }}
                className="text-steel hover:text-primary p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Company / Customer Name *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Acme Logistics Ltd"
                      className="w-full pl-9 pr-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                    <input
                      type="email"
                      name="email"
                      placeholder="contact@company.com"
                      className="w-full pl-9 pr-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+250 788 000 000"
                      className="w-full pl-9 pr-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Physical Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                    <input
                      type="text"
                      name="address"
                      placeholder="Street, City, Country"
                      className="w-full pl-9 pr-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-steel-lighter">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      address: ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-steel hover:text-primary bg-white border border-steel-lighter rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;