


import React, { useState } from 'react';
import { useCurrency } from '../services/currencyContext';
import { MOCK_USERS, MOCK_REMINDERS, MOCK_VEHICLES } from '../services/mockData';
import { User, Role, Reminder, ReminderType, ReminderStatus } from '../types';
import { Save, RefreshCw, DollarSign, Globe, TrendingUp, Users, Plus, Shield, Mail, MoreVertical, Trash2, X, Bell, Calendar, CheckCircle, Clock, ChevronDown, Check, Search, AlertCircle } from 'lucide-react';
import { Badge } from './ui/Badge';

interface SettingsProps {
  userRole: Role;
}

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  // Currency Context
  const { exchangeRates, updateRate } = useCurrency();
  const [rates, setRates] = useState(exchangeRates);
  const [isRatesSaved, setIsRatesSaved] = useState(false);

  // View State
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'reminders'>('general');

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'employee' as Role,
    password: ''
  });

  // Fetch users and roles on mount
  React.useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
      fetchRoles();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const data = await import('../services/api').then(m => m.users.getAll());
      // Filter out admins if current user is manager
      const filteredUsers = userRole === 'manager'
        ? data.filter(u => u.role !== 'admin')
        : data;
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await import('../services/api').then(m => m.users.getRoles());
      // Filter out admin role if current user is manager
      const filteredRoles = userRole === 'manager'
        ? data.filter(r => r.value !== 'admin')
        : data;
      setRoles(filteredRoles);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };

  // Reminders State
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    vehicleId: '',
    title: '',
    type: 'Insurance',
    dueDate: '',
    notes: '',
    emailNotification: false,
    status: 'Pending'
  });
  // Searchable Select State for Reminder Modal
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');


  // --- Handlers: Rates ---
  const handleRateChange = (currency: 'RWF' | 'EUR', value: string) => {
    setRates(prev => ({
      ...prev,
      [currency]: parseFloat(value) || 0
    }));
    setIsRatesSaved(false);
  };

  const handleSaveRates = () => {
    updateRate('RWF', rates.RWF);
    updateRate('EUR', rates.EUR);
    setIsRatesSaved(true);
    setTimeout(() => setIsRatesSaved(false), 3000);
  };

  // --- Handlers: Users ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;

    try {
      const api = await import('../services/api');
      await api.users.create({
        first_name: newUser.name.split(' ')[0],
        last_name: newUser.name.split(' ').slice(1).join(' '),
        email: newUser.email,
        role: newUser.role,
        password: newUser.password
      });

      await fetchUsers();
      setIsUserModalOpen(false);
      setNewUser({ name: '', email: '', role: 'employee', password: '' });
    } catch (error) {
      console.error("Failed to create user", error);
      alert("Failed to create user. Please try again.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const api = await import('../services/api');
        await api.users.delete(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error("Failed to delete user", error);
        alert("Failed to delete user.");
      }
    }
  };

  // --- Handlers: Reminders ---
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.vehicleId || !newReminder.title || !newReminder.dueDate) return;

    const reminder: Reminder = {
      id: `r${Date.now()}`,
      vehicleId: newReminder.vehicleId,
      title: newReminder.title,
      type: newReminder.type as ReminderType,
      dueDate: newReminder.dueDate,
      notes: newReminder.notes,
      emailNotification: newReminder.emailNotification || false,
      status: 'Pending'
    };

    setReminders([...reminders, reminder]);
    setIsReminderModalOpen(false);
    setNewReminder({
      vehicleId: '',
      title: '',
      type: 'Insurance',
      dueDate: '',
      notes: '',
      emailNotification: false,
      status: 'Pending'
    });
  };

  const handleToggleReminderStatus = (id: string) => {
    setReminders(reminders.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: r.status === 'Pending' || r.status === 'Overdue' ? 'Completed' : 'Pending'
        };
      }
      return r;
    }));
  };

  const handleDeleteReminder = (id: string) => {
    if (confirm('Delete this reminder?')) {
      setReminders(reminders.filter(r => r.id !== id));
    }
  };

  // Filtered vehicles for searchable select
  const filteredVehicles = MOCK_VEHICLES.filter(v =>
    `${v.make} ${v.model} ${v.licensePlate}`.toLowerCase().includes(vehicleSearch.toLowerCase())
  );
  const selectedVehicleObj = MOCK_VEHICLES.find(v => v.id === newReminder.vehicleId);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">System Settings</h1>
          <p className="text-steel mt-1">Configure global application parameters and access.</p>
        </div>

        {/* Tabs */}
        <div className="bg-white p-1 rounded-lg border border-steel-lighter flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'general'
              ? 'bg-primary text-white shadow-sm'
              : 'text-steel hover:text-primary hover:bg-slate-50'
              }`}
          >
            General & Rates
          </button>

          {(userRole === 'admin' || userRole === 'manager') && (
            <>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'users'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-steel hover:text-primary hover:bg-slate-50'
                  }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'reminders'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-steel hover:text-primary hover:bg-slate-50'
                  }`}
              >
                Reminders
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'general' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Exchange Rate Card */}
          <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-steel-lighter pb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-primary">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">Exchange Rates</h3>
                <p className="text-xs text-steel">Base Currency: USD ($)</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-steel-lighter text-sm text-steel mb-4">
                <p>Rates are used to convert expenses and income across the dashboard. Updates apply immediately.</p>
              </div>

              {/* USD (Base) */}
              <div className="flex items-center justify-between p-3 border border-steel-lighter rounded-lg bg-slate-50 opacity-75">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                    $
                  </div>
                  <span className="font-medium text-primary">USD (United States Dollar)</span>
                </div>
                <span className="font-mono font-bold text-steel">1.00</span>
              </div>

              {/* RWF */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary flex justify-between">
                  <span>RWF (Rwandan Franc)</span>
                  <span className="text-xs text-steel">1 USD = {rates.RWF} RWF</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    RWF
                  </div>
                  <input
                    type="number"
                    value={rates.RWF}
                    onChange={(e) => handleRateChange('RWF', e.target.value)}
                    className="w-full pl-14 pr-4 py-3 border border-steel-lighter rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-primary"
                  />
                </div>
              </div>

              {/* EUR */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary flex justify-between">
                  <span>EUR (Euro)</span>
                  <span className="text-xs text-steel">1 USD = {rates.EUR} EUR</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    €
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={rates.EUR}
                    onChange={(e) => handleRateChange('EUR', e.target.value)}
                    className="w-full pl-14 pr-4 py-3 border border-steel-lighter rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-primary"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                {isRatesSaved ? (
                  <span className="text-sm text-green-600 font-medium flex items-center gap-2 animate-in fade-in">
                    <TrendingUp className="w-4 h-4" /> Rates Updated!
                  </span>
                ) : (
                  <span></span>
                )}
                <button
                  onClick={handleSaveRates}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Rates
                </button>
              </div>
            </div>
          </div>

          {/* Placeholder for future settings */}
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm opacity-60">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-steel" />
                <h3 className="font-bold text-primary">Localization</h3>
              </div>
              <p className="text-sm text-steel">Region and language settings are currently managed by the browser.</p>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm opacity-60">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-steel" />
                <h3 className="font-bold text-primary">Tax Configuration</h3>
              </div>
              <p className="text-sm text-steel">Tax rules and automated invoicing features coming in v2.0.</p>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' && (userRole === 'admin' || userRole === 'manager') ? (
        /* User Management Tab - Admin Only */
        <div className="bg-surface rounded-xl border border-steel-lighter shadow-sm overflow-hidden">
          <div className="p-6 border-b border-steel-lighter flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-primary">Team Members</h3>
              <p className="text-sm text-steel">Manage user access and roles.</p>
            </div>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-steel border-b border-steel-lighter">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-9 h-9 rounded-full border border-steel-lighter"
                        />
                        <div>
                          <p className="font-bold text-primary">{user.name}</p>
                          <p className="text-xs text-steel flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                          <Badge variant="brand" className="pl-1 pr-2">
                            <Shield className="w-3 h-3 mr-1" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="pl-1 pr-2">
                            <Users className="w-3 h-3 mr-1" /> Employee
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'admin' || users.filter(u => u.role === 'admin').length > 1 ? (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-steel hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-steel-light italic">Cannot delete last admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'reminders' && (userRole === 'admin' || userRole === 'manager') ? (
        /* Reminders Management Tab - Admin Only */
        <div className="bg-surface rounded-xl border border-steel-lighter shadow-sm overflow-hidden">
          <div className="p-6 border-b border-steel-lighter flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-primary">Fleet Reminders</h3>
              <p className="text-sm text-steel">Configure vehicle alerts and service schedules.</p>
            </div>
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-steel border-b border-steel-lighter">
                <tr>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Reminder Details</th>
                  <th className="px-6 py-3 font-medium">Vehicle</th>
                  <th className="px-6 py-3 font-medium">Due Date</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reminders.map(reminder => {
                  const vehicle = MOCK_VEHICLES.find(v => v.id === reminder.vehicleId);
                  const isOverdue = new Date(reminder.dueDate) < new Date() && reminder.status !== 'Completed';
                  const status = isOverdue ? 'Overdue' : reminder.status;

                  return (
                    <tr key={reminder.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Badge variant={status === 'Completed' ? 'success' : status === 'Overdue' ? 'danger' : 'warning'}>
                          {status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{reminder.title}</span>
                          <span className="text-xs text-steel flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${reminder.type === 'Insurance' ? 'bg-blue-500' : reminder.type === 'Service' ? 'bg-orange-500' : 'bg-slate-400'}`}></span>
                            {reminder.type}
                            {reminder.emailNotification && <Bell className="w-3 h-3 ml-1 text-secondary" />}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-primary">{vehicle?.licensePlate || 'Unknown'}</p>
                          <p className="text-xs text-steel">{vehicle?.make} {vehicle?.model}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-steel">
                          <Calendar className="w-4 h-4 text-steel-light" />
                          {new Date(reminder.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleReminderStatus(reminder.id)}
                          className={`p-2 rounded-full transition-colors ${reminder.status === 'Completed'
                            ? 'text-green-600 bg-green-50 hover:bg-green-100'
                            : 'text-steel hover:text-green-600 hover:bg-green-50'
                            }`}
                          title={reminder.status === 'Completed' ? "Mark as Pending" : "Mark as Completed"}
                        >
                          {reminder.status === 'Completed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="text-steel hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {reminders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-steel">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-steel-light" />
                      <p>No reminders configured.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Add User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-xl shadow-xl border border-steel-lighter">
            <div className="p-6 border-b border-steel-lighter flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-primary">Add Team Member</h2>
                <p className="text-sm text-steel mt-1">Create a new account for an employee.</p>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-steel hover:text-primary p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@idalogistics.com"
                  className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary">Role</label>
                <select
                  className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <p className="text-xs text-steel">
                  {newUser.role === 'admin'
                    ? 'Admins can manage users, view all reports, and delete records.'
                    : 'Employees can manage fleets, shipments, and customers, but cannot view financial reports.'}
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-steel hover:text-primary bg-white border border-steel-lighter rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-lg rounded-xl shadow-xl border border-steel-lighter max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-steel-lighter flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-primary">Add New Reminder</h2>
                <p className="text-sm text-steel mt-1">Set up a new reminder for your fleet</p>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="text-steel hover:text-primary p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="p-6 space-y-6">

              {/* Vehicle Select */}
              <div className="space-y-1.5 relative">
                <label className="text-sm font-medium text-primary">Vehicle *</label>
                <div className="relative z-20">
                  <button
                    type="button"
                    onClick={() => setIsVehicleOpen(!isVehicleOpen)}
                    className="w-full pl-3 pr-8 py-2 border border-steel-lighter rounded-lg text-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary flex items-center"
                  >
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
                        {filteredVehicles.map(v => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setNewReminder(prev => ({ ...prev, vehicleId: v.id }));
                              setIsVehicleOpen(false);
                              setVehicleSearch('');
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-primary group-hover:text-primary-hover">{v.make} {v.model}</span>
                              <span className="text-xs text-steel font-mono">{v.licensePlate}</span>
                            </div>
                            {newReminder.vehicleId === v.id && (
                              <Check className="w-4 h-4 text-secondary" />
                            )}
                          </button>
                        ))}
                        {filteredVehicles.length === 0 && (
                          <div className="p-4 text-center text-xs text-steel">
                            No vehicles found.
                          </div>
                        )}
                      </div>
                      {/* Overlay to close */}
                      <div className="fixed inset-0 z-[-1]" onClick={() => setIsVehicleOpen(false)}></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Insurance Renewal"
                  className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50/50"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Type *</label>
                  <select
                    className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                    value={newReminder.type}
                    onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as ReminderType })}
                  >
                    <option value="Insurance">Insurance</option>
                    <option value="Service">Service</option>
                    <option value="License">License</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Due Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50/50"
                      value={newReminder.dueDate}
                      onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                    />
                    <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-steel-light pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional notes or details"
                  className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50/50"
                  value={newReminder.notes}
                  onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
                />
              </div>

              {/* Email Notifications Toggle */}
              <div className="bg-slate-50 p-4 rounded-xl border border-steel-lighter flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-steel" />
                  <div>
                    <p className="text-sm font-bold text-primary">Email Notifications</p>
                    <p className="text-xs text-steel">Get reminded before the due date</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNewReminder(prev => ({ ...prev, emailNotification: !prev.emailNotification }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${newReminder.emailNotification ? 'bg-primary' : 'bg-slate-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newReminder.emailNotification ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-steel-lighter">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-steel hover:text-primary bg-white border border-steel-lighter rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                >
                  Add Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;