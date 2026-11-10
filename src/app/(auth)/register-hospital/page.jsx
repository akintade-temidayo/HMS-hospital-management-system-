'use client';

import React from 'react';
import { HospitalRegisterForm } from '../../../components/ui/organisms/HospitalRegisterForm';

export default function RegisterHospitalPage() {
  return (
    <main className="min-h-screen bg-slate-900/5 flex items-center justify-center p-4 py-12">
      <HospitalRegisterForm />
    </main>
  );
}