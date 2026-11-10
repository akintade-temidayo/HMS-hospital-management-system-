'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/ui/organisms/Navbar';
import { Sidebar } from '../../components/ui/organisms/Sidebar';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const role = String(user?.role || '').trim().toUpperCase();
  const departmentName = user?.departmentName
    || user?.department_name
    || (typeof user?.department === 'string' ? user.department : user?.department?.name)
    || '';
  const isBillingDepartment = String(departmentName).toLowerCase().includes('billing');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-(--primary-color) border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <Navbar onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {(role === 'CMD' || role === 'ADMIN' || role === 'NURSE' || role === 'DOCTOR' || role === 'PHARMACIST' || role === 'LAB_TECH' || isBillingDepartment || (role === 'STAFF' && pathname.startsWith('/dashboard/records')) ) && (
          <Sidebar
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
            onNavigate={() => setSidebarOpen(false)}
          />
        )}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
