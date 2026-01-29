
import React, { useState } from 'react';
import { Expense, Currency, User } from '../types';
import { Badge } from './ui/Badge';
import { Plus, Filter, Search, Calendar, FileText, Truck, MapPin, Fuel, Wrench, Receipt, X, Save, DollarSign, ChevronDown, Check, PenTool, Trash2, Paperclip, Upload } from 'lucide-react';
import { useCurrency } from '../services/currencyContext';
import DateFilter, { DateFilterValue } from './DateFilter';
import VehicleFilter from './VehicleFilter';

const Expenses: React.FC = () => {
  const { convert, format, displayCurrency } = useCurrency();

  // Data State
  // Data State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesData, vehiclesData, tripsData, categoriesData, currentUserData] = await Promise.all([
          import('../services/api').then(m => m.expenses.getAll()),
          import('../services/api').then(m => m.vehicles.getAll()),
          import('../services/api').then(m => m.trips.getAll()),
          import('../services/api').then(m => m.expenseCategories.getAll()),
          import('../services/api').then(m => m.auth.getCurrentUser().catch(() => null))
        ]);
        console.log('Fetched categories:', categoriesData);
        setExpenses(expensesData);
        setVehicles(vehiclesData);
        setTrips(tripsData);
        setCategories(categoriesData);
        setCurrentUser(currentUserData as User | null);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({
    startDate: null,
    endDate: null,
    preset: 'all',
    label: 'All Time'
  });
  const [filterVehicleId, setFilterVehicleId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Expense>>({
    expenseType: 'vehicle',
    vehicleId: '',
    tripId: '',
    category: 'Fuel',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: 'USD',
    description: ''
  });

  // Vehicle Search Select State
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');

  // Trip Search Select State
  const [isTripOpen, setIsTripOpen] = useState(false);
  const [tripSearch, setTripSearch] = useState('');

  // Receipt File State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | null>(null);

  // --- Filtering Logic ---
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = (e.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (e.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || e.category === filterCategory;
    const matchesType = filterType === 'All' || e.expenseType === filterType;

    // Vehicle filter
    const matchesVehicle = !filterVehicleId || e.vehicleId === filterVehicleId;

    // Date filter
    let matchesDate = true;
    if (dateFilter.startDate || dateFilter.endDate) {
      const expenseDate = new Date(e.date);
      expenseDate.setHours(0, 0, 0, 0);

      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        startDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && expenseDate >= startDate;
      }
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && expenseDate <= endDate;
      }
    }

    return matchesSearch && matchesCategory && matchesType && matchesVehicle && matchesDate;
  });

  // --- Calculations (Dynamic Currency) ---
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + convert(e.amount, e.currency), 0);
  const fuelTotal = filteredExpenses.filter(e => e.category === 'Fuel').reduce((sum, e) => sum + convert(e.amount, e.currency), 0);
  const maintTotal = filteredExpenses.filter(e => e.category === 'Maintenance').reduce((sum, e) => sum + convert(e.amount, e.currency), 0);

  // --- Helpers ---
  const getVehicleName = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.make} ${v.model} (${v.licensePlate})` : 'Unknown Vehicle';
  };

  const getTripDesc = (id?: string) => {
    if (!id) return null;
    const t = trips.find(t => t.id === id);
    return t ? t.description : id;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fuel': return <Fuel className="w-4 h-4 text-orange-600" />;
      case 'Maintenance': return <Wrench className="w-4 h-4 text-slate-600" />;
      case 'Insurance': return <FileText className="w-4 h-4 text-blue-600" />;
      default: return <Receipt className="w-4 h-4 text-slate-600" />;
    }
  };

  // --- Form Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
      // Reset trip selection if vehicle changes
      ...(name === 'vehicleId' ? { tripId: '' } : {})
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload an image (JPG, PNG, GIF) or PDF file.');
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.amount || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Build FormData for file upload support
      const submitData = new FormData();
      submitData.append('date', formData.date || new Date().toISOString().split('T')[0]);
      submitData.append('vehicle', formData.vehicleId || '');
      if (formData.expenseType === 'trip' && formData.tripId) {
        submitData.append('trip', formData.tripId);
      }
      submitData.append('expenseType', formData.expenseType || 'vehicle');
      submitData.append('category', formData.category || 'Other');
      submitData.append('amount', String(formData.amount || 0));
      submitData.append('currency', formData.currency || 'USD');
      submitData.append('description', formData.description || '');

      // Append file if selected
      if (receiptFile) {
        submitData.append('receipt_file', receiptFile);
      }

      if (isEditMode && editingId) {
        // Update existing expense
        const updatedExpense: any = await import('../services/api').then(m => m.expenses.update(editingId, submitData));
        setExpenses(expenses.map(e => e.id === editingId ? { ...e, ...updatedExpense, vehicleId: String(updatedExpense.vehicle || e.vehicleId), tripId: updatedExpense.trip ? String(updatedExpense.trip) : e.tripId } : e));
      } else {
        // Create new expense
        const newExpense: any = await import('../services/api').then(m => m.expenses.create(submitData));
        setExpenses([{ ...newExpense, vehicleId: String(newExpense.vehicle), tripId: newExpense.trip ? String(newExpense.trip) : undefined }, ...expenses]);
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingId(null);

      // Reset Form
      setFormData({
        expenseType: 'vehicle',
        vehicleId: '',
        tripId: '',
        category: 'Fuel',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        currency: 'USD',
        description: ''
      });
      setVehicleSearch('');
      setTripSearch('');
      setReceiptFile(null);
      setExistingReceiptUrl(null);
    } catch (error: any) {
      console.error('Failed to save expense:', error);
      console.log('Error config:', error.config);
      console.log('Error response:', error.response);

      let errorMessage = 'Failed to save expense. Please try again.';
      if (error.response?.data) {
        errorMessage = `Error: ${JSON.stringify(error.response.data)}`;
      }
      alert(errorMessage);
    }
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      expenseType: expense.expenseType,
      vehicleId: expense.vehicleId,
      tripId: expense.tripId,
      category: expense.category,
      date: expense.date,
      amount: expense.amount,
      currency: expense.currency,
      description: expense.description
    });
    setEditingId(expense.id);
    setIsEditMode(true);
    setIsModalOpen(true);
    setReceiptFile(null);
    setExistingReceiptUrl(expense.receipt_file_url || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await import('../services/api').then(m => m.expenses.delete(id));
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const updated = await import('../services/api').then(m => m.expenses.approve(id));
      // Update local state keeping other fields that might not be in response if not full object
      // Assuming updated returns the full object or we merge
      setExpenses(expenses.map(e => e.id === id ? { ...e, ...updated, vehicleId: String(updated.vehicleId || e.vehicleId) } : e));
    } catch (error) {
      alert('Failed to approve expense');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return; // Cancelled

    try {
      const updated = await import('../services/api').then(m => m.expenses.reject(id, reason));
      setExpenses(expenses.map(e => e.id === id ? { ...e, ...updated, vehicleId: String(updated.vehicleId || e.vehicleId) } : e));
    } catch (error) {
      alert('Failed to reject expense');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400">Approved</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-400">Rejected</span>;
      default: return <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded border border-amber-400">Pending</span>;
    }
  };

  const filteredVehiclesSelect = vehicles.filter(v =>
    `${v.make} ${v.model} ${v.licensePlate}`.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const availableTrips = trips.filter(t => t.vehicleId === formData.vehicleId);
  const filteredTripsSelect = availableTrips.filter(t =>
    `${t.description} ${t.id}`.toLowerCase().includes(tripSearch.toLowerCase())
  );

  const selectedVehicleObj = vehicles.find(v => v.id === formData.vehicleId);
  const selectedTripObj = trips.find(t => t.id === formData.tripId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Expense Management</h1>
          <p className="text-steel mt-1">Viewing costs in <span className="font-bold text-primary">{displayCurrency}</span>.</p>
        </div>
        <button
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Log Expense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-5 rounded-xl border border-steel-lighter shadow-sm">
          <p className="text-sm font-medium text-steel uppercase tracking-wider mb-2">Total Expenses</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-primary">{format(totalAmount)}</h3>
          </div>
          <div className="mt-3 text-xs text-steel bg-slate-50 inline-block px-2 py-1 rounded">
            Based on current filters
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-steel-lighter shadow-sm">
          <p className="text-sm font-medium text-steel uppercase tracking-wider mb-2">Fuel Costs</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-secondary">{format(fuelTotal)}</h3>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${totalAmount ? (fuelTotal / totalAmount) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-steel-lighter shadow-sm">
          <p className="text-sm font-medium text-steel uppercase tracking-wider mb-2">Maintenance</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-primary">{format(maintTotal)}</h3>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${totalAmount ? (maintTotal / totalAmount) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface p-4 rounded-xl border border-steel-lighter shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search description, category..."
            className="w-full pl-4 pr-10 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-0 top-0 bottom-0 px-3 bg-primary text-white rounded-r-lg hover:bg-primary-hover">
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-steel" />
            <select
              className="border border-steel-lighter rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-steel bg-white"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              {/* Fallback for hardcoded if API fails or empty */}
              {categories.length === 0 && (
                <>
                  <option value="Fuel">Fuel</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Tolls">Road Tolls</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>

          <select
            className="border border-steel-lighter rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-steel bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="vehicle">Vehicle Only</option>
            <option value="trip">Trip Related</option>
          </select>

          <VehicleFilter onFilterChange={setFilterVehicleId} />
          <DateFilter onFilterChange={setDateFilter} />
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.map(expense => (
          <div key={expense.id} className="bg-surface p-4 rounded-xl border border-steel-lighter shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 md:items-center justify-between group">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-steel-lighter flex items-center justify-center shrink-0">
                {getCategoryIcon(expense.category)}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-primary">{expense.category}</h4>
                  <Badge variant={expense.expenseType === 'trip' ? 'brand' : 'outline'}>
                    {expense.expenseType === 'trip' ? 'Trip' : 'Vehicle'}
                  </Badge>
                </div>
                <p className="text-sm text-steel mb-1">{expense.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-steel mt-1">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-steel-lighter">
                    <Truck className="w-3 h-3" />
                    {getVehicleName(expense.vehicleId)}
                  </span>
                  {expense.tripId && (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                      <MapPin className="w-3 h-3" />
                      {getTripDesc(expense.tripId)}
                    </span>
                  )}
                  {expense.receipt_file_url && (
                    <a
                      href={expense.receipt_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100 hover:bg-green-100 transition-colors"
                    >
                      <Paperclip className="w-3 h-3" />
                      Receipt
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-2 pl-16 md:pl-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
              <div className="flex items-center gap-2 text-sm text-steel">
                <Calendar className="w-3 h-3" />
                {expense.date}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  {/* Converted Amount */}
                  <span className="text-lg font-bold text-secondary block">
                    -{format(convert(expense.amount, expense.currency))}
                  </span>
                  {/* Original Amount Hint if different */}
                  {displayCurrency !== expense.currency && (
                    <span className="text-xs text-steel-light">
                      ({expense.currency} {expense.amount})
                    </span>
                  )}
                  <div className="mt-1 flex justify-end">
                    {getStatusBadge(expense.status || 'PENDING')}
                  </div>
                  {expense.status === 'PENDING' && (currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
                    <div className="flex gap-2 mt-2 justify-end">
                      <button onClick={() => handleApprove(expense.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Approve</button>
                      <button onClick={() => handleReject(expense.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Reject</button>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 text-steel hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <PenTool className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-steel hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* (Modal code logic remains same as previous but using clean code patterns, hidden for brevity as requested structure) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-2xl rounded-xl shadow-xl border border-steel-lighter max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-steel-lighter flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-primary">Log New Expense</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-steel" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form fields here, simplified for brevity as logic is identical to previous iteration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Select */}
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-medium text-primary">Vehicle</label>
                  <div className="relative z-20">
                    <button type="button" onClick={() => setIsVehicleOpen(!isVehicleOpen)} className="w-full pl-3 pr-8 py-2 border border-steel-lighter rounded-lg text-sm text-left flex items-center justify-between">
                      <span>{selectedVehicleObj ? selectedVehicleObj.licensePlate : 'Select Vehicle'}</span>
                      <ChevronDown className="w-4 h-4 text-steel" />
                    </button>
                    {isVehicleOpen && (
                      <div className="absolute top-full w-full bg-white border border-steel-lighter shadow-lg z-30 max-h-40 overflow-y-auto">
                        {filteredVehiclesSelect.map(v => (
                          <div key={v.id} onClick={() => { setFormData(p => ({ ...p, vehicleId: v.id })); setIsVehicleOpen(false); }} className="p-2 hover:bg-slate-50 cursor-pointer text-sm">
                            {v.make} - {v.licensePlate}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount & Currency */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Amount</label>
                  <div className="flex gap-2">
                    <select name="currency" className="border border-steel-lighter rounded-lg px-2 text-sm" value={formData.currency} onChange={handleInputChange}>
                      <option value="USD">USD</option>
                      <option value="RWF">RWF</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <input type="number" name="amount" className="w-full border border-steel-lighter rounded-lg px-3 py-2 text-sm" value={formData.amount} onChange={handleInputChange} />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Date</label>
                  <input type="date" name="date" className="w-full border border-steel-lighter rounded-lg px-3 py-2 text-sm" value={formData.date} onChange={handleInputChange} />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Category</label>
                  <select name="category" className="w-full border border-steel-lighter rounded-lg px-3 py-2 text-sm" value={formData.category} onChange={handleInputChange}>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {categories.length === 0 && (
                      <>
                        <option value="Fuel">Fuel</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-primary">Description (Optional)</label>
                  <textarea
                    name="description"
                    className="w-full border border-steel-lighter rounded-lg px-3 py-2 text-sm h-20 resize-none"
                    placeholder="Add details about this expense..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Receipt Upload */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-primary">Receipt (Optional)</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 border border-steel-lighter rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <Upload className="w-4 h-4 text-steel" />
                        <span className="text-sm text-steel">
                          {receiptFile ? receiptFile.name : 'Choose file'}
                        </span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.pdf,image/*,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {receiptFile && (
                        <button
                          type="button"
                          onClick={() => setReceiptFile(null)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {existingReceiptUrl && !receiptFile && (
                      <div className="flex items-center gap-2 text-sm text-steel">
                        <Paperclip className="w-4 h-4" />
                        <a
                          href={existingReceiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View current receipt
                        </a>
                      </div>
                    )}
                    <p className="text-xs text-steel-light">Accepted: JPG, PNG, GIF, PDF</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
