import React, { useState } from 'react';
import { LoanPayment, LoanPaymentMethod } from '../../types';
import { loansService } from '../../services/loans';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    loanType: 'bank' | 'personal' | 'advance' | 'fuel';
    loanId: string;
    currency: string;
}

const PaymentModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, loanType, loanId, currency }) => {
    const [amount, setAmount] = useState(0);
    const [method, setMethod] = useState<LoanPaymentMethod>('Bank Transfer');
    const [reference, setReference] = useState('');
    const [tripId, setTripId] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                amount,
                currency,
                date: new Date().toISOString().split('T')[0],
                method,
                reference_number: reference
            };

            if (method === 'Trip Revenue') {
                payload.trip = tripId;
            }

            if (loanType === 'bank') payload.bank_loan = loanId;
            if (loanType === 'personal') payload.personal_loan = loanId;
            if (loanType === 'advance') payload.advance_payment = loanId;
            if (loanType === 'fuel') payload.unpaid_fuel = loanId;

            await loansService.recordPayment(payload);
            onSuccess();
            onClose();
        } catch (error) {
            alert('Failed to record payment');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Record Payment</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount ({currency})</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(parseFloat(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Method</label>
                        <select
                            value={method}
                            onChange={e => setMethod(e.target.value as LoanPaymentMethod)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="MoMo">MoMo</option>
                            <option value="Cash">Cash</option>
                            <option value="Trip Revenue">Trip Revenue</option>
                        </select>
                    </div>

                    {method === 'Trip Revenue' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Trip ID</label>
                            <input
                                type="text"
                                value={tripId}
                                onChange={e => setTripId(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Reference / Notes</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={e => setReference(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">Pay</button>
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded w-full">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
