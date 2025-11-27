
import React, { useState } from 'react';
import { Truck, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { Role } from '../types';

interface LoginProps {
  onLogin: (user: { name: string; email: string; role: Role }) => void;
}

import { auth } from '../services/api';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      if (!trimmedEmail || !trimmedPassword) {
        setError('Please enter both email and password.');
        setIsLoading(false);
        return;
      }

      const { user, token } = await auth.login(trimmedEmail, trimmedPassword);

      // Store token
      localStorage.setItem('authToken', token);

      onLogin({
        name: (user.first_name && user.last_name) ? `${user.first_name} ${user.last_name}` : user.email,
        email: user.email,
        role: user.role as Role
      });
    } catch (err: any) {
      console.error('Login failed:', err);
      console.log('Error config:', err.config);
      console.log('Error response:', err.response);

      let errorMessage = 'Invalid email or password. Please try again.';

      if (err.response) {
        // Server responded with a status code
        errorMessage = err.response.data?.error || `Server Error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network Error: No response from server. Check if backend is running.';
      } else {
        // Something happened in setting up the request
        errorMessage = `Request Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-xl">I</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">IDA Logistics</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Global Infrastructure & <br />Creative Solutions
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Building the future of IDA. Sustainable logistics and premium living integrated into one seamless platform.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-blue-300">
          © 2025 IDA Limited Group. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">I</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-600">Enter your credentials to access the client portal.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-900">Password</label>
                  <a href="#" className="text-sm font-medium text-secondary hover:text-secondary-hover">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Secure Login'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Helper for Demo */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500 uppercase tracking-wider font-medium mb-4">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setEmail('test@example.com'); setPassword('password123'); }}
                className="p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-blue-50 transition-all text-left group"
              >
                <p className="text-sm font-bold text-slate-700 group-hover:text-primary">Admin User</p>
                <p className="text-xs text-slate-500">Full Access</p>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('employee@idalogistics.com'); setPassword('password'); }}
                className="p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-blue-50 transition-all text-left group"
              >
                <p className="text-sm font-bold text-slate-700 group-hover:text-primary">Employee</p>
                <p className="text-xs text-slate-500">Restricted</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
