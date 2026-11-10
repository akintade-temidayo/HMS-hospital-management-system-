'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { ArrowLeft, Building2, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const asList = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};
const labelFor = (key) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');

export default function DepartmentDetailsPageClient() {
  const { departmentId } = useParams();
  const [department, setDepartment] = useState(null);
  const [staff, setStaff] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId) return;
    let active = true;
    Promise.allSettled([
      api.get(`/cmd/departments/${encodeURIComponent(departmentId)}`),
      api.get('/cmd/staff'),
      api.get(`/analytics/department/${encodeURIComponent(departmentId)}`),
    ]).then(([departmentResult, staffResult, analyticsResult]) => {
      if (!active) return;

      if (departmentResult.status === 'fulfilled') {
        const payload = unwrap(departmentResult.value);
        setDepartment(payload?.department || payload);
      } else {
        toast.error(departmentResult.reason?.message || 'Could not load department details.');
      }

      if (staffResult.status === 'fulfilled') {
        const payload = unwrap(staffResult.value);
        const staffList = asList(payload, ['staff', 'users', 'members']);
        setStaff(staffList.filter((member) => {
          const assignedId = member.departmentId || member.department_id || member.department?.id || member.department?.departmentId || member.department?.department_id;
          return String(assignedId || '') === String(departmentId);
        }));
      } else {
        toast.error(staffResult.reason?.message || 'Could not load department staff.');
      }

      if (analyticsResult.status === 'fulfilled') setAnalytics(unwrap(analyticsResult.value));
    }).finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [departmentId]);

  const activityItems = useMemo(() => {
    const items = analytics?.activities || analytics?.recentActivities || analytics?.recent_activities || analytics?.activityLog || analytics?.activity_log || [];
    return Array.isArray(items) ? items : [];
  }, [analytics]);
  const metricData = analytics?.metrics || analytics?.summary || analytics;
  const metrics = metricData && typeof metricData === 'object'
    ? Object.entries(metricData).filter(([key, value]) => !['activities', 'recentActivities', 'recent_activities', 'activityLog', 'activity_log', 'department'].includes(key) && ['string', 'number'].includes(typeof value))
    : [];

  if (loading) return <div className="mx-auto max-w-7xl py-16 text-center text-sm text-slate-500">Loading department details…</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link href="/dashboard/cmd/departments" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-(--primary-color)">
        <ArrowLeft size={16} /> Back to departments
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-slate-100 p-3 text-(--primary-color)"><Building2 size={22} /></span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{department?.name || department?.departmentName || department?.department_name || 'Department details'}</h1>
            <p className="mt-1 text-sm text-slate-500">{department?.description || 'Department staff and operational activity.'}</p>
            <p className="mt-2 font-mono text-xs text-slate-400">{department?.id || department?.department_id || departmentId}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-(--primary-color)" />
          <h2 className="text-base font-bold text-slate-900">Assigned staff ({staff.length})</h2>
        </div>
        {staff.length ? (
          <div className="divide-y divide-slate-100">
            {staff.map((member, index) => (
              <div key={member.id || member.userId || member.user_id || index} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    {member.fullName || member.full_name || member.name || [member.firstName || member.first_name, member.lastName || member.last_name].filter(Boolean).join(' ') || 'Staff member'}
                  </p>
                  {(member.email || member.workEmail || member.work_email) && (
                    <p className="mt-0.5 truncate text-xs text-slate-400">{member.email || member.workEmail || member.work_email}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500">{member.role || member.position || member.jobTitle || member.job_title || ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No staff are currently assigned to this department.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Activity size={18} className="text-(--primary-color)" />
          <h2 className="text-base font-bold text-slate-900">Department activity</h2>
        </div>
        {activityItems.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {activityItems.map((item, index) => (
              <li key={item.id || item.eventId || index} className="py-3">
                <p className="text-sm font-medium text-slate-800">{item.description || item.action || item.event || item.title || 'Department activity'}</p>
                {(item.createdAt || item.created_at || item.timestamp) && <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt || item.created_at || item.timestamp).toLocaleString()}</p>}
              </li>
            ))}
          </ul>
        ) : metrics.length > 0 ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map(([key, value]) => <div key={key} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-medium capitalize text-slate-500">{labelFor(key)}</dt><dd className="mt-1 text-lg font-bold text-slate-900">{String(value)}</dd></div>)}
          </dl>
        ) : (
          <p className="text-sm text-slate-500">No activity or analytics have been returned for this department.</p>
        )}
      </section>
    </div>
  );
}
