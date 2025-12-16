import React, { useState, useEffect } from 'react';
import {
    BankLoan,
    PersonalLoan,
    AdvancePayment,
    UnpaidFuel
} from '../../types';
import { loansService } from '../../services/loans';
import { BankLoanForm, PersonalLoanForm, AdvancePaymentForm, UnpaidFuelForm } from './LoanForms';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useCurrency } from '../../services/currencyContext';

interface LoanListProps<T> {
    data: T[];
    onEdit: (item: T) => void;
    onDelete: (id: number) => void;
}

const BankLoanList: React.FC<LoanListProps<BankLoan>> = ({ data, onEdit, onDelete }) => {
    const { format, convert, displayCurrency } = useCurrency();
    if (data.length === 0) return <div className="text-gray-500 text-center py-8">No bank loans recorded.</div>;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="px-4 py-3 font-medium text-gray-600">Bank</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Remaining</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Period</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map(loan => (
                        <tr key={loan.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{loan.bank_name}</td>
                            <td className="px-4 py-3">{format(convert(loan.amount, loan.currency as any, displayCurrency))}</td>
                            <td className="px-4 py-3 text-orange-600 font-medium">{format(convert(loan.remaining_amount, loan.currency as any, displayCurrency))}</td>
                            <td className="px-4 py-3">{loan.payment_period_months} months</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${loan.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {loan.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button onClick={() => onEdit(loan)} className="p-1 text-gray-400 hover:text-primary mr-2"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => onDelete(loan.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const PersonalLoanList: React.FC<LoanListProps<PersonalLoan>> = ({ data, onEdit, onDelete }) => {
    const { format, convert, displayCurrency } = useCurrency();
    if (data.length === 0) return <div className="text-gray-500 text-center py-8">No personal loans recorded.</div>;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="px-4 py-3 font-medium text-gray-600">Creditor</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Remaining</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Due Date</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map(loan => (
                        <tr key={loan.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{loan.creditor_name}</td>
                            <td className="px-4 py-3">{format(convert(loan.amount, loan.currency as any, displayCurrency))}</td>
                            <td className="px-4 py-3 text-orange-600 font-medium">{format(convert(loan.remaining_balance, loan.currency as any, displayCurrency))}</td>
                            <td className="px-4 py-3">{loan.payment_due_date}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${loan.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {loan.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button onClick={() => onEdit(loan)} className="p-1 text-gray-400 hover:text-primary mr-2"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => onDelete(loan.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AdvancePaymentList: React.FC<LoanListProps<AdvancePayment>> = ({ data, onEdit, onDelete }) => {
    const { format, convert, displayCurrency } = useCurrency();
    if (data.length === 0) return <div className="text-gray-500 text-center py-8">No advance payments recorded.</div>;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="px-4 py-3 font-medium text-gray-600">Recipient</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Remaining</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Date Issued</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map(adv => (
                        <tr key={adv.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{adv.recipient_name}</td>
                            <td className="px-4 py-3">{format(convert(adv.amount, adv.currency as any, displayCurrency))}</td>
                            <td className="px-4 py-3 text-orange-600 font-medium">{format(convert(adv.remaining_amount, adv.currency as any, displayCurrency))}</td>
                            <td className="px-4 py-3">{adv.date_issued}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${adv.status === 'recovered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {adv.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button onClick={() => onEdit(adv)} className="p-1 text-gray-400 hover:text-primary mr-2"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => onDelete(adv.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const UnpaidFuelList: React.FC<LoanListProps<UnpaidFuel>> = ({ data, onEdit, onDelete }) => {
    const { format, convert, displayCurrency } = useCurrency();
    if (data.length === 0) return <div className="text-gray-500 text-center py-8">No unpaid fuel recorded.</div>;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="px-4 py-3 font-medium text-gray-600">Supplier</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Liters</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Total</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Remaining</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map(fuel => (
                        <tr key={fuel.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{fuel.supplier}</td>
                            <td className="px-4 py-3">{fuel.liters} L</td>
                            <td className="px-4 py-3">{format(convert(fuel.total_amount, fuel.currency as any, displayCurrency))}</td>
                            <td className="px-4 py-3 text-orange-600 font-medium">{format(convert(fuel.remaining_balance, fuel.currency as any, displayCurrency))}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${fuel.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {fuel.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button onClick={() => onEdit(fuel)} className="p-1 text-gray-400 hover:text-primary mr-2"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => onDelete(fuel.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const LoansPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'bank' | 'personal' | 'advance' | 'fuel'>('bank');
    const [bankLoans, setBankLoans] = useState<BankLoan[]>([]);
    const [personalLoans, setPersonalLoans] = useState<PersonalLoan[]>([]);
    const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>([]);
    const [unpaidFuel, setUnpaidFuel] = useState<UnpaidFuel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewRecordModal, setShowNewRecordModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: number } | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bank, personal, advance, fuel] = await Promise.all([
                loansService.getBankLoans(),
                loansService.getPersonalLoans(),
                loansService.getAdvancePayments(),
                loansService.getUnpaidFuel()
            ]);
            setBankLoans(bank);
            setPersonalLoans(personal);
            setAdvancePayments(advance);
            setUnpaidFuel(fuel);
        } catch (error) {
            console.error("Failed to fetch loans data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewRecordSuccess = () => {
        setShowNewRecordModal(false);
        fetchData();
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            switch (deleteConfirm.type) {
                case 'bank':
                    await loansService.deleteBankLoan(deleteConfirm.id);
                    break;
                case 'personal':
                    await loansService.deletePersonalLoan(deleteConfirm.id);
                    break;
                case 'advance':
                    await loansService.deleteAdvancePayment(deleteConfirm.id);
                    break;
                case 'fuel':
                    await loansService.deleteUnpaidFuel(deleteConfirm.id);
                    break;
            }
            setDeleteConfirm(null);
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setDeleting(false);
        }
    };

    const handleEdit = (item: any) => {
        // For now, just log - full edit modal can be added later
        console.log('Edit item:', item);
        alert('Edit functionality coming soon. Use delete and recreate for now.');
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Loans & Advances</h1>
                <button
                    onClick={() => setShowNewRecordModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover font-medium transition-colors"
                >
                    + New Record
                </button>
            </div>

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('bank')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bank'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Bank Loans ({bankLoans.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Personal Loans ({personalLoans.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('advance')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'advance'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Advances ({advancePayments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('fuel')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'fuel'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Unpaid Fuel ({unpaidFuel.length})
                    </button>
                </nav>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {activeTab === 'bank' && <BankLoanList data={bankLoans} onEdit={handleEdit} onDelete={(id) => setDeleteConfirm({ type: 'bank', id })} />}
                    {activeTab === 'personal' && <PersonalLoanList data={personalLoans} onEdit={handleEdit} onDelete={(id) => setDeleteConfirm({ type: 'personal', id })} />}
                    {activeTab === 'advance' && <AdvancePaymentList data={advancePayments} onEdit={handleEdit} onDelete={(id) => setDeleteConfirm({ type: 'advance', id })} />}
                    {activeTab === 'fuel' && <UnpaidFuelList data={unpaidFuel} onEdit={handleEdit} onDelete={(id) => setDeleteConfirm({ type: 'fuel', id })} />}
                </div>
            )}

            {/* New Record Modal */}
            {showNewRecordModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative p-6 border w-full max-w-md shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">New {activeTab === 'bank' ? 'Bank Loan' : activeTab === 'personal' ? 'Personal Loan' : activeTab === 'advance' ? 'Advance Payment' : 'Unpaid Fuel'}</h3>
                            <button
                                onClick={() => setShowNewRecordModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        {activeTab === 'bank' && <BankLoanForm onSuccess={handleNewRecordSuccess} onCancel={() => setShowNewRecordModal(false)} />}
                        {activeTab === 'personal' && <PersonalLoanForm onSuccess={handleNewRecordSuccess} onCancel={() => setShowNewRecordModal(false)} />}
                        {activeTab === 'advance' && <AdvancePaymentForm onSuccess={handleNewRecordSuccess} onCancel={() => setShowNewRecordModal(false)} />}
                        {activeTab === 'fuel' && <UnpaidFuelForm onSuccess={handleNewRecordSuccess} onCancel={() => setShowNewRecordModal(false)} />}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative p-6 border w-full max-w-sm shadow-lg rounded-lg bg-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                        </div>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this record? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoansPage;
