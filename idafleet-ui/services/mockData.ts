


import { Vehicle, Trip, Expense, KPIData, User, Customer, Reminder } from '../types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Jane Doe',
  email: 'jane@idalogistics.com',
  role: 'admin',
  avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Doe&background=1E3A8A&color=fff',
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'u2',
    name: 'John Smith',
    email: 'john.smith@idalogistics.com',
    role: 'employee',
    avatarUrl: 'https://ui-avatars.com/api/?name=John+Smith&background=F97316&color=fff',
  },
  {
    id: 'u3',
    name: 'Sarah Connor',
    email: 'sarah.c@idalogistics.com',
    role: 'employee',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Connor&background=64748B&color=fff',
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    make: 'Mercedes-Benz',
    model: 'Actros',
    year: 2021,
    licensePlate: 'RAB 452G',
    vin: 'WDB963...',
    currentMileage: 120500,
    status: 'Active',
  },
  {
    id: 'v2',
    make: 'Fuso',
    model: 'Canter',
    year: 2019,
    licensePlate: 'RAD 112A',
    vin: 'FUS882...',
    currentMileage: 210000,
    status: 'Under Maintenance',
    notes: 'Brake pad replacement needed',
  },
  {
    id: 'v3',
    make: 'Toyota',
    model: 'Hilux',
    year: 2023,
    licensePlate: 'RAF 889B',
    vin: 'JTN112...',
    currentMileage: 45000,
    status: 'Active',
  },
  {
    id: 'v4',
    make: 'Scania',
    model: 'R450',
    year: 2018,
    licensePlate: 'RAC 776T',
    vin: 'SCA441...',
    currentMileage: 340000,
    status: 'Inactive',
  },
];

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'TRK-001',
    customerId: 'c1',
    customerName: 'Kigali Cement Ltd',
    vehicleId: 'v1',
    description: 'Cement Delivery to Musanze',
    startDate: '2025-01-15',
    endDate: '2025-01-16',
    startLocation: 'Kigali',
    endLocation: 'Musanze',
    tripType: 'local',
    totalPrice: 1200,
    currency: 'USD',
    status: 'In Transit',
    payments: [{ id: 'p1', amount: 450, date: '2025-01-17', type: 'Bank Transfer' }],
  },
  {
    id: 'TRK-002',
    customerId: 'c2',
    customerName: 'East Africa Logistics',
    vehicleId: 'v4',
    description: 'Cargo Haul: Dar es Salaam to Kigali',
    startDate: '2025-01-10',
    endDate: '2025-01-14',
    startLocation: 'Dar es Salaam',
    endLocation: 'Kigali',
    tripType: 'international',
    totalPrice: 850.50,
    currency: 'USD',
    status: 'Delivered',
    payments: [{ id: 'p2', amount: 850.50, date: '2025-01-09', type: 'Wire' }],
  },
  {
    id: 'TRK-003',
    customerId: 'c3',
    customerName: 'AgroExports',
    vehicleId: 'v1',
    description: 'Coffee Transport',
    startDate: '2025-01-20',
    endDate: '2025-01-21',
    startLocation: 'Huye',
    endLocation: 'Kigali',
    tripType: 'local',
    totalPrice: 2340.00,
    currency: 'USD', 
    status: 'Pending',
    payments: [],
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Kigali Cement Ltd',
    email: 'procurement@kigalicement.rw',
    phone: '+250 788 123 456',
    address: 'KK 15 Rd, Kigali, Rwanda',
    createdAt: '2023-05-12'
  },
  {
    id: 'c2',
    name: 'East Africa Logistics',
    email: 'info@ealogistics.com',
    phone: '+255 754 112 233',
    address: 'Port Access Road, Dar es Salaam, Tanzania',
    createdAt: '2023-08-22'
  },
  {
    id: 'c3',
    name: 'AgroExports',
    email: 'logistics@agroexports.co',
    phone: '+250 789 998 877',
    address: 'Huye Industrial Zone, Huye',
    createdAt: '2024-01-05'
  }
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'e1',
    date: '2025-01-15',
    vehicleId: 'v1',
    tripId: 'TRK-001',
    expenseType: 'trip',
    category: 'Fuel',
    amount: 120,
    currency: 'USD',
    description: 'Diesel refill at Nyabugogo',
  },
  {
    id: 'e2',
    date: '2025-01-12',
    vehicleId: 'v2',
    expenseType: 'vehicle',
    category: 'Maintenance',
    amount: 350,
    currency: 'USD',
    description: 'Regular service & oil change',
  },
  {
    id: 'e3',
    date: '2025-01-18',
    vehicleId: 'v1',
    tripId: 'TRK-001',
    expenseType: 'trip',
    category: 'Road Toll',
    amount: 15,
    currency: 'USD',
    description: 'Road toll fees',
  },
  {
    id: 'e4',
    date: '2025-01-10',
    vehicleId: 'v4',
    tripId: 'TRK-002',
    expenseType: 'trip',
    category: 'Demurrage',
    amount: 200,
    currency: 'USD',
    description: 'Border delay fees',
  },
  {
    id: 'e5',
    date: '2025-01-05',
    vehicleId: 'v3',
    expenseType: 'vehicle',
    category: 'Insurance',
    amount: 1200,
    currency: 'USD',
    description: 'Annual comprehensive insurance',
  },
  {
    id: 'e6',
    date: '2025-01-22',
    vehicleId: 'v1',
    expenseType: 'trip',
    category: 'Fuel',
    amount: 95,
    currency: 'USD',
    description: 'Refuel at Rusizi',
  }
];

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: 'r1',
    vehicleId: 'v1',
    title: 'Insurance Renewal',
    type: 'Insurance',
    dueDate: '2025-03-15',
    notes: 'Renew comprehensive policy with Radiant Insurance',
    emailNotification: true,
    status: 'Pending'
  },
  {
    id: 'r2',
    vehicleId: 'v2',
    title: 'Brake Service',
    type: 'Service',
    dueDate: '2025-02-10',
    notes: 'Check brake pads and fluid levels',
    emailNotification: false,
    status: 'Overdue'
  },
  {
    id: 'r3',
    vehicleId: 'v4',
    title: 'Vehicle Inspection',
    type: 'License',
    dueDate: '2025-04-20',
    notes: 'Annual inspection at Controle Technique',
    emailNotification: true,
    status: 'Pending'
  }
];

// Helper to convert RWF to USD (Fixed rate for demo: 1300)
export const convertToUSD = (amount: number, currency: string): number => {
  if (currency === 'USD') return amount;
  if (currency === 'RWF') return amount / 1300;
  if (currency === 'EUR') return amount * 1.1;
  return amount;
};

export const getKPIs = (): KPIData => {
  // Calculate Income
  const totalIncome = MOCK_TRIPS.reduce((acc, trip) => {
    const paidAmount = trip.payments.reduce((sum, p) => sum + p.amount, 0);
    return acc + convertToUSD(paidAmount, trip.currency);
  }, 0);

  // Calculate Expenses
  const totalExpenses = MOCK_EXPENSES.reduce((acc, exp) => {
    return acc + convertToUSD(exp.amount, exp.currency);
  }, 0);

  // Pending Payments
  const pendingPayments = MOCK_TRIPS.reduce((acc, trip) => {
    const paidAmount = trip.payments.reduce((sum, p) => sum + p.amount, 0);
    const total = convertToUSD(trip.totalPrice, trip.currency);
    const paid = convertToUSD(paidAmount, trip.currency);
    return acc + (total - paid);
  }, 0);

  const activeVehicles = MOCK_VEHICLES.filter(v => v.status === 'Active').length;
  const upcomingReminders = MOCK_REMINDERS.filter(r => r.status === 'Pending').length;

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    activeVehicles,
    pendingPayments,
    upcomingReminders,
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Generated data for Reports module line chart
export const mockMonthlyData = [
  { name: 'Jan', Income: 8400, Expenses: 3200, Profit: 5200 },
  { name: 'Feb', Income: 7300, Expenses: 3100, Profit: 4200 },
  { name: 'Mar', Income: 9200, Expenses: 3800, Profit: 5400 },
  { name: 'Apr', Income: 8900, Expenses: 3400, Profit: 5500 },
  { name: 'May', Income: 9800, Expenses: 4100, Profit: 5700 },
  { name: 'Jun', Income: 10400, Expenses: 3900, Profit: 6500 },
  { name: 'Jul', Income: 11200, Expenses: 4500, Profit: 6700 },
  { name: 'Aug', Income: 10800, Expenses: 4200, Profit: 6600 },
];