import axios from 'axios';
import {
    BankLoan,
    PersonalLoan,
    AdvancePayment,
    UnpaidFuel,
    LoanPayment
} from '../types';

// Use the same API URL pattern as api.ts
const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
    // Use 'authToken' to match the rest of the application (api.ts, App.tsx, Login.tsx)
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    };
};

export const loansService = {
    // Bank Loans
    getBankLoans: async () => {
        const response = await axios.get<BankLoan[]>(`${API_URL}/loans/bank-loans/`, getHeaders());
        return response.data;
    },
    createBankLoan: async (data: Omit<BankLoan, 'id' | 'remaining_amount' | 'status'>) => {
        const response = await axios.post<BankLoan>(`${API_URL}/loans/bank-loans/`, data, getHeaders());
        return response.data;
    },

    // Personal Loans
    getPersonalLoans: async () => {
        const response = await axios.get<PersonalLoan[]>(`${API_URL}/loans/personal-loans/`, getHeaders());
        return response.data;
    },
    createPersonalLoan: async (data: Omit<PersonalLoan, 'id' | 'remaining_balance' | 'status'>) => {
        const response = await axios.post<PersonalLoan>(`${API_URL}/loans/personal-loans/`, data, getHeaders());
        return response.data;
    },

    // Advance Payments
    getAdvancePayments: async () => {
        const response = await axios.get<AdvancePayment[]>(`${API_URL}/loans/advance-payments/`, getHeaders());
        return response.data;
    },
    createAdvancePayment: async (data: Omit<AdvancePayment, 'id' | 'remaining_amount' | 'status'>) => {
        const response = await axios.post<AdvancePayment>(`${API_URL}/loans/advance-payments/`, data, getHeaders());
        return response.data;
    },

    // Unpaid Fuel
    getUnpaidFuel: async () => {
        const response = await axios.get<UnpaidFuel[]>(`${API_URL}/loans/unpaid-fuel/`, getHeaders());
        return response.data;
    },
    createUnpaidFuel: async (data: Omit<UnpaidFuel, 'id' | 'remaining_balance' | 'total_amount' | 'status'>) => {
        const response = await axios.post<UnpaidFuel>(`${API_URL}/loans/unpaid-fuel/`, data, getHeaders());
        return response.data;
    },

    // Payments
    recordPayment: async (data: Omit<LoanPayment, 'id'>) => {
        const response = await axios.post<LoanPayment>(`${API_URL}/loans/payments/`, data, getHeaders());
        return response.data;
    }
};
