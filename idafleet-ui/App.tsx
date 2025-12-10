

import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Fleet from './components/Fleet';
import Trips from './components/Trips';
import Expenses from './components/Expenses';
import Customers from './components/Customers';
import Reports from './components/Reports';
import Settings from './components/Settings';
import LoansPage from './components/loans/LoansPage';
import Login from './components/Login';
import FeedbackWidget from './components/FeedbackWidget';
import Logo from './components/Logo';
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Receipt,
  Users,
  BarChart3,
  CreditCard,
  Bell,
  Menu,
  LogOut,
  Settings as SettingsIcon,
  Globe
} from 'lucide-react';
import { CURRENT_USER } from './services/mockData';
import { CurrencyProvider, useCurrency } from './services/currencyContext';
import { Currency, User, Role } from './types';

type View = 'dashboard' | 'fleet' | 'trips' | 'expenses' | 'customers' | 'reports' | 'settings' | 'loans';

// Internal component to access Context inside Provider
const AppContent: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role>('employee');

  // Navigation State
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Access Global Currency Context
  const { displayCurrency, setDisplayCurrency } = useCurrency();

  // Restore session on mount
  React.useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const { auth } = await import('./services/api');
          const user = await auth.getCurrentUser();
          setUser({
            ...user,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email)}&background=1E3A8A&color=fff`
          });
          setUserRole(user.role);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Session restoration failed:', error);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        }
      }
    };
    restoreSession();
  }, []);

  // Handle Login
  const handleLogin = (userData: { name: string; email: string; role: Role }) => {
    setUser({
      id: `u-${Date.now()}`,
      ...userData,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=1E3A8A&color=fff`
    });
    setUserRole(userData.role);
    setIsAuthenticated(true);
    setCurrentView('dashboard'); // Reset to dashboard on login
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserRole('employee');
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet', icon: Truck },
    { id: 'trips', label: 'Track Shipments', icon: MapPin },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'loans', label: 'Loans', icon: CreditCard },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  if ((userRole === 'admin' || userRole === 'manager')) {
    navigation.push({ id: 'reports', label: 'Reports', icon: BarChart3 });
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'fleet': return <Fleet />;
      case 'trips': return <Trips />;
      case 'expenses': return <Expenses />;
      case 'loans': return <LoansPage />;
      case 'customers': return <Customers userRole={userRole} />;
      case 'reports': return (userRole === 'admin' || userRole === 'manager') ? <Reports /> : <div className="p-8 text-center text-red-500">Access Denied</div>;
      case 'settings': return <Settings userRole={userRole} />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
          <SettingsIcon className="w-12 h-12 mb-4" />
          <h2 className="text-xl font-semibold text-slate-600">Module Under Construction</h2>
          <p>The {currentView} module is coming soon.</p>
        </div>
      );
    }
  };

  // If not authenticated, show Login screen
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/10 flex justify-center">
            <Logo size="lg" variant="outline" />
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as View);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-blue-100 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}

            {/* Divider */}
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setCurrentView('settings');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${currentView === 'settings'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/5'
                  }`}
              >
                <SettingsIcon className="w-5 h-5" />
                Settings
              </button>
            </div>
          </nav>

          {/* User Profile / Footer */}
          <div className="p-4 border-t border-white/10 bg-primary-hover/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-blue-200 capitalize">{userRole}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-200 hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-surface border-b border-steel-lighter h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-steel hover:text-primary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs Placeholder */}
            <div className="hidden sm:flex items-center text-sm text-steel">
              <span className="hover:text-primary cursor-pointer">Home</span>
              <span className="mx-2">/</span>
              <span className="font-medium text-primary capitalize">{currentView}</span>
            </div>
          </div>

          <div className="flex-1 flex justify-end items-center gap-4">

            {/* Currency Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-steel-lighter px-3 py-1.5 rounded-lg">
              <Globe className="w-4 h-4 text-steel" />
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value as Currency)}
                className="bg-transparent text-sm font-medium text-primary focus:outline-none cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="RWF">RWF (FRW)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <button className="relative p-2 text-steel hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border-2 border-surface"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
      <FeedbackWidget />
    </div>
  );
}

// Main App Entry
const App: React.FC = () => {
  return (
    <CurrencyProvider>
      <AppContent />
    </CurrencyProvider>
  );
};

export default App;
