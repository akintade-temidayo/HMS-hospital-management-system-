'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { TextInput } from '../atoms/TextInput';
import { EmailInput } from '../atoms/EmailInput';
import { PasswordInput } from '../atoms/PasswordInput';
import { PhoneInput } from '../atoms/PhoneInput';
import { SelectDropdown } from '../atoms/SelectDropdown';
import { Button } from '../atoms/Button';
import { UserCheck, ShieldCheck } from 'lucide-react';

export const StaffRegisterForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    hospitalCode: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'STAFF',
  });

  const roleOptions = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Staff', value: 'STAFF' },
  ];

  const departmentOptions = [
    'Billing & Accounting',
    'CMD',
    'Doctor',
    'Health Records',
    'Medical Laboratory',
    'Nurse',
    'Pharmacy',
  ].map((department) => ({ label: department, value: department }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.department) {
      setError('Please select your department.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.registerStaff({
        hospitalCode: form.hospitalCode.trim().toUpperCase(),
        department: form.department,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
      });
      router.push('/login');
    } catch (err) {
      setError(err.message || 'Staff registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-(--primary-color) text-white flex items-center justify-center mb-3 shadow-md">
          <UserCheck size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff Account Registration</h1>
        <p className="text-xs text-slate-500 mt-1">Submit pending staff credentials under your hospital code</p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <ShieldCheck size={16} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput 
          label="Hospital Code" 
          value={form.hospitalCode} 
          onChange={(e) => setForm({ ...form, hospitalCode: e.target.value })} 
          placeholder="HOS-XXXXXX" 
          required 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <EmailInput label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhoneInput label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <SelectDropdown label="Role" options={roleOptions} value={form.role} onChange={(val) => setForm({ ...form, role: val })} required />
        </div>

        <SelectDropdown
          label="Department"
          options={departmentOptions}
          value={form.department}
          onChange={(department) => setForm((current) => ({ ...current, department }))}
          placeholder="Select your department..."
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PasswordInput
            label="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            helperText="Use 8–15 characters, including a letter, a number, and a special character."
            required
          />
          <PasswordInput label="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
        </div>

        <Button type="submit" isLoading={loading} className="w-full py-3 mt-4">
          Submit Staff Application
        </Button>
      </form>
    </div>
  );
};
