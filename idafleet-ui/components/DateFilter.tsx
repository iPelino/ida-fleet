import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';

export type DatePreset = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface DateFilterValue {
    startDate: string | null;
    endDate: string | null;
    preset: DatePreset;
    label: string;
}

interface DateFilterProps {
    onFilterChange: (value: DateFilterValue) => void;
    className?: string;
}

// Helper functions for date calculations
const getToday = (): string => {
    return new Date().toISOString().split('T')[0];
};

const getStartOfWeek = (): string => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
};

const getEndOfWeek = (): string => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? 0 : 7); // Sunday
    const sunday = new Date(today.setDate(diff));
    return sunday.toISOString().split('T')[0];
};

const getStartOfMonth = (): string => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
};

const getEndOfMonth = (): string => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
};

const formatDateRange = (start: string | null, end: string | null): string => {
    if (!start && !end) return '';
    if (start === end) {
        return new Date(start!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const startFormatted = start ? new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    const endFormatted = end ? new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    return `${startFormatted} - ${endFormatted}`;
};

const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [preset, setPreset] = useState<DatePreset>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [displayLabel, setDisplayLabel] = useState('All Time');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePresetSelect = (newPreset: DatePreset) => {
        setPreset(newPreset);

        let startDate: string | null = null;
        let endDate: string | null = null;
        let label = 'All Time';

        switch (newPreset) {
            case 'today':
                startDate = getToday();
                endDate = getToday();
                label = 'Today';
                break;
            case 'week':
                startDate = getStartOfWeek();
                endDate = getEndOfWeek();
                label = 'This Week';
                break;
            case 'month':
                startDate = getStartOfMonth();
                endDate = getEndOfMonth();
                label = 'This Month';
                break;
            case 'custom':
                // Don't close dropdown for custom, let user select dates
                return;
            case 'all':
            default:
                startDate = null;
                endDate = null;
                label = 'All Time';
        }

        setDisplayLabel(label);
        setIsOpen(false);
        onFilterChange({ startDate, endDate, preset: newPreset, label });
    };

    const handleCustomDateApply = () => {
        if (customStartDate || customEndDate) {
            const label = formatDateRange(customStartDate || null, customEndDate || null);
            setDisplayLabel(label || 'Custom Range');
            setPreset('custom');
            setIsOpen(false);
            onFilterChange({
                startDate: customStartDate || null,
                endDate: customEndDate || null,
                preset: 'custom',
                label: label || 'Custom Range'
            });
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreset('all');
        setDisplayLabel('All Time');
        setCustomStartDate('');
        setCustomEndDate('');
        onFilterChange({ startDate: null, endDate: null, preset: 'all', label: 'All Time' });
    };

    const presets = [
        { value: 'all' as DatePreset, label: 'All Time' },
        { value: 'today' as DatePreset, label: 'Today' },
        { value: 'week' as DatePreset, label: 'This Week' },
        { value: 'month' as DatePreset, label: 'This Month' },
        { value: 'custom' as DatePreset, label: 'Custom Range' },
    ];

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-steel-lighter rounded-lg text-sm bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            >
                <Calendar className="w-4 h-4 text-steel" />
                <span className="text-primary font-medium">{displayLabel}</span>
                {preset !== 'all' && (
                    <button
                        onClick={handleClear}
                        className="ml-1 p-0.5 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X className="w-3 h-3 text-steel" />
                    </button>
                )}
                <ChevronDown className={`w-4 h-4 text-steel transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-steel-lighter rounded-lg shadow-lg z-50 overflow-hidden">
                    {/* Preset Options */}
                    <div className="py-1">
                        {presets.map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => handlePresetSelect(p.value)}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between transition-colors ${preset === p.value ? 'bg-blue-50 text-primary font-medium' : 'text-steel'
                                    }`}
                            >
                                {p.label}
                                {preset === p.value && p.value !== 'custom' && (
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Range Section */}
                    {preset === 'custom' && (
                        <div className="border-t border-steel-lighter p-3 space-y-3 bg-slate-50">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-steel uppercase">Start Date</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-steel uppercase">End Date</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleCustomDateApply}
                                disabled={!customStartDate && !customEndDate}
                                className="w-full px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Apply Range
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DateFilter;
