
import React, { useState, useMemo } from 'react';
import {
  formatCurrency,
} from '../services/mockData';
import { ReportFilter, Trip, Expense, Vehicle, Customer } from '../types';
import { trips as tripApi, expenses as expenseApi, vehicles as vehicleApi, customers as customerApi } from '../services/api';
import { useCurrency } from '../services/currencyContext';

import { Badge } from './ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Filter,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Truck
} from 'lucide-react';

const Reports: React.FC = () => {
  const { convert } = useCurrency();

  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: 'This Year',
    vehicleId: 'All',
    customerId: 'All'
  });

  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsData, expensesData, vehiclesData, customersData] = await Promise.all([
          tripApi.getAll(),
          expenseApi.getAll(),
          vehicleApi.getAll(),
          customerApi.getAll()
        ]);
        setTrips(tripsData);
        setExpenses(expensesData);
        setVehicles(vehiclesData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Data Processing & Filtering Logic ---

  const filteredData = useMemo(() => {
    // 1. Filter Trips
    const filteredTrips = trips.filter(t => {
      const matchVehicle = filters.vehicleId === 'All' || t.vehicleId === filters.vehicleId;
      const matchCustomer = filters.customerId === 'All' || t.customerId === filters.customerId;
      // Date filtering would go here in a real app (comparing t.startDate)
      return matchVehicle && matchCustomer;
    });

    // 2. Filter Expenses
    const filteredExpenses = expenses.filter(e => {
      const matchVehicle = filters.vehicleId === 'All' || e.vehicleId === filters.vehicleId;
      // Filter out trip expenses if filtering by customer (unless we link trip expenses to customers via tripId)
      // For simplicity, we include all expenses if customer is 'All', otherwise rough filter
      return matchVehicle;
    });

    return { trips: filteredTrips, expenses: filteredExpenses };
  }, [filters, trips, expenses]);

  // --- KPI Calculations ---

  const totalIncome = filteredData.trips.reduce((sum, t) => {
    const paid = t.payments.reduce((pSum, p) => pSum + p.amount, 0);
    return sum + convert(paid, t.currency, 'USD');
  }, 0);

  const totalExpenses = filteredData.expenses.reduce((sum, e) => {
    return sum + convert(e.amount, e.currency, 'USD');
  }, 0);

  const netProfit = totalIncome - totalExpenses;

  // --- Chart Data Preparation ---

  // 1. Profit by Vehicle (Aggregated)
  const vehicleProfitData = vehicles.map(v => {
    // Only include if matches filter
    if (filters.vehicleId !== 'All' && filters.vehicleId !== v.id) return null;

    const vTrips = filteredData.trips.filter(t => t.vehicleId === v.id);
    const vExpenses = filteredData.expenses.filter(e => e.vehicleId === v.id);

    const income = vTrips.reduce((sum, t) => sum + convert(t.totalPrice, t.currency, 'USD'), 0);
    const expense = vExpenses.reduce((sum, e) => sum + convert(e.amount, e.currency, 'USD'), 0);

    return {
      name: v.licensePlate,
      Income: income,
      Expenses: expense,
      Profit: income - expense
    };
  }).filter(Boolean);

  // 2. Expense Breakdown
  const expenseBreakdown = filteredData.expenses.reduce((acc, curr) => {
    const amount = convert(curr.amount, curr.currency, 'USD');
    acc[curr.category] = (acc[curr.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(expenseBreakdown).map(key => ({
    name: key,
    value: expenseBreakdown[key]
  }));

  // 3. Outstanding Payments
  const outstandingTrips = filteredData.trips.filter(t => {
    const paid = t.payments ? t.payments.reduce((s, p) => s + p.amount, 0) : 0;
    return (t.totalPrice - paid) > 0;
  }).sort((a, b) => {
    const balA = a.totalPrice - (a.payments ? a.payments.reduce((s, p) => s + p.amount, 0) : 0);
    const balB = b.totalPrice - (b.payments ? b.payments.reduce((s, p) => s + p.amount, 0) : 0);
    return balB - balA; // Descending
  });

  // 4. Monthly Trend (Aggregated from real data)
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(name => ({ name, Income: 0, Expenses: 0, Profit: 0 }));

    filteredData.trips.forEach(t => {
      const date = new Date(t.startDate);
      if (!isNaN(date.getTime())) {
        const monthIndex = date.getMonth();
        data[monthIndex].Income += convert(t.totalPrice, t.currency, 'USD');
      }
    });

    filteredData.expenses.forEach(e => {
      const date = new Date(e.date);
      if (!isNaN(date.getTime())) {
        const monthIndex = date.getMonth();
        data[monthIndex].Expenses += convert(e.amount, e.currency, 'USD');
      }
    });

    data.forEach(d => {
      d.Profit = d.Income - d.Expenses;
    });

    return data;
  }, [filteredData]);

  // Colors
  const COLORS = {
    navy: '#1E3A8A',
    orange: '#F97316',
    green: '#22c55e',
    steel: '#64748B',
    pie: ['#1E3A8A', '#F97316', '#3b82f6', '#64748B', '#94a3b8']
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Reports & Analytics</h1>
          <p className="text-steel mt-1">Financial performance and operational insights.</p>
        </div>
        <button className="bg-white border border-steel-lighter text-steel hover:text-primary hover:border-primary px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-xl border border-steel-lighter shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-primary font-bold mr-2">
          <Filter className="w-5 h-5" />
          <span>Filters:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto flex-1">
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-steel" />
            <select
              className="w-full pl-9 pr-4 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-steel bg-white appearance-none"
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="relative">
            <Truck className="absolute left-3 top-2.5 w-4 h-4 text-steel" />
            <select
              className="w-full pl-9 pr-4 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-steel bg-white appearance-none"
              value={filters.vehicleId}
              onChange={(e) => setFilters({ ...filters, vehicleId: e.target.value })}
            >
              <option value="All">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <TrendingUp className="absolute left-3 top-2.5 w-4 h-4 text-steel" />
            <select
              className="w-full pl-9 pr-4 py-2 border border-steel-lighter rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-steel bg-white appearance-none"
              value={filters.customerId}
              onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
            >
              <option value="All">All Customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="text-sm text-secondary font-medium hover:underline whitespace-nowrap"
          onClick={() => setFilters({ dateRange: 'This Year', vehicleId: 'All', customerId: 'All' })}
        >
          Reset Filters
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-steel uppercase tracking-wider">Total Income</p>
          </div>
          <h3 className="text-3xl font-bold text-primary">{formatCurrency(totalIncome)}</h3>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" /> +12.5% vs last period
          </p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg text-secondary">
              <TrendingDown className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-steel uppercase tracking-wider">Total Expenses</p>
          </div>
          <h3 className="text-3xl font-bold text-secondary">{formatCurrency(totalExpenses)}</h3>
          <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" /> +5.2% vs last period
          </p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-steel uppercase tracking-wider">Net Profit</p>
          </div>
          <h3 className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </h3>
          <p className="text-xs text-steel mt-2">
            Margin: {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm">
          <h3 className="text-xl font-bold text-primary mb-6">Financial Trend (Monthly)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94a3b8" />
                <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => [`$${value}`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="Income" stroke={COLORS.navy} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Expenses" stroke={COLORS.orange} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Profit" stroke={COLORS.green} strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit by Vehicle */}
        <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm">
          <h3 className="text-xl font-bold text-primary mb-6">Profitability by Vehicle</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleProfitData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#475569" width={80} style={{ fontSize: '12px', fontWeight: 500 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="Income" fill={COLORS.navy} radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="Expenses" fill={COLORS.orange} radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Expense Breakdown & AR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Pie */}
        <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm">
          <h3 className="text-xl font-bold text-primary mb-2">Expense Analysis</h3>
          <p className="text-sm text-steel mb-6">Breakdown by category</p>

          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `$${val}`} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-2xl font-bold text-primary">{pieData.length}</span>
                <span className="text-xs text-steel uppercase">Categories</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.pie[index % COLORS.pie.length] }}></div>
                <span className="text-steel truncate">{entry.name}</span>
                <span className="font-bold text-primary ml-auto">{((entry.value / totalExpenses) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outstanding Payments Table */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-primary">Accounts Receivable</h3>
              <p className="text-sm text-steel">Outstanding trip payments</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-steel uppercase font-bold">Total Pending</p>
              <p className="text-xl font-bold text-secondary">
                {formatCurrency(outstandingTrips.reduce((sum, t) => {
                  const paid = t.payments.reduce((p, c) => p + c.amount, 0);
                  const balance = t.totalPrice - paid;
                  // Convert each trip's balance to USD before summing
                  return sum + convert(balance, t.currency, 'USD');
                }, 0))}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-steel border-b border-steel-lighter">
                <tr>
                  <th className="pb-3 pl-2 font-medium">Trip ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 text-right font-medium pr-2">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outstandingTrips.length > 0 ? outstandingTrips.slice(0, 5).map(trip => {
                  const paid = trip.payments.reduce((s, p) => s + p.amount, 0);
                  const balance = trip.totalPrice - paid;
                  return (
                    <tr key={trip.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-3 pl-2 font-mono text-steel">{trip.id}</td>
                      <td className="py-3 text-primary font-medium">{trip.customerName}</td>
                      <td className="py-3 text-steel">{trip.startDate}</td>
                      <td className="py-3 text-right pr-2">
                        <Badge variant="warning">{formatCurrency(balance, trip.currency)}</Badge>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-steel">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-green-500 opacity-50" />
                        <p>No outstanding payments found. Good job!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {outstandingTrips.length > 5 && (
            <button className="mt-4 w-full py-2 text-sm text-primary font-medium border border-steel-lighter rounded-lg hover:bg-slate-50">
              View All Receivables
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
