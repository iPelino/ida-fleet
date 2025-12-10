import React, { useState, useEffect } from 'react';
import {
    BankLoan,
    PersonalLoan,
    AdvancePayment,
    UnpaidFuel
} from '../../types';
import { loansService } from '../../services/loans';
import { BankLoanForm, PersonalLoanForm, AdvancePaymentForm, UnpaidFuelForm } from './LoanForms';

// Placeholder components for lists (will be implemented next)
const BankLoanList = ({ data }: { data: BankLoan[] }) => (
    <div>
        <h3 className="text-lg font-semibold mb-2">Bank Loans</h3>
        <ul>{data.map(l => <li key={l.id}>{l.bank_name}: {l.remaining_amount} {l.currency}</li>)}</ul>
    </div>
);

const PersonalLoanList = ({ data }: { data: PersonalLoan[] }) => (
    <div>
        <h3 className="text-lg font-semibold mb-2">Personal Loans</h3>
        <ul>{data.map(l => <li key={l.id}>{l.creditor_name}: {l.remaining_balance} {l.currency}</li>)}</ul>
    </div>
);

const AdvancePaymentList = ({ data }: { data: AdvancePayment[] }) => (
    <div>
        <h3 className="text-lg font-semibold mb-2">Advance Payments</h3>
        <ul>{data.map(l => <li key={l.id}>{l.recipient_name}: {l.remaining_amount} {l.currency}</li>)}</ul>
    </div>
);

const UnpaidFuelList = ({ data }: { data: UnpaidFuel[] }) => (
    <div>
        <h3 className="text-lg font-semibold mb-2">Unpaid Fuel</h3>
        <ul>{data.map(l => <li key={l.id}>{l.supplier}: {l.remaining_balance} {l.currency}</li>)}</ul>
    </div>
);

const LoansPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'bank' | 'personal' | 'advance' | 'fuel'>('bank');
    const [bankLoans, setBankLoans] = useState<BankLoan[]>([]);
    const [personalLoans, setPersonalLoans] = useState<PersonalLoan[]>([]);
    const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>([]);
    const [unpaidFuel, setUnpaidFuel] = useState<UnpaidFuel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewRecordModal, setShowNewRecordModal] = useState(false);

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
        fetchData(); // Refresh the data
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Loans & Advances</h1>
                <button
                    onClick={() => setShowNewRecordModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover font-medium transition-colors"
                >
                    New Record
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
                        Bank Loans
                    </button>
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Personal Loans
                    </button>
                    <button
                        onClick={() => setActiveTab('advance')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'advance'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Advance Payments
                    </button>
                    <button
                        onClick={() => setActiveTab('fuel')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'fuel'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Unpaid Fuel
                    </button>
                </nav>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white shadow rounded-lg p-6">
                    {activeTab === 'bank' && <BankLoanList data={bankLoans} />}
                    {activeTab === 'personal' && <PersonalLoanList data={personalLoans} />}
                    {activeTab === 'advance' && <AdvancePaymentList data={advancePayments} />}
                    {activeTab === 'fuel' && <UnpaidFuelList data={unpaidFuel} />}
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
        </div>
    );
};

export default LoansPage;
