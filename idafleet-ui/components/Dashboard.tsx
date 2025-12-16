import React, { useEffect, useState } from 'react';
import { useCurrency } from '../services/currencyContext';
import api, { trips as tripsApi, expenses as expensesApi, vehicles as vehiclesApi, reminders as remindersApi } from '../services/api';
import { loansService } from '../services/loans';
import { Trip, Expense, Vehicle, Reminder, BankLoan, PersonalLoan, AdvancePayment, UnpaidFuel } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Truck, AlertCircle, CreditCard } from 'lucide-react';
import { Badge } from './ui/Badge';

// Moved KPICard definition to top to avoid hoisting issues
const KPICard: React.FC<{ title: string; amount: string; icon: React.ReactNode; trend: string; trendColor: string }> = ({
  title, amount, icon, trend, trendColor
}) => (
  <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
        {icon}
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-steel uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-primary">{amount}</h3>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center">
      <span className={`text-xs font-semibold ${trendColor}`}>{trend}</span>
    </div>
  </div>
);

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const Dashboard: React.FC = () => {
  const { convert, format, displayCurrency } = useCurrency();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [bankLoans, setBankLoans] = useState<BankLoan[]>([]);
  const [personalLoans, setPersonalLoans] = useState<PersonalLoan[]>([]);
  const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>([]);
  const [unpaidFuel, setUnpaidFuel] = useState<UnpaidFuel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsData, expensesData, vehiclesData, remindersData] = await Promise.all([
          tripsApi.getAll(),
          expensesApi.getAll(),
          vehiclesApi.getAll(),
          remindersApi.getAll()
        ]);
        setTrips(tripsData);
        setExpenses(expensesData);
        setVehicles(vehiclesData);
        setReminders(remindersData);

        // Fetch loans data (silently fail if unauthorized - non-admin users)
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
        } catch (loanError) {
          // Non-admin users won't have access to loans - that's OK
          console.log('Loans data not available (may require admin access)');
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Dynamic KPI Calculation ---

  // 1. Total Income (Converted to Display Currency)
  const totalIncome = trips.reduce((acc, trip) => {
    const paidAmount = trip.payments.reduce((sum, p) => sum + p.amount, 0);
    // Payment amounts are in trip.currency
    return acc + convert(paidAmount, trip.currency);
  }, 0);

  // 2. Total Expenses
  const totalExpenses = expenses.reduce((acc, exp) => {
    return acc + convert(exp.amount, exp.currency);
  }, 0);

  // 3. Pending Payments (Outstanding Balance)
  const pendingPayments = trips.reduce((acc, trip) => {
    const paidAmount = trip.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = trip.totalPrice - paidAmount;
    return acc + convert(balance, trip.currency);
  }, 0);

  const netProfit = totalIncome - totalExpenses;
  const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
  const overdueReminders = reminders.filter(r => r.status === 'Overdue');

  // 4. Total Outstanding Loans (all loan types combined)
  const totalLoansOutstanding = React.useMemo(() => {
    const bankTotal = bankLoans.reduce((acc, loan) =>
      acc + convert(loan.remaining_amount || 0, loan.currency as any), 0);
    const personalTotal = personalLoans.reduce((acc, loan) =>
      acc + convert(loan.remaining_balance || 0, loan.currency as any), 0);
    const advanceTotal = advancePayments.reduce((acc, adv) =>
      acc + convert(adv.remaining_amount || 0, adv.currency as any), 0);
    const fuelTotal = unpaidFuel.reduce((acc, fuel) =>
      acc + convert(fuel.remaining_balance || 0, fuel.currency as any), 0);
    return bankTotal + personalTotal + advanceTotal + fuelTotal;
  }, [bankLoans, personalLoans, advancePayments, unpaidFuel, convert]);

  const totalLoansCount = bankLoans.length + personalLoans.length + advancePayments.length + unpaidFuel.length;

  // --- Chart Data Mock (Scaling values to match currency) ---
  // In a real app, you would aggregate historical data properly. 
  // Here we just scale the mock chart data for visualization.
  const rate = convert(1, 'USD'); // Get multiplier from USD to Display

  const monthlyData = [
    { name: 'Aug', income: 4000 * rate, expense: 2400 * rate },
    { name: 'Sep', income: 3000 * rate, expense: 1398 * rate },
    { name: 'Oct', income: 2000 * rate, expense: 9800 * rate },
    { name: 'Nov', income: 2780 * rate, expense: 3908 * rate },
    { name: 'Dec', income: 1890 * rate, expense: 4800 * rate },
    { name: 'Jan', income: 6390 * rate, expense: 3800 * rate },
  ];

  // --- Expense Breakdown Aggregation ---
  const expenseCategoryData = React.useMemo(() => {
    const aggregation: { [key: string]: number } = {};

    expenses.forEach(exp => {
      const cat = exp.category || 'Other';
      const amount = convert(exp.amount, exp.currency);
      aggregation[cat] = (aggregation[cat] || 0) + amount;
    });

    return Object.entries(aggregation)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [expenses, convert]);

  const COLORS = ['#1E3A8A', '#F97316', '#64748B', '#3b82f6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
        <p className="text-steel mt-1">Viewing financial data in <span className="font-bold text-primary">{displayCurrency}</span>.</p>
      </div>

      {/* System Alert Widget */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <div className="p-1 bg-primary rounded-full text-white mt-0.5">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-primary font-bold text-sm">System Update</h4>
          <p className="text-primary text-sm mt-0.5">Global currency conversion is now active. All figures update automatically.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Income"
          amount={format(totalIncome)}
          icon={<DollarSign className="text-primary w-5 h-5" />}
          trend="+12% from last month"
          trendColor="text-green-600"
        />
        <KPICard
          title="Total Expenses"
          amount={format(totalExpenses)}
          icon={<TrendingDown className="text-secondary w-5 h-5" />}
          trend="+5% from last month"
          trendColor="text-red-500"
        />
        <KPICard
          title="Net Profit"
          amount={format(netProfit)}
          icon={<TrendingUp className="text-primary w-5 h-5" />}
          trend="Healthy margin"
          trendColor="text-primary"
        />
        <KPICard
          title="Outstanding Balance"
          amount={format(pendingPayments)}
          icon={<Wallet className="text-secondary w-5 h-5" />}
          trend="Action needed"
          trendColor="text-secondary"
        />
        {totalLoansCount > 0 && (
          <KPICard
            title="Loans Outstanding"
            amount={format(totalLoansOutstanding)}
            icon={<CreditCard className="text-red-500 w-5 h-5" />}
            trend={`${totalLoansCount} active loan${totalLoansCount !== 1 ? 's' : ''}`}
            trendColor="text-red-500"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-primary">Financial Performance</h3>
            <select className="text-sm border-steel-lighter rounded-md px-2 py-1 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 text-steel">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => format(value).replace(/[^0-9.,]/g, '')} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [format(value), '']}
                />
                <Area type="monotone" dataKey="income" stroke="#1E3A8A" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart / Stats */}
        <div className="bg-surface p-6 rounded-xl border border-steel-lighter shadow-sm">
          <h3 className="font-bold text-xl text-primary mb-6">Expense Breakdown</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {expenseCategoryData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-steel">{item.name}</span>
                </div>
                <span className="font-bold text-primary">{format(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-steel-lighter shadow-sm overflow-hidden">
          <div className="p-4 border-b border-steel-lighter flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-primary">Recent Shipments</h3>
            <button className="text-sm text-secondary font-medium hover:text-secondary-hover">View All</button>
          </div>
          <div className="divide-y divide-steel-lighter">
            {trips.slice(0, 3).map(trip => (
              <div key={trip.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-steel font-medium">{trip.id}</span>
                      <span className="text-xs text-steel">• {trip.startDate}</span>
                    </div>
                    <p className="font-medium text-primary mt-0.5">{trip.customerName}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {/* Original Amount */}
                    <p className="font-bold text-primary">{format(convert(trip.totalPrice, trip.currency))}</p>
                    <p className="text-xs text-steel-light">Orig: {trip.currency} {formatCurrency(trip.totalPrice, trip.currency)}</p>
                    <Badge variant={
                      trip.status === 'Delivered' ? 'delivered' :
                        trip.status === 'In Transit' ? 'transit' : 'pending'
                    }>{trip.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-steel-lighter shadow-sm overflow-hidden">
          <div className="p-4 border-b border-steel-lighter flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-primary">Fleet Status</h3>
            <Truck className="w-4 h-4 text-steel" />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-steel">Active Vehicles</span>
              <span className="text-sm font-bold text-primary">{activeVehicles} / {vehicles.length}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
              <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-steel mb-3">Attention Needed</h4>
            <div className="space-y-3">
              {overdueReminders.length > 0 ? (
                overdueReminders.map(reminder => {
                  const vehicle = vehicles.find(v => v.id === reminder.vehicleId);
                  return (
                    <div key={reminder.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-bold text-red-800">{reminder.title}</p>
                        <p className="text-xs text-red-600">
                          {vehicle ? `${vehicle.licensePlate} - ` : ''}{reminder.type}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-steel italic">No immediate attention needed.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;