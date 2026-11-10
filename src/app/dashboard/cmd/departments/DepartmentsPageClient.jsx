'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { ConfirmModal } from '@/components/ui/molecules/ConfirmModal';
import { MetricCard } from '@/components/ui/molecules/MetricCard';
import { Building2, Users, ShieldCheck, PowerOff, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function CMDDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffTotalCount, setStaffTotalCount] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Deactivation modal state
  const [selectedDept, setSelectedDept] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [reactivatingDepartmentId, setReactivatingDepartmentId] = useState(null);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/cmd/departments');
      const payload = res.data?.data ?? res.data;
      const list = Array.isArray(payload) ? payload : payload?.departments || [];
      setDepartments((current) => list.map((department) => {
        const id = department.id || department.department_id;
        const previous = current.find((item) => (item.id || item.department_id) === id);
        if (previous?._lifecycleOverride === 'INACTIVE' && !isInactive(department)) {
          return { ...department, status: 'DEACTIVATED', is_deactivated: true, is_active: false, active: false, _lifecycleOverride: 'INACTIVE' };
        }
        if (previous?._lifecycleOverride === 'ACTIVE' && isInactive(department)) {
          return { ...department, status: 'ACTIVE', is_deactivated: false, is_active: true, active: true, deactivated_at: null, deactivatedAt: null, _lifecycleOverride: 'ACTIVE' };
        }
        return { ...department, _lifecycleOverride: undefined };
      }));
    } catch (err) {
      toast.error(err.message || 'Failed to fetch hospital departments.');
    }
  };

  useEffect(() => {
    let active = true;
    Promise.allSettled([api.get('/cmd/departments'), api.get('/cmd/staff'), api.get('/cmd/staff/count')])
      .then(([departmentResult, staffResult, staffCountResult]) => {
        if (!active) return;
        if (departmentResult.status === 'fulfilled') {
          const payload = departmentResult.value.data?.data ?? departmentResult.value.data;
          setDepartments(Array.isArray(payload) ? payload : payload?.departments || []);
        } else {
          toast.error(departmentResult.reason?.message || 'Failed to fetch hospital departments.');
        }
        if (staffResult.status === 'fulfilled') {
          const payload = staffResult.value.data?.data ?? staffResult.value.data;
          setStaffMembers(Array.isArray(payload) ? payload : payload?.staff || payload?.users || payload?.members || []);
        }
        if (staffCountResult.status === 'fulfilled') {
          const payload = staffCountResult.value.data?.data ?? staffCountResult.value.data;
          const count = typeof payload === 'number' ? payload : payload?.staffCount ?? payload?.staff_count ?? payload?.totalStaff ?? payload?.total_staff ?? payload?.total ?? payload?.count;
          if (count !== undefined && Number.isFinite(Number(count))) setStaffTotalCount(Number(count));
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleDehydrateDepartment = async () => {
    if (!selectedDept) return;
    setIsDeactivating(true);
    try {
      const departmentId = selectedDept.id || selectedDept.department_id;
      await api.delete(`/cmd/departments/${departmentId}`);
      setDepartments((current) => current.map((department) => (
        (department.id || department.department_id) === departmentId
          ? { ...department, status: 'DEACTIVATED', is_deactivated: true, is_active: false, active: false, _lifecycleOverride: 'INACTIVE' }
          : department
      )));
      toast.success(`Department "${selectedDept.name}" successfully deactivated. Non-CMD staff suspended.`);
      setSelectedDept(null);
      await fetchDepartments();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate department.');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleReactivateDepartment = async (department) => {
    const departmentId = department.id || department.department_id;
    setReactivatingDepartmentId(departmentId);
    try {
      await api.patch(`/cmd/departments/${encodeURIComponent(departmentId)}/reactivate`);
      setDepartments((current) => current.map((item) => (
        (item.id || item.department_id) === departmentId
          ? { ...item, status: 'ACTIVE', is_deactivated: false, is_active: true, isActive: true, active: true, deactivated_at: null, deactivatedAt: null, _lifecycleOverride: 'ACTIVE' }
          : item
      )));
      toast.success(`Department "${department.name}" successfully reactivated.`);
      await fetchDepartments();
    } catch (err) {
      toast.error(err.message || 'Failed to reactivate department.');
    } finally {
      setReactivatingDepartmentId(null);
    }
  };

  const activeCount = departments.filter((d) => !isInactive(d)).length;
  const staffByDepartment = new Map();
  const staffByDepartmentName = new Map();
  let activeStaffCount = 0;
  for (const member of staffMembers) {
    const status = String(member.status || '').toUpperCase();
    if (member.is_suspended || status === 'SUSPENDED') continue;
    activeStaffCount += 1;
    const departmentId = member.departmentId || member.department_id || member.department?.id || member.department?.department_id;
    if (departmentId) staffByDepartment.set(String(departmentId), (staffByDepartment.get(String(departmentId)) || 0) + 1);
    const departmentName = member.departmentName || member.department_name || member.department?.name;
    if (departmentName) {
      const key = String(departmentName).trim().toLowerCase();
      staffByDepartmentName.set(key, (staffByDepartmentName.get(key) || 0) + 1);
    }
  }
  const hasStaffDirectory = staffMembers.length > 0;
  const totalStaffCount = staffTotalCount ?? (hasStaffDirectory
    ? activeStaffCount
    : departments.reduce((acc, d) => acc + Number(d.staff_count ?? d.staffCount ?? d.assigned_staff_count ?? d.assignedStaffCount ?? d.personnel_count ?? d.userCount ?? d.user_count ?? 0), 0));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Department Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor core functional units, staff distributions, and lifecycle states[cite: 1, 12].
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Core Units" 
          value={departments.length} 
          icon={Building2} 
          trend="Established operational units" 
          trendUp={true} 
        />
        <MetricCard 
          title="Active Units" 
          value={activeCount} 
          icon={ShieldCheck} 
          trend="Fully operational routing" 
          trendUp={true} 
        />
        <MetricCard 
          title="Assigned Personnel" 
          value={totalStaffCount} 
          icon={Users} 
          trend="Across all units" 
          trendUp={true} 
        />
      </div>

      {/* Departments Grid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Hospital Functional Units</h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">Loading departmental units...</div>
        ) : departments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No department records available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => {
              const deptId = dept.id || dept.department_id;
              const deptName = dept.name;
              const serverStaffCount = Number(dept.staff_count ?? dept.staffCount ?? dept.assigned_staff_count ?? dept.assignedStaffCount ?? dept.personnel_count ?? dept.userCount ?? dept.user_count ?? 0);
              const staffNameKey = String(deptName || '').trim().toLowerCase();
              const staffCount = staffByDepartment.get(String(deptId)) ?? staffByDepartmentName.get(staffNameKey) ?? serverStaffCount;
              const isDeactivated = isInactive(dept);

              return (
                <div 
                  key={deptId}
                  className={`relative border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    isDeactivated ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200 hover:border-[var(--primary-color)] shadow-sm'
                  }`}
                >
                  <Link href={`/dashboard/cmd/departments/${deptId}`} aria-label={`View ${deptName} staff and activity`} className="absolute inset-0 z-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-color)" />
                  <div className="relative z-10 pointer-events-none">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-[var(--primary-color)]">
                        <Building2 size={20} />
                      </div>
                      <Badge variant={isDeactivated ? 'danger' : 'success'}>
                        {isDeactivated ? 'Deactivated' : 'Active'}
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 hover:text-(--primary-color)">
                      {deptName}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">View department staff and activity</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                      <Users size={14} className="text-slate-400" />
                      <span>{staffCount} Active Assigned Staff</span>
                    </p>
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-mono text-slate-400">{deptId}</span>
                    {isDeactivated ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="pointer-events-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        isLoading={reactivatingDepartmentId === deptId}
                        disabled={reactivatingDepartmentId !== null}
                        onClick={() => handleReactivateDepartment(dept)}
                      >
                        <RotateCcw size={14} />
                        <span>Reactivate</span>
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="pointer-events-auto text-rose-600 hover:bg-rose-50 border-rose-200"
                        disabled={reactivatingDepartmentId !== null}
                        onClick={() => setSelectedDept(dept)}
                      >
                        <PowerOff size={14} />
                        <span>Deactivate</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deactivation Confirmation Modal */}
      <ConfirmModal
        isOpen={!!selectedDept}
        title="Deactivate Department"
        message={`Are you sure you want to deactivate "${selectedDept?.name}"? Assigned non-CMD staff will be suspended, while historical clinical data is preserved.`}
        confirmText="Yes, Deactivate Unit"
        variant="danger"
        isLoading={isDeactivating}
        onClose={() => setSelectedDept(null)}
        onConfirm={handleDehydrateDepartment}
      />
    </div>
  );
}

function isInactive(department) {
  const status = String(department.status || department.lifecycleStatus || department.lifecycle_status || '').toUpperCase();
  return ['DEACTIVATED', 'INACTIVE', 'DISABLED', 'SUSPENDED'].includes(status)
    || department.is_deactivated === true
    || department.is_active === false
    || department.isActive === false
    || department.active === false
    || Boolean(department.deactivated_at || department.deactivatedAt);
}
