'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShiftsTab } from '@/components/ui/organisms/schedules/ShiftsTab';

export default function AdminShiftsPageClient() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const isAdmin = String(user?.role || '').trim().toUpperCase() === 'ADMIN';

    useEffect(() => {
        if (!loading && !isAdmin) router.replace('/dashboard');
    }, [loading, isAdmin, router]);

    if (loading || !isAdmin) return <p className="py-16 text-center text-sm text-slate-500">Loading shift assignments...</p>;

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shift Assignment</h1>
                <p className="mt-1 text-sm text-slate-500">Schedule shifts for staff in your department.</p>
            </div>
            <ShiftsTab departmentScoped />
        </div>
    );
}
