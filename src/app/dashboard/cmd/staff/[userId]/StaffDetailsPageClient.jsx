'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { ConfirmModal } from '@/components/ui/molecules/ConfirmModal';
import { ArrowLeft, Power, RefreshCw, UserPlus, Mail, Phone, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffDetailPage() {
const params = useParams();
const router = useRouter();
const userId = params?.userId;

const [staff, setStaff] = useState(null);
const [loading, setLoading] = useState(true);
const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });
const [actionLoading, setActionLoading] = useState(false);

const fetchStaffDetails = async () => {
    if (!userId) return;
    try {
    setLoading(true);
    const res = await api.get(`/cmd/staff/${userId}`);
    setStaff(res.data.data || res.data);
    } catch (err) {
    toast.error(err.message || 'Failed to fetch staff member details.');
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    let isMounted = true;

    const loadStaffDetails = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const res = await api.get(`/cmd/staff/${userId}`);
            if (isMounted) {
                setStaff(res.data.data || res.data);
            }
        } catch (err) {
            if (isMounted) {
                toast.error(err.message || 'Failed to fetch staff member details.');
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    loadStaffDetails();

    return () => {
        isMounted = false;
    };
}, [userId]);

const handleSuspend = async () => {
    setActionLoading(true);
    try {
    await api.delete(`/cmd/staff/${userId}`);
    toast.success('Staff account successfully suspended.');
    setModalConfig({ isOpen: false, type: null });
    fetchStaffDetails();
    } catch (err) {
    toast.error(err.message || 'Failed to suspend staff account.');
    } finally {
    setActionLoading(false);
    }
};

const handleReactivate = async () => {
    setActionLoading(true);
    try {
    await api.patch(`/cmd/staff/${userId}/reactivate`);
    toast.success('Staff account successfully reactivated.');
    setModalConfig({ isOpen: false, type: null });
    fetchStaffDetails();
    } catch (err) {
    toast.error(err.message || 'Failed to reactivate staff account.');
    } finally {
    setActionLoading(false);
    }
};

const handleMakeCmd = async () => {
    setActionLoading(true);
    try {
    await api.patch(`/cmd/users/${userId}/make-cmd`);
    toast.success('User successfully promoted to CMD administrative role.');
    setModalConfig({ isOpen: false, type: null });
    fetchStaffDetails();
    } catch (err) {
    toast.error(err.message || 'Failed to promote user to CMD.');
    } finally {
    setActionLoading(false);
    }
};

if (loading) {
    return (
    <div className="py-20 text-center text-xs text-slate-400 font-medium">
        Loading staff member profile...
    </div>
    );
}

if (!staff) {
    return (
    <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <p className="text-sm font-bold text-slate-700">Staff member not found.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/cmd/staff')}>
        Back to Staff Directory
        </Button>
    </div>
    );
}

const isSuspended = staff.status === 'SUSPENDED' || staff.is_suspended;
const staffName = staff.fullName
    || staff.full_name
    || staff.name
    || [staff.firstName || staff.first_name, staff.lastName || staff.last_name].filter(Boolean).join(' ')
    || staff.email
    || 'Staff member';

return (
    <div className="space-y-6 max-w-5xl mx-auto">
    {/* Back Navigation */}
    <div>
        <button
        onClick={() => router.push('/dashboard/cmd/staff')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
        <ArrowLeft size={16} />
        <span>Back to staff directory</span>
        </button>
    </div>

    {/* Profile Overview Card */}
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
        <div>
            <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{staffName}</h1>
            <Badge variant={isSuspended ? 'danger' : 'success'}>
                {isSuspended ? 'Suspended' : 'Active'}
            </Badge>
            </div>
        </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
        {isSuspended ? (
            <Button size="sm" variant="outline" onClick={() => setModalConfig({ isOpen: true, type: 'reactivate' })}>
            <RefreshCw size={14} />
            <span>Reactivate</span>
            </Button>
        ) : (
            <Button size="sm" variant="outline" className="text-rose-600 hover:bg-rose-50 border-rose-200" onClick={() => setModalConfig({ isOpen: true, type: 'suspend' })}>
            <Power size={14} />
            <span>Suspend</span>
            </Button>
        )}

        {staff.role !== 'CMD' && (
            <Button size="sm" variant="outline" onClick={() => setModalConfig({ isOpen: true, type: 'makeCmd' })}>
            <UserPlus size={14} />
            <span>Promote to CMD</span>
            </Button>
        )}
        </div>
    </div>

    {/* Detailed Metadata Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={14} /> Institutional Email
        </p>
        <p className="text-sm font-bold text-slate-900">{staff.email}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={14} /> Phone Number
        </p>
        <p className="text-sm font-bold text-slate-900">{staff.phone_number || staff.phone || 'Not provided'}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building size={14} /> Department / Unit
        </p>
        <p className="text-sm font-bold text-slate-900">{staff.departmentName || staff.department_id || 'General'}</p>
        </div>
    </div>

    {/* Role & Permissions Section */}
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Role & System Clearance</h3>
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
        <div>
            <p className="text-xs font-semibold text-slate-700">Assigned RBAC Role</p>
            <p className="text-xs text-slate-400 mt-0.5">Determines workspace access permissions across hospital modules.</p>
        </div>
        <span className="font-mono text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm">
            {staff.role}
        </span>
        </div>
    </div>

    {/* Confirmation Modal */}
    <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={
        modalConfig.type === 'suspend' ? 'Suspend Staff Account' :
        modalConfig.type === 'reactivate' ? 'Reactivate Staff Account' :
        'Promote User to CMD'
        }
        message={
        modalConfig.type === 'suspend' ? `Are you sure you want to suspend "${staff.fullName || staff.full_name}"? This will immediately revoke system access.` :
        modalConfig.type === 'reactivate' ? `Are you sure you want to reactivate "${staff.fullName || staff.full_name}"?` :
        `Are you sure you want to grant CMD administrative privileges to "${staff.fullName || staff.full_name}"?`
        }
        confirmText={
        modalConfig.type === 'suspend' ? 'Yes, Suspend' :
        modalConfig.type === 'reactivate' ? 'Yes, Reactivate' :
        'Yes, Promote to CMD'
        }
        variant={modalConfig.type === 'suspend' ? 'danger' : 'success'}
        isLoading={actionLoading}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
        onConfirm={() => {
        if (modalConfig.type === 'suspend') handleSuspend();
        else if (modalConfig.type === 'reactivate') handleReactivate();
        else if (modalConfig.type === 'makeCmd') handleMakeCmd();
        }}
    />
    </div>
);
}
