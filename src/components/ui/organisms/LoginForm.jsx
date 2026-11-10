'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { authService } from '../../../services/auth.service';
import { EmailInput } from '../atoms/EmailInput';
import { PasswordInput } from '../atoms/PasswordInput';
import { Button } from '../atoms/Button';
import { Building2, Lock, ShieldCheck } from 'lucide-react';

const dashboardForDepartment = (user) => {
  const department = user?.departmentName
    || user?.department_name
    || (typeof user?.department === 'string' ? user.department : user?.department?.name)
    || '';
  const normalizedDepartment = department.trim().toLowerCase();
  const routes = {
    'billing & accounting': '/dashboard/billing',
    cmd: '/dashboard/cmd/dashboard',
    doctor: '/dashboard/opd',
    'health records': '/dashboard/records',
    'medical laboratory': '/dashboard/lab',
    nurse: '/dashboard/nurses',
    pharmacy: '/dashboard/pharmacy',
  };

  return routes[normalizedDepartment] || '/dashboard';
};

export const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const { branding } = useTheme();
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Submit only the email and password fields required by the login endpoint.
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login({
        email: email.trim(),
        password,
      });

      router.push(dashboardForDepartment(user));
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 transition-all">
      {/* Header Branding / Logo */}
      <div className="flex flex-col items-center text-center mb-8">
        {branding.logoUrl ? (
          <Image
            src={branding.logoUrl}
            alt="Hospital Logo"
            width={160}
            height={48}
            className="h-12 w-auto mb-4 object-contain"
          />
        ) : (
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md transition-colors"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <Building2 size={28} />
          </div>
        )}
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {branding.hospitalName || 'Hospital Portal'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Sign in with your email and password
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2 animate-in fade-in">
          <ShieldCheck size={16} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <EmailInput
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex justify-end text-xs">
          <a href="/forgot-password" className="font-semibold text-(--primary-color) hover:underline">
            Forgot password?
          </a>
        </div>

        <Button type="submit" isLoading={loading} className="w-full py-3 mt-2">
          <Lock size={16} />
          <span>Secure Login</span>
        </Button>

        <div className="text-center mt-4">
          <p className="text-xs text-slate-500">
            New facility?{' '}
            <a href="/register-hospital" className="font-semibold text-(--primary-color) hover:underline">
              Register Hospital
            </a>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Need staff access?{' '}
            <a href="/register-staff" className="font-semibold text-(--primary-color) hover:underline">
              Register Staff
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};
