'use client';

import React, { useState } from 'react';
import { patientService } from '../../../services/patient.service';
import { TextInput } from '../atoms/TextInput';
import { PhoneInput } from '../atoms/PhoneInput';
import { SelectDropdown } from '../atoms/SelectDropdown';
import { Checkbox } from '../atoms/Checkbox';
import { Button } from '../atoms/Button';
import { UserPlus, ShieldCheck } from 'lucide-react';

export const PatientCreationForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    address: '',
    isEmergency: false,
  });

  const genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
    { label: 'Other', value: 'OTHER' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        phoneNumber: form.phone,
        address: form.address,
        isEmergency: form.isEmergency,
      };

      await patientService.createPatient(payload);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to register patient profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-(--primary-color)/10 text-(--primary-color)">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Patient Registration (MPI)</h2>
          <p className="text-xs text-slate-500">Create permanent lifetime medical record or emergency profile</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <ShieldCheck size={16} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <TextInput label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
          <SelectDropdown label="Gender" options={genderOptions} value={form.gender} onChange={(val) => setForm({ ...form, gender: val })} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhoneInput label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <TextInput label="Residential Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        </div>

        <div className="pt-2">
          <Checkbox 
            label="Register as Emergency Profile (TEMP-M-XXXX)" 
            checked={form.isEmergency} 
            onChange={(e) => setForm({ ...form, isEmergency: e.target.checked })} 
          />
        </div>

        <Button type="submit" isLoading={loading} className="w-full py-3 mt-4">
          Save Patient Record
        </Button>
      </form>
    </div>
  );
};