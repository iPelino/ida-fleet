
export type Role = 'admin' | 'manager' | 'driver' | 'employee';

export type Currency = 'USD' | 'RWF' | 'EUR';

export interface User {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export type VehicleStatus = 'Active' | 'Under Maintenance' | 'Inactive';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  currentMileage: number;
  status: VehicleStatus;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  vehicleId: string;
  tripId?: string;
  expenseType: 'vehicle' | 'trip';
  category: string;
  amount: number; // Stored in USD for simplicity in this mock
  currency: Currency;
  originalAmount?: number;
  description: string;
  vehicleName?: string;
  tripDescription?: string;
}

export interface Payment {
  id: string;
  amount: number; // Normalized to Trip Currency
  currency?: Currency; // The currency paid in
  originalAmount?: number; // The raw amount paid in that currency
  date: string;
  type: string;
}

export type TripStatus = 'Delivered' | 'In Transit' | 'Pending';

export interface Trip {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  description: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  endLocation: string;
  tripType: 'local' | 'international';
  totalPrice: number;
  currency: Currency;
  status: TripStatus;
  payments: Payment[];
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export type ReminderType = 'Insurance' | 'Service' | 'License' | 'Other';
export type ReminderStatus = 'Pending' | 'Completed' | 'Overdue';

export interface Reminder {
  id: string;
  vehicleId: string;
  title: string;
  type: ReminderType;
  dueDate: string;
  notes?: string;
  emailNotification: boolean;
  status: ReminderStatus;
}

export interface KPIData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  activeVehicles: number;
  pendingPayments: number;
  upcomingReminders: number;
}

export interface ReportFilter {
  dateRange: string;
  vehicleId: string;
  customerId: string;
}