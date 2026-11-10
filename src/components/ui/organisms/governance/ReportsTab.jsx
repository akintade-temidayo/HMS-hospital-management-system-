'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

const extractReports = (response) => {
const payload = response?.data?.data ?? response?.data ?? response;
return Array.isArray(payload) ? payload : payload?.reports || [];
};

export const ReportsTab = () => {
const [reports, setReports] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    let active = true;
    api.get('/governance/reports')
    .then((response) => { if (active) setReports(extractReports(response)); })
    .catch((error) => { if (active) toast.error(error.message || 'Failed to fetch department reports.'); })
    .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
}, []);

return (
    <div className="space-y-6">
    <div>
        <h3 className="text-base font-bold text-slate-900">Department Performance Reports</h3>
        <p className="mt-1 text-xs text-slate-500">Review operational reports submitted by hospital departments.</p>
    </div>

    {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading department reports...</div>
    ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-xs text-slate-400">No department reports submitted yet.</div>
    ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {reports.map((report, index) => {
            const id = report.id || report._id || `${report.title || 'report'}-${index}`;
            const periodStart = report.periodStart || report.period_start;
            const periodEnd = report.periodEnd || report.period_end;
            return (
            <article key={id} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600"><FileText size={20} /></div>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-600">
                    {report.departmentName || report.department_name || report.department?.name || report.departmentId || report.department_id || 'Hospital Report'}
                </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{report.title}</h4>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{report.content}</p>
                {(periodStart || periodEnd) && (
                <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-400">
                    <Calendar size={14} />
                    <span>Period: {periodStart?.split('T')[0] || '—'} to {periodEnd?.split('T')[0] || '—'}</span>
                </div>
                )}
            </article>
            );
        })}
        </div>
    )}
    </div>
);
};
