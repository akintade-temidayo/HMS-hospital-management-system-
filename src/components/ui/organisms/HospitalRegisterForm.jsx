'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { TextInput } from '../atoms/TextInput';
import { EmailInput } from '../atoms/EmailInput';
import { PasswordInput } from '../atoms/PasswordInput';
import { PhoneInput } from '../atoms/PhoneInput';
import { Button } from '../atoms/Button';
import { Building, ShieldCheck } from 'lucide-react';

export const HospitalRegisterForm = () => {
  const router = useRouter();
  const { registerHospital } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    hospitalName: '',
    hospitalAddress: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerHospital({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        hospitalName: form.hospitalName,
        hospitalAddress: form.hospitalAddress,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Hospital registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-(--primary-color) text-white flex items-center justify-center mb-3 shadow-md">
          <Building size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Register Hospital Facility</h1>
        <p className="text-xs text-slate-500 mt-1">Setup your hospital tenant and Chief Medical Director account</p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <ShieldCheck size={16} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Hospital Name" value={form.hospitalName} onChange={(e) => handleChange('hospitalName', e.target.value)} required />
          <TextInput label="Hospital Address" value={form.hospitalAddress} onChange={(e) => handleChange('hospitalAddress', e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="CMD Full Name" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required />
          <EmailInput label="CMD Email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
        </div>

        <PhoneInput label="Phone Number" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} required />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PasswordInput label="Password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} required />
          <PasswordInput label="Confirm Password" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} required />
        </div>

        <Button type="submit" isLoading={loading} className="w-full py-3 mt-4">
          Complete Registration
        </Button>
      </form>
    </div>
  );
};
