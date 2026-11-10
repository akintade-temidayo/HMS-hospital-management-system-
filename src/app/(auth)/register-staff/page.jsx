'use client';

import React from 'react';
import { StaffRegisterForm } from '../../../components/ui/organisms/StaffRegisterForm';

export default function RegisterStaffPage() {
  return (
    <main className="min-h-screen bg-slate-900/5 flex items-center justify-center p-4 py-12">
      <StaffRegisterForm />
    </main>
  );
}