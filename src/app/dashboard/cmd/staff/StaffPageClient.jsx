'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { SearchBar } from '@/components/ui/molecules/SearchBar';
import { ConfirmModal } from '@/components/ui/molecules/ConfirmModal';
import { Users, UserCheck, ShieldAlert, CheckCircle2, XCircle, Power, RefreshCw, UserPlus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const getStaffDisplayName = (staff) => {
  const people = [staff?.user, staff?.staff, staff].filter(Boolean);
  const candidates = people.flatMap((person) => {
    const firstName = person.firstName || person.first_name || person.givenName || person.given_name || '';
    const lastName = person.lastName || person.last_name || person.familyName || person.family_name || '';
    return [
      `${firstName} ${lastName}`.trim(),
      person.displayName,
      person.display_name,
      person.fullName,
      person.full_name,
      person.name,
    ];
  });
  return candidates.find((value) => typeof value === 'string' && value.trim() && !value.includes('@'))?.trim() || 'Name unavailable';
};

export default function CMDStaffPage() {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' or 'verification'
  const [staffList, setStaffList] = useState([]);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State for Confirmations
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, user: null, extraData: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, queueRes] = await Promise.all([
        api.get('/cmd/staff'),
        api.get('/cmd/verification-queue'),
      ]);
      setStaffList(staffRes.data.data || staffRes.data || []);
      setVerificationQueue(queueRes.data.data || queueRes.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch staff management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // Handle Verification (Approve / Reject)
  const handleVerifyAction = async (userId, action) => {
    setActionLoading(true);
    try {
      await api.patch(`/cmd/users/${userId}/verify`, { action });
      toast.success(`Staff account successfully ${action === 'APPROVE' ? 'approved' : 'rejected'}.`);
      setModalConfig({ isOpen: false, type: null, user: null });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to process verification action.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Suspend Staff
  const handleSuspendStaff = async (userId) => {
    setActionLoading(true);
    try {
      await api.delete(`/cmd/staff/${userId}`);
      toast.success('Staff account successfully suspended.');
      setModalConfig({ isOpen: false, type: null, user: null });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to suspend staff account.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reactivate Staff
  const handleReactivateStaff = async (userId) => {
    setActionLoading(true);
    try {
      await api.patch(`/cmd/staff/${userId}/reactivate`);
      toast.success('Staff account successfully reactivated.');
      setModalConfig({ isOpen: false, type: null, user: null });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to reactivate staff account.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Promote to CMD
  const handleMakeCmd = async (userId) => {
    setActionLoading(true);
    try {
      await api.patch(`/cmd/users/${userId}/make-cmd`);
      toast.success('User successfully promoted to CMD administrative role.');
      setModalConfig({ isOpen: false, type: null, user: null });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to promote user to CMD.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStaff = staffList.filter((s) => 
    getStaffDisplayName(s).toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Access Control</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage hospital personnel, review pending registration requests, and configure RBAC clearances[cite: 12, 16, 21].
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'border-  (--primary-color)] text-(--primary-color)'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={16} />
          <span>Staff Directory ({staffList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 relative ${
            activeTab === 'verification'
              ? 'border-(--primary-color) text- (--primary-color)]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck size={16} />
          <span>Verification Queue</span>
          {verificationQueue.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {verificationQueue.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Staff Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SearchBar 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search staff by name, email, or role..." 
              onClear={() => setSearch('')} 
            />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Staff Member</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-slate-400">Loading staff registry...</td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-slate-400">No staff accounts found.</td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => {
                      const userId = staff.id || staff.user_id;
                      const isSuspended = staff.status === 'SUSPENDED' || staff.is_suspended;
                      return (
                        <tr key={userId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/dashboard/cmd/staff/${userId}`} className="group inline-block">
                              <p className="font-bold text-slate-900 group-hover:text-(--primary-color) transition-colors flex items-center gap-1.5">
                                <span>{getStaffDisplayName(staff)}</span>
                              </p>
                              <p className="text-xs text-slate-400">{staff.email}</p>
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
                              {staff.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-600">
                            {staff.departmentName || staff.department_id || 'General'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={isSuspended ? 'danger' : 'success'}>
                              {isSuspended ? 'Suspended' : 'Active'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {isSuspended ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setModalConfig({ isOpen: true, type: 'reactivate', user: staff })}
                              >
                                <RefreshCw size={14} />
                                <span>Reactivate</span>
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-rose-600 hover:bg-rose-50 border-rose-200"
                                onClick={() => setModalConfig({ isOpen: true, type: 'suspend', user: staff })}
                              >
                                <Power size={14} />
                                <span>Suspend</span>
                              </Button>
                            )}
                            {staff.role !== 'CMD' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setModalConfig({ isOpen: true, type: 'makeCmd', user: staff })}
                              >
                                <UserPlus size={14} />
                                <span>Promote CMD</span>
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Verification Queue */}
      {activeTab === 'verification' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-500" />
              Pending Staff Registration Requests
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full">
              {verificationQueue.length} Awaiting Review
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Applicant Name</th>
                  <th className="px-6 py-3">Institutional Email</th>
                  <th className="px-6 py-3">Requested Role</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3 text-right">Verification Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-400">Loading verification queue...</td>
                  </tr>
                ) : verificationQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-400">No pending staff registrations.</td>
                  </tr>
                ) : (
                  verificationQueue.map((item) => {
                    const userId = item.id || item.user_id;
                    return (
                      <tr key={userId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{getStaffDisplayName(item)}</td>
                        <td className="px-6 py-4 text-xs text-slate-600">{item.email}</td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">{item.phone_number || item.phone}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                            onClick={() => setModalConfig({ isOpen: true, type: 'verify', user: item, extraData: 'APPROVE' })}
                          >
                            <CheckCircle2 size={14} />
                            <span>Approve</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-rose-600 hover:bg-rose-50 border-rose-200"
                            onClick={() => setModalConfig({ isOpen: true, type: 'verify', user: item, extraData: 'REJECT' })}
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={
          modalConfig.type === 'suspend' ? 'Suspend Staff Account' :
          modalConfig.type === 'reactivate' ? 'Reactivate Staff Account' :
          modalConfig.type === 'makeCmd' ? 'Promote User to CMD' :
          modalConfig.extraData === 'APPROVE' ? 'Approve Staff Registration' : 'Reject Staff Registration'
        }
        message={
          modalConfig.type === 'suspend' ? `Are you sure you want to suspend "${modalConfig.user?.fullName || modalConfig.user?.full_name}"? This will immediately revoke their system access.` :
          modalConfig.type === 'reactivate' ? `Are you sure you want to reactivate "${modalConfig.user?.fullName || modalConfig.user?.full_name}"? This will restore their system permissions.` :
          modalConfig.type === 'makeCmd' ? `Are you sure you want to grant CMD administrative privileges to "${modalConfig.user?.fullName || modalConfig.user?.full_name}"?` :
          modalConfig.extraData === 'APPROVE' ? `Approve registration request for "${modalConfig.user?.fullName || modalConfig.user?.full_name}"?` :
          `Reject and discard registration request for "${modalConfig.user?.fullName || modalConfig.user?.full_name}"?`
        }
        confirmText={
          modalConfig.type === 'suspend' ? 'Yes, Suspend' :
          modalConfig.type === 'reactivate' ? 'Yes, Reactivate' :
          modalConfig.type === 'makeCmd' ? 'Yes, Promote to CMD' :
          modalConfig.extraData === 'APPROVE' ? 'Approve Account' : 'Reject Request'
        }
        variant={modalConfig.type === 'suspend' || modalConfig.extraData === 'REJECT' ? 'danger' : 'success'}
        isLoading={actionLoading}
        onClose={() => setModalConfig({ isOpen: false, type: null, user: null })}
        onConfirm={() => {
          const userId = modalConfig.user?.id || modalConfig.user?.user_id;
          if (modalConfig.type === 'suspend') handleSuspendStaff(userId);
          else if (modalConfig.type === 'reactivate') handleReactivateStaff(userId);
          else if (modalConfig.type === 'makeCmd') handleMakeCmd(userId);
          else if (modalConfig.type === 'verify') handleVerifyAction(userId, modalConfig.extraData);
        }}
      />
    </div>
  );
}
