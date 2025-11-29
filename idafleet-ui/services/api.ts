import axios from 'axios';
import { User, Vehicle, Customer, Trip, Expense } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const auth = {
    login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
        const response = await api.post('/login', { email, password });
        return response.data;
    },
    signup: async (userData: any) => {
        const response = await api.post('/signup', userData);
        return response.data;
    },
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/user');
        return response.data;
    },
};

export const vehicles = {
    getAll: async (): Promise<Vehicle[]> => {
        const response = await api.get('/vehicles/');
        return response.data.map((vehicle: any) => ({
            ...vehicle,
            id: String(vehicle.id),
        }));
    },
    create: async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
        const response = await api.post('/vehicles/', vehicleData);
        return response.data;
    },
    update: async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
        const response = await api.patch(`/vehicles/${id}/`, vehicleData);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/vehicles/${id}/`);
    },
};

export const customers = {
    getAll: async (): Promise<Customer[]> => {
        const response = await api.get('/customers/');
        return response.data.map((customer: any) => ({
            ...customer,
            id: String(customer.id),
        }));
    },
    create: async (customerData: Partial<Customer>): Promise<Customer> => {
        const response = await api.post('/customers/', customerData);
        return response.data;
    },
};

export const trips = {
    getAll: async (): Promise<Trip[]> => {
        const response = await api.get('/trips/');
        return response.data.map((trip: any) => ({
            ...trip,
            id: String(trip.id),
            vehicleId: String(trip.vehicle),
            customerId: String(trip.customer),
            totalPrice: Number(trip.totalPrice),
            payments: trip.payments.map((payment: any) => ({
                ...payment,
                id: String(payment.id),
                amount: Number(payment.amount),
            })),
        }));
    },
    create: async (tripData: Partial<Trip>): Promise<Trip> => {
        const response = await api.post('/trips/', tripData);
        const trip = response.data;
        return {
            ...trip,
            id: String(trip.id),
            vehicleId: String(trip.vehicle),
            customerId: String(trip.customer),
            totalPrice: Number(trip.totalPrice),
            payments: trip.payments ? trip.payments.map((payment: any) => ({
                ...payment,
                id: String(payment.id),
                amount: Number(payment.amount),
            })) : [],
        };
    },
};

export const expenses = {
    getAll: async (): Promise<Expense[]> => {
        const response = await api.get('/expenses/');
        return response.data.map((item: any) => ({
            ...item,
            vehicleId: item.vehicle, // Map backend 'vehicle' to frontend 'vehicleId'
            tripId: item.trip,       // Map backend 'trip' to frontend 'tripId'
            amount: parseFloat(item.amount), // Ensure amount is a number
            currency: item.currency || 'USD', // Default currency if missing
            description: item.description || '', // Handle null description
        }));
    },
    create: async (expenseData: Partial<Expense>): Promise<Expense> => {
        const response = await api.post('/expenses/', expenseData);
        return response.data;
    },
};

export const payments = {
    create: async (paymentData: any): Promise<any> => {
        const response = await api.post('/payments/', paymentData);
        return response.data;
    },
};

export const users = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get('/users/');
        return response.data.map((user: any) => ({
            ...user,
            id: String(user.id),
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.email)}&background=random&color=fff`
        }));
    },
    create: async (userData: Partial<User> & { password?: string }): Promise<User> => {
        const response = await api.post('/users/', userData);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}/`);
    },
    getRoles: async (): Promise<{ value: string; label: string }[]> => {
        const response = await api.get('/roles');
        return response.data;
    },
};

export const reminders = {
    getAll: async () => {
        const response = await api.get('/reminders/');
        return response.data.map((reminder: any) => ({
            ...reminder,
            id: String(reminder.id),
            vehicleId: String(reminder.vehicle),
        }));
    },
    create: async (data: any) => {
        const response = await api.post('/reminders/', {
            ...data,
            vehicle: data.vehicleId,
        });
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.patch(`/reminders/${id}/`, {
            ...data,
            vehicle: data.vehicleId,
        });
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/reminders/${id}/`);
    },
};

export default api;
