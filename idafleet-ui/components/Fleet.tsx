
import React, { useState } from 'react';

import { Vehicle, VehicleStatus } from '../types';
import { Badge } from './ui/Badge';
import { Search, Filter, Plus, PenTool, Trash2, MoreVertical, Gauge, X, Save, Truck } from 'lucide-react';

const Fleet: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Local state to handle additions (simulating backend)
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await import('../services/api').then(m => m.vehicles.getAll());
        setVehicles(data);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Form State
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    currentMileage: 0,
    status: 'Active',
    notes: ''
  });

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Under Maintenance': return 'warning';
      case 'Inactive': return 'neutral';
      default: return 'neutral';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'currentMileage' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.make || !formData.model || !formData.licensePlate) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const newVehicle = await import('../services/api').then(m => m.vehicles.create({
        make: formData.make,
        model: formData.model,
        year: formData.year,
        licensePlate: formData.licensePlate,
        vin: formData.vin,
        currentMileage: formData.currentMileage,
        status: (formData.status as VehicleStatus) || 'Active',
        notes: formData.notes
      }));

      setVehicles([newVehicle, ...vehicles]);
      setIsModalOpen(false);

      // Reset form
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        vin: '',
        currentMileage: 0,
        status: 'Active',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      alert('Failed to create vehicle. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Fleet Management</h1>
          <p className="text-steel mt-1">Manage your vehicles and track their status.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface p-4 rounded-xl border border-steel-lighter shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search make, model, or license plate..."
            className="w-full pl-4 pr-10 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-0 top-0 bottom-0 px-3 bg-primary text-white rounded-r-lg hover:bg-primary-hover">
            <Search className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-steel" />
          <select
            className="border border-steel-lighter rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-steel bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Under Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} statusVariant={getStatusVariant(vehicle.status)} />
        ))}
        {filteredVehicles.length === 0 && (
          <div className="col-span-full py-12 text-center text-steel bg-surface rounded-xl border border-dashed border-steel-lighter">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-steel-light" />
            </div>
            <h3 className="text-lg font-medium text-primary">No vehicles found</h3>
            <p className="text-sm mt-1">Try adjusting your filters or add a new vehicle.</p>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-2xl rounded-xl shadow-xl border border-steel-lighter max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-steel-lighter flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-primary">Add New Vehicle</h2>
                <p className="text-sm text-steel mt-1">Enter the details of the new fleet vehicle.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-steel hover:text-primary p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Make */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Make *</label>
                  <input
                    type="text"
                    name="make"
                    required
                    placeholder="e.g. Mercedes-Benz"
                    className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    value={formData.make}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Model */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Model *</label>
                  <input
                    type="text"
                    name="model"
                    required
                    placeholder="e.g. Actros"
                    className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </div>

                {/* License Plate */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">License Plate *</label>
                  <input
                    type="text"
                    name="licensePlate"
                    required
                    placeholder="e.g. RAB 123A"
                    className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono uppercase"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Year */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Year *</label>
                  <input
                    type="number"
                    name="year"
                    required
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    value={formData.year}
                    onChange={handleInputChange}
                  />
                </div>

                {/* VIN */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">VIN</label>
                  <input
                    type="text"
                    name="vin"
                    placeholder="Vehicle Identification Number"
                    className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono uppercase"
                    value={formData.vin}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Mileage */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Current Mileage (km) *</label>
                  <input
                    type="number"
                    name="currentMileage"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    value={formData.currentMileage}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-primary">Status</label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-primary">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Additional details about the vehicle..."
                  className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const VehicleCard: React.FC<{ vehicle: Vehicle; statusVariant: any }> = ({ vehicle, statusVariant }) => (
  <div className="bg-surface rounded-xl border border-steel-lighter shadow-sm hover:shadow-md transition-all group">
    <div className="p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-primary font-bold">
            {vehicle.make[0]}
          </div>
          <div>
            <h3 className="font-bold text-primary">{vehicle.make} {vehicle.model}</h3>
            <p className="text-xs text-steel">{vehicle.year} • {vehicle.licensePlate}</p>
          </div>
        </div>
        <button className="text-steel-light hover:text-primary">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-steel flex items-center gap-2">
            <Gauge className="w-4 h-4" /> Mileage
          </span>
          <span className="font-medium text-primary">{vehicle.currentMileage.toLocaleString()} km</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-steel">VIN</span>
          <span className="font-mono text-xs bg-slate-50 text-steel border border-steel-lighter px-2 py-1 rounded">{vehicle.vin}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-steel-lighter">
        <Badge variant={statusVariant}>{vehicle.status}</Badge>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-steel hover:text-primary hover:bg-blue-50 rounded-full transition-colors">
            <PenTool className="w-4 h-4" />
          </button>
          <button className="p-2 text-steel hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {vehicle.notes && (
        <div className="mt-3 bg-yellow-50 text-yellow-800 text-xs p-2 rounded-md border border-yellow-100 font-medium">
          Note: {vehicle.notes}
        </div>
      )}
    </div>
  </div>
);

export default Fleet;
