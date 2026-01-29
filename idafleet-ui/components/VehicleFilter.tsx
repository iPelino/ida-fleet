import React, { useState, useEffect, useRef } from 'react';
import { Truck, Search, X, ChevronDown, Check } from 'lucide-react';
import { vehicles as vehiclesApi } from '../services/api';
import { Vehicle } from '../types';

interface VehicleFilterProps {
    onFilterChange: (vehicleId: string | null, vehicle: Vehicle | null) => void;
    className?: string;
    initialVehicleId?: string | null;
}

const VehicleFilter: React.FC<VehicleFilterProps> = ({
    onFilterChange,
    className = '',
    initialVehicleId = null
}) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch vehicles on mount
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await vehiclesApi.getAll();
                setVehicles(data);

                // Set initial selection if provided
                if (initialVehicleId) {
                    const initial = data.find(v => v.id === initialVehicleId);
                    if (initial) setSelectedVehicle(initial);
                }
            } catch (error) {
                console.error('Failed to fetch vehicles for filter:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVehicles();
    }, [initialVehicleId]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredVehicles = vehicles.filter(v =>
        v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (vehicle: Vehicle | null) => {
        setSelectedVehicle(vehicle);
        onFilterChange(vehicle ? vehicle.id : null, vehicle);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleSelect(null);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-steel-lighter rounded-lg text-sm bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors min-w-[200px] justify-between"
            >
                <div className="flex items-center gap-2 truncate">
                    <Truck className="w-4 h-4 text-steel shrink-0" />
                    <span className={`truncate ${selectedVehicle ? 'text-primary font-medium' : 'text-steel'}`}>
                        {selectedVehicle
                            ? `${selectedVehicle.licensePlate} - ${selectedVehicle.make}`
                            : 'All Vehicles'}
                    </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {selectedVehicle && (
                        <div
                            role="button"
                            onClick={handleClear}
                            className="p-0.5 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                        >
                            <X className="w-3 h-3 text-steel" />
                        </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-steel transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-steel-lighter rounded-lg shadow-lg z-50 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-steel-lighter bg-slate-50">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 w-3 h-3 text-steel" />
                            <input
                                type="text"
                                className="w-full pl-7 pr-2 py-1.5 text-sm border border-steel-lighter rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                placeholder="Search plate, make, or model..."
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => handleSelect(null)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-slate-50"
                        >
                            <span className="text-steel font-medium">All Vehicles</span>
                            {!selectedVehicle && <Check className="w-4 h-4 text-primary" />}
                        </button>

                        {isLoading ? (
                            <div className="p-4 text-center text-xs text-steel">Loading vehicles...</div>
                        ) : filteredVehicles.length > 0 ? (
                            filteredVehicles.map(vehicle => (
                                <button
                                    key={vehicle.id}
                                    type="button"
                                    onClick={() => handleSelect(vehicle)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between transition-colors group"
                                >
                                    <div>
                                        <p className={`font-medium ${selectedVehicle?.id === vehicle.id ? 'text-primary' : 'text-primary'}`}>
                                            {vehicle.licensePlate}
                                        </p>
                                        <p className="text-xs text-steel">
                                            {vehicle.make} {vehicle.model}
                                        </p>
                                    </div>
                                    {selectedVehicle?.id === vehicle.id && <Check className="w-4 h-4 text-primary" />}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-steel">No vehicles found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleFilter;
