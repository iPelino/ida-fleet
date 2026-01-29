
import React, { useState } from 'react';
import { formatCurrency } from '../services/mockData';
import { Trip, TripStatus, Currency, Payment } from '../types';
import { Badge } from './ui/Badge';
import { MapPin, Calendar, Globe, Plus, X, Save, Truck, User, DollarSign, CreditCard, ArrowRight, Search, ChevronDown, Check, AlertCircle, FileText, Edit, Trash2 } from 'lucide-react';
import { useCurrency } from '../services/currencyContext';
import DateFilter, { DateFilterValue } from './DateFilter';
import VehicleFilter from './VehicleFilter';

// Rwandan Districts
const RWANDA_DISTRICTS = [
  "Bugesera", "Burera", "Gakenke", "Gasabo", "Gatsibo", "Gicumbi", "Gisagara", "Huye",
  "Kamonyi", "Karongi", "Kayonza", "Kicukiro", "Kirehe", "Muhanga", "Musanze", "Ngoma",
  "Ngororero", "Nyabihu", "Nyagatare", "Nyamagabe", "Nyamasheke", "Nyanza", "Nyarugenge",
  "Nyaruguru", "Rubavu", "Ruhango", "Rulindo", "Rusizi", "Rutsiro", "Rwamagana"
];

// Neighboring Cities (Burundi, DRC, Tanzania, Kenya)
const NEIGHBORING_CITIES = [
  // Burundi
  "Bujumbura", "Gitega", "Ngozi", "Muyinga",
  // DRC
  "Goma", "Bukavu", "Uvira", "Kinshasa", "Lubumbashi",
  // Tanzania
  "Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Tanga",
  // Kenya
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  // Uganda (Common route)
  "Kampala", "Entebbe"
];

const Trips: React.FC = () => {
  const { convert } = useCurrency();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({
    startDate: null,
    endDate: null,
    preset: 'all',
    label: 'All Time'
  });
  const [filterVehicleId, setFilterVehicleId] = useState<string | null>(null);

  // New Shipment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<Partial<Trip>>({
    description: '',
    customerId: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    startLocation: '',
    endLocation: '',
    tripType: 'local',
    totalPrice: 0,
    currency: 'USD',
    status: 'Pending'
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsData, customersData, vehiclesData] = await Promise.all([
          import('../services/api').then(m => m.trips.getAll()),
          import('../services/api').then(m => m.customers.getAll()),
          import('../services/api').then(m => m.vehicles.getAll())
        ]);
        setTrips(tripsData);
        setCustomers(customersData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Searchable Select States
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');

  // Location Search States
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [destinationSearch, setDestinationSearch] = useState('');

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    currency: Currency;
    date: string;
    type: string;
  }>({
    amount: 0,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    type: 'Bank Transfer'
  });

  // Filter Logic
  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    // Vehicle filter
    const matchesVehicle = !filterVehicleId ||
      (t as any).vehicleId === filterVehicleId ||
      (t as any).vehicle?.id === filterVehicleId;

    // Date filter
    let matchesDate = true;
    if (dateFilter.startDate || dateFilter.endDate) {
      const tripDate = new Date(t.startDate);
      tripDate.setHours(0, 0, 0, 0);

      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        startDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && tripDate >= startDate;
      }
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && tripDate <= endDate;
      }
    }

    return matchesSearch && matchesVehicle && matchesDate;
  });

  // Filtered lists for dropdowns
  const filteredCustomersSelect = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredVehiclesSelect = vehicles.filter(v =>
    v.status === 'Active' &&
    `${v.make} ${v.model} ${v.licensePlate}`.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const selectedCustomerObj = customers.find(c => c.id === formData.customerId);
  const selectedVehicleObj = vehicles.find(v => v.id === formData.vehicleId);

  // --- Handlers for New Shipment ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalPrice' ? Number(value) : value
    }));
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      description: trip.description,
      customerId: trip.customerId || '',
      vehicleId: trip.vehicleId || '',
      startDate: trip.startDate,
      endDate: trip.endDate,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      tripType: trip.tripType,
      totalPrice: trip.totalPrice,
      currency: trip.currency,
      status: trip.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      await import('../services/api').then(m => m.trips.delete(tripId));
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (error) {
      console.error('Failed to delete trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  };

  const handleNewTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.vehicleId || !formData.description || !formData.totalPrice) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const selectedCustomer = customers.find(c => c.id === formData.customerId);

      if (editingTrip) {
        // Update existing trip
        const updatedTrip = await import('../services/api').then(m => m.trips.update(editingTrip.id, {
          customer: formData.customerId || '',
          vehicle: formData.vehicleId || '',
          description: formData.description || '',
          startDate: formData.startDate || new Date().toISOString().split('T')[0],
          endDate: formData.endDate || new Date().toISOString().split('T')[0],
          startLocation: formData.startLocation || '',
          endLocation: formData.endLocation || '',
          tripType: (formData.tripType as 'local' | 'international') || 'local',
          totalPrice: formData.totalPrice || 0,
          currency: (formData.currency as Currency) || 'USD',
          status: formData.status || 'Pending'
        } as any));

        setTrips(trips.map(t => t.id === editingTrip.id ? updatedTrip : t));
      } else {
        // Create new trip
        const newTrip = await import('../services/api').then(m => m.trips.create({
          customer: formData.customerId || '',
          vehicle: formData.vehicleId || '',
          description: formData.description || '',
          startDate: formData.startDate || new Date().toISOString().split('T')[0],
          endDate: formData.endDate || new Date().toISOString().split('T')[0],
          startLocation: formData.startLocation || '',
          endLocation: formData.endLocation || '',
          tripType: (formData.tripType as 'local' | 'international') || 'local',
          totalPrice: formData.totalPrice || 0,
          currency: (formData.currency as Currency) || 'USD',
          status: 'Pending',
          payments: []
        } as any));

        setTrips([newTrip, ...trips]);
      }

      setIsModalOpen(false);
      setEditingTrip(null);

      // Reset form
      setFormData({
        description: '',
        customerId: '',
        vehicleId: '',
        startDate: '',
        endDate: '',
        startLocation: '',
        endLocation: '',
        tripType: 'local',
        totalPrice: 0,
        currency: 'USD',
        status: 'Pending'
      });
      setCustomerSearch('');
      setVehicleSearch('');
    } catch (error: any) {
      console.error(`Failed to ${editingTrip ? 'update' : 'create'} trip:`, error);
      console.log('Error config:', error.config);
      console.log('Error response:', error.response);

      let errorMessage = `Failed to ${editingTrip ? 'update' : 'create'} trip. Please try again.`;
      if (error.response?.data) {
        errorMessage = `Error: ${JSON.stringify(error.response.data)}`;
      }
      alert(errorMessage);
    }
  };

  // --- Handlers for Payments ---

  const openPaymentModal = (trip: Trip) => {
    const paidAmount = trip.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = trip.totalPrice - paidAmount;

    setSelectedTrip(trip);
    setPaymentData({
      amount: balance, // Pre-fill with remaining balance
      currency: trip.currency,
      date: new Date().toISOString().split('T')[0],
      type: 'Bank Transfer'
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    const paidAmount = selectedTrip.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = selectedTrip.totalPrice - paidAmount;

    // Convert payment amount to trip currency for validation using global currency context
    const normalizedAmount = convert(Number(paymentData.amount), paymentData.currency, selectedTrip.currency);

    if (normalizedAmount <= 0) {
      alert("Payment amount must be greater than zero.");
      return;
    }

    // Allow small floating point error tolerance (0.01)
    if (normalizedAmount > balance + 0.01) {
      alert(`Payment exceeds balance.`);
      return;
    }

    try {
      const newPayment = await import('../services/api').then(m => m.payments.create({
        trip: selectedTrip.id,
        amount: Number(paymentData.amount),
        currency: paymentData.currency,
        date: paymentData.date,
        type: paymentData.type,
      }));

      // We need to construct the full payment object for frontend state if the backend response is minimal
      // or just use the response if it's complete.
      // Assuming backend returns the created payment object.

      const paymentForState: Payment = {
        id: newPayment.id,
        amount: Number(newPayment.amount),
        originalAmount: Number(newPayment.amount),
        currency: newPayment.currency || paymentData.currency,
        date: newPayment.date,
        type: newPayment.type
      };

      const updatedTrips = trips.map(t => {
        if (t.id === selectedTrip.id) {
          return { ...t, payments: [...t.payments, paymentForState] };
        }
        return t;
      });

      setTrips(updatedTrips);
      setIsPaymentModalOpen(false);
      setSelectedTrip(null);
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      let errorMessage = 'Failed to record payment.';
      if (error.response?.data) {
        errorMessage = `Error: ${JSON.stringify(error.response.data)}`;
      }
      alert(errorMessage);
    }
  };

  // Calculate equivalent value for display in modal
  const equivalentValue = selectedTrip && paymentData.currency !== selectedTrip.currency
    ? convert(Number(paymentData.amount), paymentData.currency, selectedTrip.currency)
    : null;

  // Trip Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewTrip, setViewTrip] = useState<Trip | null>(null);

  const openDetailsModal = (trip: Trip) => {
    setViewTrip(trip);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Shipment Tracking</h1>
          <p className="text-steel mt-1">Track shipments, payments, and live routes.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Shipment</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-steel-lighter shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search shipments by ID, customer or description..."
              className="w-full pl-4 pr-10 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-0 top-0 bottom-0 px-3 bg-primary text-white rounded-r-lg hover:bg-primary-hover">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <VehicleFilter onFilterChange={setFilterVehicleId} />
          <DateFilter onFilterChange={setDateFilter} />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTrips.map(trip => (
          <TripCard
            key={trip.id}
            trip={trip}
            onRecordPayment={() => openPaymentModal(trip)}
            onViewDetails={() => openDetailsModal(trip)}
            onEdit={() => handleEdit(trip)}
            onDelete={() => handleDelete(trip.id)}
          />
        ))}
        {filteredTrips.length === 0 && (
          <div className="text-center py-12 bg-surface rounded-xl border border-dashed border-steel-lighter">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-steel-light" />
            </div>
            <h3 className="text-lg font-medium text-primary">No shipments found</h3>
            <p className="text-steel mt-1">Try searching for a different term or create a new shipment.</p>
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      {isDetailsModalOpen && viewTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-2xl rounded-xl shadow-xl border border-steel-lighter max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-steel-lighter flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-primary">Shipment Details</h2>
                  <Badge variant={viewTrip.status === 'Delivered' ? 'delivered' : viewTrip.status === 'In Transit' ? 'transit' : 'pending'}>
                    {viewTrip.status}
                  </Badge>
                </div>
                <p className="text-sm text-steel mt-1 font-mono">{viewTrip.id}</p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-steel hover:text-primary p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Overview */}
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-steel-lighter pb-2 mb-4">Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-steel uppercase">Description</p>
                    <p className="text-primary font-medium">{viewTrip.description}</p>
                  </div>
                  <div>
                    <p className="text-xs text-steel uppercase">Type</p>
                    <p className="text-primary font-medium capitalize">{viewTrip.tripType}</p>
                  </div>
                </div>
              </div>

              {/* Route */}
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-steel-lighter pb-2 mb-4">Route & Schedule</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-primary/20"></div>
                        <div className="w-0.5 h-full bg-slate-200 mx-auto my-1"></div>
                      </div>
                      <div>
                        <p className="text-xs text-steel uppercase">Origin</p>
                        <p className="text-primary font-medium">{viewTrip.startLocation}</p>
                        <p className="text-sm text-steel">{viewTrip.startDate}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className="w-3 h-3 rounded-full bg-secondary ring-2 ring-secondary/20"></div>
                      </div>
                      <div>
                        <p className="text-xs text-steel uppercase">Destination</p>
                        <p className="text-primary font-medium">{viewTrip.endLocation}</p>
                        <p className="text-sm text-steel">{viewTrip.endDate || 'TBD'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-steel-lighter pb-2 mb-4">Resources</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-steel uppercase">Customer</p>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-steel" />
                      <p className="text-primary font-medium">{viewTrip.customerName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-steel uppercase">Vehicle</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Truck className="w-4 h-4 text-steel" />
                      <p className="text-primary font-medium">
                        {vehicles.find(v => v.id === viewTrip.vehicleId)?.licensePlate || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-steel-lighter pb-2 mb-4">Financials</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-steel">Total Value</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(viewTrip.totalPrice, viewTrip.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-steel">Paid Amount</span>
                    <span className="font-medium text-green-600">{formatCurrency(viewTrip.payments.reduce((s, p) => s + p.amount, 0), viewTrip.currency)}</span>
                  </div>
                  <div className="border-t border-steel-lighter pt-2 flex justify-between items-center">
                    <span className="font-medium text-primary">Balance Due</span>
                    <span className="font-bold text-secondary">
                      {formatCurrency(viewTrip.totalPrice - viewTrip.payments.reduce((s, p) => s + p.amount, 0), viewTrip.currency)}
                    </span>
                  </div>
                </div>

                {/* Payment History */}
                {viewTrip.payments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-steel uppercase mb-2">Payment History</p>
                    <div className="space-y-2">
                      {viewTrip.payments.map(payment => (
                        <div key={payment.id} className="flex justify-between items-center text-sm p-2 bg-white border border-steel-lighter rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="success" className="px-1.5 py-0.5 text-[10px]">Paid</Badge>
                            <span className="text-steel">{payment.date}</span>
                            <span className="text-steel-light">•</span>
                            <span className="text-primary">{payment.type}</span>
                          </div>
                          <span className="font-medium text-primary">{formatCurrency(payment.amount, viewTrip.currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-steel-lighter bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-steel hover:text-primary bg-white border border-steel-lighter rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Shipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-3xl rounded-xl shadow-xl border border-steel-lighter max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-steel-lighter flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-primary">{editingTrip ? 'Edit Shipment' : 'Create New Shipment'}</h2>
                <p className="text-sm text-steel mt-1">Enter shipment details and assign resources.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-steel hover:text-primary p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewTripSubmit} className="p-6 space-y-8">
              {/* Section 1: Logistics */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-steel-lighter pb-2">Logistics Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-primary">Description *</label>
                    <input
                      type="text"
                      name="description"
                      required
                      placeholder="e.g. Construction Materials to Musanze"
                      className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-primary">Trip Type</label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-2 text-sm text-steel cursor-pointer">
                        <input
                          type="radio"
                          name="tripType"
                          value="local"
                          checked={formData.tripType === 'local'}
                          onChange={handleInputChange}
                          className="text-primary focus:ring-primary"
                        />
                        Local
                      </label>
                      <label className="flex items-center gap-2 text-sm text-steel cursor-pointer">
                        <input
                          type="radio"
                          name="tripType"
                          value="international"
                          checked={formData.tripType === 'international'}
                          onChange={handleInputChange}
                          className="text-primary focus:ring-primary"
                        />
                        International
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-primary">Origin *</label>
                    <div className="relative z-20">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-steel-light z-10" />

                      <button
                        type="button"
                        onClick={() => setIsOriginOpen(!isOriginOpen)}
                        className="w-full pl-9 pr-8 py-2 border border-steel-lighter rounded-lg text-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary block truncate"
                      >
                        {formData.startLocation || 'Select Location'}
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-steel" />
                      </button>

                      {isOriginOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsOriginOpen(false)}></div>
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-steel-lighter rounded-lg shadow-lg overflow-hidden z-30">
                            <div className="p-2 border-b border-steel-lighter bg-slate-50">
                              <input
                                type="text"
                                className="w-full px-2 py-1.5 text-sm border border-steel-lighter rounded-md focus:outline-none focus:border-primary"
                                placeholder="Search location..."
                                autoFocus
                                value={originSearch}
                                onChange={(e) => setOriginSearch(e.target.value)}
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {(formData.tripType === 'local'
                                ? RWANDA_DISTRICTS
                                : [...RWANDA_DISTRICTS, ...NEIGHBORING_CITIES].sort()
                              ).filter(d => d.toLowerCase().includes(originSearch.toLowerCase())).map(location => (
                                <button
                                  key={location}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, startLocation: location }));
                                    setIsOriginOpen(false);
                                    setOriginSearch('');
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between group"
                                >
                                  <span className="text-primary group-hover:text-primary-hover">{location}</span>
                                  {formData.startLocation === location && <Check className="w-4 h-4 text-secondary" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-primary">Destination *</label>
                    <div className="relative z-20">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-secondary z-10" />

                      <button
                        type="button"
                        onClick={() => setIsDestinationOpen(!isDestinationOpen)}
                        className="w-full pl-9 pr-8 py-2 border border-steel-lighter rounded-lg text-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary block truncate"
                      >
                        {formData.endLocation || 'Select Location'}
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-steel" />
                      </button>

                      {isDestinationOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsDestinationOpen(false)}></div>
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-steel-lighter rounded-lg shadow-lg overflow-hidden z-30">
                            <div className="p-2 border-b border-steel-lighter bg-slate-50">
                              <input
                                type="text"
                                className="w-full px-2 py-1.5 text-sm border border-steel-lighter rounded-md focus:outline-none focus:border-primary"
                                placeholder="Search location..."
                                autoFocus
                                value={destinationSearch}
                                onChange={(e) => setDestinationSearch(e.target.value)}
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {(formData.tripType === 'local'
                                ? RWANDA_DISTRICTS
                                : [...RWANDA_DISTRICTS, ...NEIGHBORING_CITIES].sort()
                              ).filter(d => d.toLowerCase().includes(destinationSearch.toLowerCase())).map(location => (
                                <button
                                  key={location}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, endLocation: location }));
                                    setIsDestinationOpen(false);
                                    setDestinationSearch('');
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between group"
                                >
                                  <span className="text-primary group-hover:text-primary-hover">{location}</span>
                                  {formData.endLocation === location && <Check className="w-4 h-4 text-secondary" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-primary">Start Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                      <input
                        type="date"
                        name="startDate"
                        required
                        className="w-full pl-9 pr-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-steel"
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-primary">Est. End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                      <input
                        type="date"
                        name="endDate"
                        className="w-full pl-9 pr-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-steel"
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Resources */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-steel-lighter pb-2">Resources</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Customer Searchable Select */}
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-primary">Customer *</label>

                    {isCustomerOpen && (
                      <div className="fixed inset-0 z-10" onClick={() => setIsCustomerOpen(false)}></div>
                    )}

                    <div className="relative z-20">
                      <button
                        type="button"
                        onClick={() => setIsCustomerOpen(!isCustomerOpen)}
                        className="w-full pl-9 pr-8 py-2 border border-steel-lighter rounded-lg text-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary flex items-center"
                      >
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                        <span className={`block truncate ${!selectedCustomerObj ? 'text-steel-light' : 'text-primary'}`}>
                          {selectedCustomerObj ? selectedCustomerObj.name : 'Select Customer'}
                        </span>
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-steel" />
                      </button>

                      {isCustomerOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-steel-lighter rounded-lg shadow-lg overflow-hidden z-30">
                          <div className="p-2 border-b border-steel-lighter bg-slate-50">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 w-3 h-3 text-steel" />
                              <input
                                type="text"
                                className="w-full pl-7 pr-2 py-1.5 text-sm border border-steel-lighter rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                placeholder="Search customers..."
                                autoFocus
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCustomersSelect.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, customerId: c.id }));
                                  setIsCustomerOpen(false);
                                  setCustomerSearch('');
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
                              >
                                <span className="font-medium text-primary group-hover:text-primary-hover">{c.name}</span>
                                {formData.customerId === c.id && (
                                  <Check className="w-4 h-4 text-secondary" />
                                )}
                              </button>
                            ))}
                            {filteredCustomersSelect.length === 0 && (
                              <div className="p-4 text-center text-xs text-steel">
                                No customers found.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Searchable Select */}
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-primary">Assign Vehicle *</label>

                    {isVehicleOpen && (
                      <div className="fixed inset-0 z-10" onClick={() => setIsVehicleOpen(false)}></div>
                    )}

                    <div className="relative z-20">
                      <button
                        type="button"
                        onClick={() => setIsVehicleOpen(!isVehicleOpen)}
                        className="w-full pl-9 pr-8 py-2 border border-steel-lighter rounded-lg text-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary flex items-center"
                      >
                        <Truck className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                        <span className={`block truncate ${!selectedVehicleObj ? 'text-steel-light' : 'text-primary'}`}>
                          {selectedVehicleObj
                            ? `${selectedVehicleObj.make} ${selectedVehicleObj.model} (${selectedVehicleObj.licensePlate})`
                            : 'Select Vehicle'
                          }
                        </span>
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-steel" />
                      </button>

                      {isVehicleOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-steel-lighter rounded-lg shadow-lg overflow-hidden z-30">
                          <div className="p-2 border-b border-steel-lighter bg-slate-50">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 w-3 h-3 text-steel" />
                              <input
                                type="text"
                                className="w-full pl-7 pr-2 py-1.5 text-sm border border-steel-lighter rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                placeholder="Search vehicle..."
                                autoFocus
                                value={vehicleSearch}
                                onChange={(e) => setVehicleSearch(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredVehiclesSelect.map(v => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, vehicleId: v.id }));
                                  setIsVehicleOpen(false);
                                  setVehicleSearch('');
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium text-primary group-hover:text-primary-hover">{v.make} {v.model}</span>
                                  <span className="text-xs text-steel font-mono">{v.licensePlate}</span>
                                </div>
                                {formData.vehicleId === v.id && (
                                  <Check className="w-4 h-4 text-secondary" />
                                )}
                              </button>
                            ))}
                            {filteredVehiclesSelect.length === 0 && (
                              <div className="p-4 text-center text-xs text-steel">
                                No available vehicles found.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Financials */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-steel-lighter pb-2">Financials</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-primary">Quoted Price *</label>
                    <div className="flex gap-2">
                      <select
                        name="currency"
                        className="w-24 px-2 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-medium text-primary"
                        value={formData.currency}
                        onChange={handleInputChange}
                      >
                        <option value="USD">USD</option>
                        <option value="RWF">RWF</option>
                        <option value="EUR">EUR</option>
                      </select>
                      <div className="flex-1 relative">
                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                        <input
                          type="number"
                          name="totalPrice"
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-9 pr-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          value={formData.totalPrice || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-steel-lighter">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-steel hover:text-primary bg-white border border-steel-lighter rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-xl shadow-xl border border-steel-lighter">
            <div className="p-6 border-b border-steel-lighter flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-primary">Record Payment</h2>
                <p className="text-sm text-steel mt-1">Add a payment for shipment {selectedTrip.id}.</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-steel hover:text-primary p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Outstanding Balance</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(
                    selectedTrip.totalPrice - selectedTrip.payments.reduce((s, p) => s + p.amount, 0),
                    selectedTrip.currency
                  )}
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Payment Amount *</label>
                  <div className="flex gap-2">
                    <select
                      name="currency"
                      className="w-24 px-2 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-medium text-primary"
                      value={paymentData.currency}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, currency: e.target.value as Currency }))}
                    >
                      <option value="USD">USD</option>
                      <option value="RWF">RWF</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <div className="flex-1 relative">
                      <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-9 pr-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        value={paymentData.amount || ''}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  {/* Currency Conversion Warning/Info */}
                  {equivalentValue !== null && paymentData.currency !== selectedTrip.currency && (
                    <p className="text-xs text-steel mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Equivalent to approx. {formatCurrency(equivalentValue, selectedTrip.currency)}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Payment Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                    <input
                      type="date"
                      required
                      className="w-full pl-9 pr-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-steel"
                      value={paymentData.date}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Payment Method</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-steel-light" />
                    <select
                      className="w-full pl-9 pr-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                      value={paymentData.type}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Check">Check</option>
                      <option value="Cash">Cash</option>
                      <option value="Wire">International Wire</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-steel-lighter">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-steel hover:text-primary bg-white border border-steel-lighter rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TripCard: React.FC<{ trip: Trip; onRecordPayment: () => void; onViewDetails: () => void; onEdit: () => void; onDelete: () => void }> = ({ trip, onRecordPayment, onViewDetails, onEdit, onDelete }) => {
  const paidAmount = trip.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = trip.totalPrice - paidAmount;
  const isPaid = balance <= 0.01; // Tolerance for floating point

  const getProgressWidth = () => {
    switch (trip.status) {
      case 'Pending': return '5%';
      case 'In Transit': return '50%';
      case 'Delivered': return '100%';
      default: return '0%';
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-steel-lighter shadow-sm hover:shadow-md transition-all group">
      <div className="p-5">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-xs font-medium text-steel bg-slate-50 px-2 py-1 rounded border border-steel-lighter">
                {trip.id}
              </span>
              <Badge variant={
                trip.status === 'Delivered' ? 'delivered' :
                  trip.status === 'In Transit' ? 'transit' : 'pending'
              }>
                {trip.status}
              </Badge>
              {trip.tripType === 'international' && (
                <Badge variant="info" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Intl
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-lg text-primary">{trip.description}</h3>
            <p className="text-sm text-steel flex items-center gap-2 mt-1">
              <User className="w-3.5 h-3.5" />
              {trip.customerName}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-steel mb-1">Total Value</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(trip.totalPrice, trip.currency)}</p>
          </div>
        </div>

        {/* Route Visualization (Widget Style) */}
        <div className="my-6 relative px-2">
          <div className="h-1 bg-slate-100 rounded-full w-full absolute top-1.5 left-0"></div>
          <div
            className="h-1 bg-primary rounded-full absolute top-1.5 left-0 transition-all duration-500"
            style={{ width: getProgressWidth() }}
          ></div>

          <div className="flex justify-between relative">
            <div className="flex flex-col items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm z-10"></div>
              <div className="text-xs">
                <p className="font-bold text-primary">{trip.startLocation}</p>
                <p className="text-steel">{trip.startDate}</p>
              </div>
            </div>

            {trip.status !== 'Pending' && (
              <div className="flex flex-col items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${trip.status === 'Delivered' ? 'bg-primary' : 'bg-secondary animate-pulse'
                  }`}></div>
                <div className="text-xs text-center">
                  <p className="font-bold text-secondary">In Transit</p>
                </div>
              </div>
            )}

            <div className="flex flex-col items-end gap-2">
              <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${trip.status === 'Delivered' ? 'bg-primary' : 'bg-slate-200'
                }`}></div>
              <div className="text-xs text-right">
                <p className={`font-bold ${trip.status === 'Delivered' ? 'text-primary' : 'text-steel-light'}`}>
                  {trip.endLocation}
                </p>
                <p className="text-steel">{trip.endDate || 'Est. --'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions & Financials */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div>
              <p className="text-xs text-steel uppercase font-medium">Paid</p>
              <p className="text-sm font-bold text-green-600">{formatCurrency(paidAmount, trip.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-steel uppercase font-medium">Balance</p>
              <p className={`text-sm font-bold ${balance > 0 ? 'text-secondary' : 'text-steel'}`}>
                {formatCurrency(balance, trip.currency)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {!isPaid && (
              <button
                onClick={onRecordPayment}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg text-sm font-medium transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Record Payment
              </button>
            )}
            <button
              onClick={onViewDetails}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-steel-lighter text-steel hover:text-primary hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              Details
            </button>
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-steel-lighter text-primary hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trips;
