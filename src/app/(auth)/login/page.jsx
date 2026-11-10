'use client';

import React from 'react';
import { LoginForm } from '../../../components/ui/organisms/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-900/5 flex items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}