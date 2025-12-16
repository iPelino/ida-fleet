import React, { useState, useRef, useEffect } from 'react';
import { loansService } from '../../services/loans';
import { Search, ChevronDown, Check } from 'lucide-react';

// List of banks and financial institutions operating in Rwanda
const RWANDAN_BANKS = [
    // Commercial Banks
    'Bank of Kigali',
    'I&M Bank Rwanda',
    'Equity Bank Rwanda',
    'Access Bank Rwanda',
    'BPR Bank Rwanda (Atlas Mara)',
    'Cogebanque',
    'Ecobank Rwanda',
    'GT Bank Rwanda',
    'NCBA Bank Rwanda',
    'KCB Bank Rwanda',
    'Bank of Africa Rwanda',
    'AB Bank Rwanda',
    // Development & Specialized Banks
    'Development Bank of Rwanda (BRD)',
    'National Bank of Rwanda (BNR)',
    // Microfinance Banks
    'Urwego Bank',
    'Zigama CSS',
    // SACCOs & Microfinance Institutions
    'Inyamazererano (Amazerano)',
    'Umutanguha Finance',
    'Duterimbere IMF',
    'Vision Fund Rwanda',
    'Goshen Finance',
    'Inkunga Finance',
    'RIM Ltd',
    'Unguka Bank',
    'COOPEDU',
    'Amasezerano Community Banking',
] as const;

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: readonly string[];
    placeholder?: string;
    required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="mt-1 w-full flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-white text-left"
            >
                <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                    {value || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Hidden input for form validation */}
            <input
                type="text"
                value={value}
                required={required}
                onChange={() => { }}
                className="sr-only"
                tabIndex={-1}
            />

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search banks..."
                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* Options list */}
                    <ul className="max-h-44 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <li key={option}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-blue-50 transition-colors ${value === option ? 'bg-blue-50 text-primary' : 'text-gray-700'
                                            }`}
                                    >
                                        <span>{option}</span>
                                        {value === option && <Check className="w-4 h-4 text-primary" />}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-gray-500 italic">
                                No banks found
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

interface FormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const inputClasses = "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary text-sm";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

export const BankLoanForm: React.FC<FormProps> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        bank_name: '',
        amount: '',
        currency: 'RWF',
        payment_period_months: '12',
        start_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await loansService.createBankLoan({
                ...formData,
                amount: parseFloat(formData.amount),
                payment_period_months: parseInt(formData.payment_period_months)
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create bank loan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <div>
                <label className={labelClasses}>Bank Name *</label>
                <SearchableSelect
                    value={formData.bank_name}
                    onChange={value => setFormData({ ...formData, bank_name: value })}
                    options={RWANDAN_BANKS}
                    placeholder="Select a bank..."
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Amount *</label>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className={inputClasses}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label className={labelClasses}>Currency</label>
                    <select
                        value={formData.currency}
                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                        className={inputClasses}
                    >
                        <option value="RWF">RWF</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Payment Period (months) *</label>
                    <input
                        type="number"
                        value={formData.payment_period_months}
                        onChange={e => setFormData({ ...formData, payment_period_months: e.target.value })}
                        className={inputClasses}
                        min="1"
                        required
                    />
                </div>
                <div>
                    <label className={labelClasses}>Start Date *</label>
                    <input
                        type="date"
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        className={inputClasses}
                        required
                    />
                </div>
            </div>

            <div>
                <label className={labelClasses}>Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className={inputClasses}
                    rows={2}
                    placeholder="Additional notes..."
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover font-medium disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export const PersonalLoanForm: React.FC<FormProps> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        creditor_name: '',
        amount: '',
        currency: 'RWF',
        date_taken: new Date().toISOString().split('T')[0],
        payment_due_date: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await loansService.createPersonalLoan({
                ...formData,
                amount: parseFloat(formData.amount)
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create personal loan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <div>
                <label className={labelClasses}>Creditor Name *</label>
                <input
                    type="text"
                    value={formData.creditor_name}
                    onChange={e => setFormData({ ...formData, creditor_name: e.target.value })}
                    className={inputClasses}
                    placeholder="Person or company name"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Amount *</label>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className={inputClasses}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label className={labelClasses}>Currency</label>
                    <select
                        value={formData.currency}
                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                        className={inputClasses}
                    >
                        <option value="RWF">RWF</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Date Taken *</label>
                    <input
                        type="date"
                        value={formData.date_taken}
                        onChange={e => setFormData({ ...formData, date_taken: e.target.value })}
                        className={inputClasses}
                        required
                    />
                </div>
                <div>
                    <label className={labelClasses}>Payment Due Date *</label>
                    <input
                        type="date"
                        value={formData.payment_due_date}
                        onChange={e => setFormData({ ...formData, payment_due_date: e.target.value })}
                        className={inputClasses}
                        required
                    />
                </div>
            </div>

            <div>
                <label className={labelClasses}>Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className={inputClasses}
                    rows={2}
                    placeholder="Additional notes..."
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover font-medium disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export const AdvancePaymentForm: React.FC<FormProps> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        recipient_name: '',
        amount: '',
        currency: 'RWF',
        date_issued: new Date().toISOString().split('T')[0],
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await loansService.createAdvancePayment({
                ...formData,
                amount: parseFloat(formData.amount)
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create advance payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <div>
                <label className={labelClasses}>Recipient Name *</label>
                <input
                    type="text"
                    value={formData.recipient_name}
                    onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                    className={inputClasses}
                    placeholder="Driver or employee name"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Amount *</label>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className={inputClasses}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label className={labelClasses}>Currency</label>
                    <select
                        value={formData.currency}
                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                        className={inputClasses}
                    >
                        <option value="RWF">RWF</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClasses}>Date Issued *</label>
                <input
                    type="date"
                    value={formData.date_issued}
                    onChange={e => setFormData({ ...formData, date_issued: e.target.value })}
                    className={inputClasses}
                    required
                />
            </div>

            <div>
                <label className={labelClasses}>Reason *</label>
                <textarea
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    className={inputClasses}
                    rows={2}
                    placeholder="Reason for the advance..."
                    required
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover font-medium disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export const UnpaidFuelForm: React.FC<FormProps> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        supplier: '',
        liters: '',
        price_per_liter: '',
        currency: 'RWF',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const totalAmount = formData.liters && formData.price_per_liter
        ? (parseFloat(formData.liters) * parseFloat(formData.price_per_liter)).toFixed(2)
        : '0.00';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await loansService.createUnpaidFuel({
                ...formData,
                liters: parseFloat(formData.liters),
                price_per_liter: parseFloat(formData.price_per_liter)
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create unpaid fuel record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <div>
                <label className={labelClasses}>Fuel Supplier *</label>
                <input
                    type="text"
                    value={formData.supplier}
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    className={inputClasses}
                    placeholder="e.g., SP Fuel Station"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Liters *</label>
                    <input
                        type="number"
                        value={formData.liters}
                        onChange={e => setFormData({ ...formData, liters: e.target.value })}
                        className={inputClasses}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label className={labelClasses}>Price per Liter *</label>
                    <input
                        type="number"
                        value={formData.price_per_liter}
                        onChange={e => setFormData({ ...formData, price_per_liter: e.target.value })}
                        className={inputClasses}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Currency</label>
                    <select
                        value={formData.currency}
                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                        className={inputClasses}
                    >
                        <option value="RWF">RWF</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Date *</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className={inputClasses}
                        required
                    />
                </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                    Total Amount: <span className="font-semibold text-gray-900">{totalAmount} {formData.currency}</span>
                </p>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover font-medium disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};
