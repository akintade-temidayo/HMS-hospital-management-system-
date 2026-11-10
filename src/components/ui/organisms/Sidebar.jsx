'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Modal } from '../atoms/Modal';
import { TasksTab } from './schedules/TasksTab';
import { ShiftsTab } from './schedules/ShiftsTab';
import {
  LayoutDashboard, Users, Calendar, ClipboardList, FlaskConical,
  Pill, ReceiptText, ShieldAlert, ChevronLeft, ChevronRight,
  Building2, CalendarClock, BarChart3, FileText, Archive, FolderHeart, Wallet
} from 'lucide-react';

const cmdLinks = [
  { label: 'CMD Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Departments', href: '/dashboard/cmd/departments', icon: Building2 },
  { label: 'Staff & Verification', href: '/dashboard/cmd/staff', icon: Users },
  { label: 'Governance', href: '/dashboard/cmd/governance', icon: ShieldAlert },
  { label: 'Schedules & Tasks', href: '/dashboard/cmd/schedules', icon: CalendarClock },
  { label: 'Analytics & KPIs', href: '/dashboard/cmd/analytics', icon: BarChart3 },
];

const adminLinks = [
  { label: 'Task Assignment', href: '/dashboard/admin/tasks', icon: FileText },
  { label: 'Shift Assignment', href: '/dashboard/admin/shifts', icon: CalendarClock },
];

const records = [
  { label: 'Patient Records', href: '/dashboard/records', icon: FolderHeart },
  { label: 'Patient Archive', href: '/dashboard/records/archive', icon: Archive },
];

const billingLinks = [
  { label: 'Billing & Invoices', href: '/dashboard/billing', icon: ReceiptText },
  { label: 'Operational Expenses', href: '/dashboard/billing/expenses', icon: Wallet },
];

const pharmacyLinks = [
  { label: 'Pharmacy & Stock', href: '/dashboard/pharmacy', icon: Pill },
];

const labLinks = [
  { label: 'Medical Lab', href: '/dashboard/lab', icon: FlaskConical },
];

const nurseLinks = [
  { label: 'Appointments & Queue', href: '/dashboard/nurses#queue', tab: 'queue', icon: Users },
  ...adminLinks,
];

const doctorLinks = [
  { label: 'OPD & Consultations', href: '/dashboard/opd#consultations', tab: 'consultations', icon: Calendar },
  { label: 'Patient Queue', href: '/dashboard/opd#queue', tab: 'queue', icon: Users },
];

export const Sidebar = ({ isOpen, isCollapsed, onCollapse, onNavigate }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = String(user?.role || 'STAFF').trim().toUpperCase();
  const departmentName = user?.departmentName
    || user?.department_name
    || (typeof user?.department === 'string' ? user.department : user?.department?.name)
    || '';
  const isBillingDepartment = String(departmentName).toLowerCase().includes('billing');
  const [activeTab, setActiveTab] = useState('queue');
  const [assignmentModal, setAssignmentModal] = useState(null);

  useEffect(() => {
    if (!['NURSE', 'DOCTOR'].includes(role)) return undefined;
    const syncTabFromHash = () => {
      const tab = window.location.hash.slice(1);
      if (tab) setActiveTab(tab);
    };
    const timeoutId = window.setTimeout(syncTabFromHash, 0);
    window.addEventListener('hashchange', syncTabFromHash);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('hashchange', syncTabFromHash);
    };
  }, [role]);

  const getNavLinks = () => {
    if (role === 'CMD') return [...cmdLinks, ...(isBillingDepartment ? billingLinks : [])];
    if (role === 'NURSE') return nurseLinks;
    if (role === 'DOCTOR') return doctorLinks;
    if (role === 'PHARMACIST') return [...pharmacyLinks, records[0]];
    if (role === 'LAB_TECH') return [...labLinks, records[0]];

    if (role === 'ADMIN') {
      if (pathname.startsWith('/dashboard/admin/shifts')) return [...adminLinks, ...(isBillingDepartment ? billingLinks : [])];
      if (pathname.startsWith('/dashboard/pharmacy')) return [...adminLinks, ...pharmacyLinks, ...(isBillingDepartment ? billingLinks : [])];
      if (pathname.startsWith('/dashboard/lab')) return [...adminLinks, ...labLinks, ...(isBillingDepartment ? billingLinks : [])];
      if (pathname.startsWith('/dashboard/nurses')) return nurseLinks;
      if (pathname.startsWith('/dashboard/records')) return [...records, ...adminLinks, ...(isBillingDepartment ? billingLinks : [])];
      if (pathname.startsWith('/dashboard/billing')) return [...(isBillingDepartment ? billingLinks : []), ...adminLinks];
      if (
        pathname.startsWith('/dashboard/opd')
        || pathname.startsWith('/dashboard/doctors')
        || pathname.startsWith('/dashboard/admin/tasks')
      ) return [...doctorLinks, ...adminLinks, ...(isBillingDepartment ? billingLinks : [])];
      return [...adminLinks, ...(isBillingDepartment ? billingLinks : [])];
    }

    const links = [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Queues & OPD', href: '/dashboard/opd', icon: Calendar },
    ];

    if (['ADMIN', 'DOCTOR'].includes(role)) links.push({ label: 'Vitals & Triage', href: '/dashboard/nurses', icon: ClipboardList });
    if (['ADMIN', 'LAB_TECH', 'DOCTOR'].includes(role)) links.push(...labLinks);
    if (['ADMIN', 'PHARMACIST'].includes(role)) links.push(...pharmacyLinks);
    if (isBillingDepartment) links.push(...billingLinks);
    if (role === 'ADMIN') links.push({ label: 'Governance & Reports', href: '/dashboard/governance', icon: ShieldAlert });
    return links;
  };

  const navLinks = getNavLinks();

  return (
    <>
      {isOpen && <button aria-label="Close navigation" onClick={onNavigate} className="fixed inset-x-0 bottom-0 top-16 z-30 bg-slate-950/40 md:hidden" />}
      <aside className={`fixed inset-y-16 left-0 z-40 flex w-64 flex-col justify-between border-r border-slate-200/80 bg-white p-4 transition-all duration-200 md:static md:z-auto md:min-h-[calc(100vh-4rem)] md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'} ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:shadow-none'}`}>
        <div className="space-y-1.5">
          <div className="mb-3 flex items-center justify-between px-3">
            {!isCollapsed && <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace Navigation</p>}
            <button
              type="button"
              onClick={onCollapse}
              className="hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:inline-flex"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
          {navLinks.map(({ label, href, tab, icon: Icon }) => {
            const linkPath = href.split('#')[0];
            const isModalLink = role === 'ADMIN' && href.startsWith('/dashboard/admin/');
            const isModalActive = isModalLink && assignmentModal === (href.endsWith('/tasks') ? 'tasks' : 'shifts');
            const isActive = isModalActive || (tab
              ? pathname === linkPath && activeTab === tab
              : pathname === href || (href === '/dashboard/billing' && pathname.startsWith('/dashboard/billing/')));
            const linkClassName = `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${isActive ? 'bg-(--primary-color) text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'} ${isCollapsed ? 'md:justify-center md:px-2' : ''}`;

            return (
              <Link
                key={href}
                href={href}
                title={isCollapsed ? label : undefined}
                onClick={(event) => {
                  onNavigate?.();
                  if (isModalLink) {
                    event.preventDefault();
                    setAssignmentModal(href.endsWith('/tasks') ? 'tasks' : 'shifts');
                  }
                }}
                className={linkClassName}
              >
                <Icon size={18} className="shrink-0" />
                <span className={isCollapsed ? 'md:hidden' : ''}>{label}</span>
              </Link>
            );
          })}
        </div>

        {!isCollapsed && (
          <div className="border-t border-slate-100 pt-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">Active Role</p>
              <p className="mt-0.5 font-mono text-xs font-bold text-slate-800">{role}</p>
            </div>
          </div>
        )}
      </aside>
      {role === 'ADMIN' && (
        <Modal
          isOpen={!!assignmentModal}
          onClose={() => setAssignmentModal(null)}
          title={assignmentModal === 'tasks' ? 'Task Assignment' : 'Shift Assignment'}
          description={assignmentModal === 'tasks'
            ? 'Assign work to staff in your department.'
            : 'Schedule shifts for staff in your department.'}
          maxWidth="max-w-6xl"
        >
          {assignmentModal === 'tasks' && <TasksTab departmentScoped />}
          {assignmentModal === 'shifts' && <ShiftsTab departmentScoped />}
        </Modal>
      )}
    </>
  );
};