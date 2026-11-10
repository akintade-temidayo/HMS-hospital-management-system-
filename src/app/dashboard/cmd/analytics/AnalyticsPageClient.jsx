'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { DateFilterBar } from '@/components/ui/organisms/analytics/DateFilterBar';
import { CmdOverviewTab } from '@/components/ui/organisms/analytics/CmdOverviewTab';
import { PatientAnalyticsTab } from '@/components/ui/organisms/analytics/PatientAnalyticsTab';
import { DepartmentAnalyticsTab } from '@/components/ui/organisms/analytics/DepartmentAnalyticsTab';
import { YearlyFinancialTab } from '@/components/ui/organisms/analytics/YearlyFinancialTab';
import { BarChart3, Users, Building2, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';
import { getAnalyticsData, normalizeCmdDashboard } from '@/utils/analyticsUtils';
import { getInvoiceList } from '@/utils/billingUtils';

const getCollectedInvoiceRevenue = (invoices, startDate, endDate) => {
    const hasDateFilter = Boolean(startDate || endDate);
    let hasDatedPayments = false;

    const total = invoices.reduce((sum, invoice) => {
        const amount = Number(invoice.paidAmount ?? invoice.paid_amount) || 0;
        if (amount <= 0) return sum;

        if (!hasDateFilter) return sum + amount;

        const paidAt = invoice.paidAt || invoice.paid_at || invoice.paymentDate || invoice.payment_date;
        if (!paidAt) return sum;
        hasDatedPayments = true;
        const paymentDate = String(paidAt).slice(0, 10);
        if (startDate && paymentDate < startDate) return sum;
        if (endDate && paymentDate > endDate) return sum;
        return sum + amount;
    }, 0);

    return { total, hasDatedPayments };
};

const getBudgets = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    return payload.budgets || payload.items || payload.results || [];
};

const getOperatingBudgetTotal = (budgets, startDate, endDate) => budgets.reduce((total, budget) => {
    const periodStart = (budget.periodStart || budget.period_start || '').slice(0, 10);
    const periodEnd = (budget.periodEnd || budget.period_end || '').slice(0, 10);
    const overlapsStart = !endDate || !periodStart || periodStart <= endDate;
    const overlapsEnd = !startDate || !periodEnd || periodEnd >= startDate;
    return overlapsStart && overlapsEnd ? total + (Number(budget.amount) || 0) : total;
}, 0);

export default function CMDAnalyticsPage() {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'patients' | 'departments' | 'yearly-financials'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [cmdOverview, setCmdOverview] = useState({});
    const [patientAnalytics, setPatientAnalytics] = useState({});
    const [departments, setDepartments] = useState([]);
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [selectedDeptData, setSelectedDeptData] = useState({});

    const [loading, setLoading] = useState(true);

    const fetchAnalytics = useCallback(async (filters = {}) => {
        try {
            const params = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const [overviewRes, patientRes, deptListRes, budgetRes, patientCountsRes, invoicesRes] = await Promise.all([
                api.get('/analytics/cmd-dashboard', { params }),
                api.get('/analytics/patients', { params }),
                api.get('/cmd/departments'),
                api.get('/governance/budgets').catch(() => null),
                api.get('/cmd/patients/counts').catch(() => null),
                api.get('/billings/invoices').catch(() => null),
            ]);

            const overview = normalizeCmdDashboard(getAnalyticsData(overviewRes));
            const invoiceRevenue = getCollectedInvoiceRevenue(
                invoicesRes ? getInvoiceList(invoicesRes) : [],
                filters.startDate,
                filters.endDate,
            );
            const revenue = filters.startDate || filters.endDate
                ? (overview.revenue || (invoiceRevenue.hasDatedPayments ? invoiceRevenue.total : 0))
                : (invoicesRes ? invoiceRevenue.total : overview.revenue);
            const rawPatientCounts = getAnalyticsData(patientCountsRes);
            const patientCounts = rawPatientCounts.counts || rawPatientCounts;
            const patientVolume = patientCounts.totalPatients ?? patientCounts.total_patients ?? patientCounts.totalPatientCount ?? patientCounts.patientCount ?? patientCounts.total ?? patientCounts.count;
            const expenses = budgetRes
                ? getOperatingBudgetTotal(getBudgets(budgetRes), filters.startDate, filters.endDate)
                : overview.expenses;
            setCmdOverview({
                ...overview,
                revenue,
                ...(patientVolume !== undefined && { totalPatients: Number(patientVolume) || 0 }),
                expenses,
                netOperatingIncome: revenue - expenses,
            });
            setPatientAnalytics(getAnalyticsData(patientRes));
            const departmentData = deptListRes.data.data || deptListRes.data || [];
            setDepartments(Array.isArray(departmentData) ? departmentData : departmentData.departments || []);
        } catch (err) {
            toast.error(err.message || 'Failed to fetch hospital analytics.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => fetchAnalytics());
    }, [fetchAnalytics]);

    const handleApplyFilters = () => {
        setLoading(true);
        fetchAnalytics({ startDate, endDate });
    };

    const handleResetFilters = () => {
        setStartDate('');
        setEndDate('');
        setLoading(true);
        fetchAnalytics();
    };

    useEffect(() => {
        if (!selectedDeptId) return;
        api.get(`/analytics/department/${encodeURIComponent(selectedDeptId)}`)
            .then((res) => setSelectedDeptData(getAnalyticsData(res)))
            .catch((err) => toast.error(err.message || 'Failed to fetch department telemetry.'));
    }, [selectedDeptId]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Analytics & KPIs</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Auditing financial telemetry, patient demographics, and departmental throughput across the hospital network.
                </p>
            </div>

            {activeTab !== 'yearly-financials' && <DateFilterBar
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />}

            <div className="flex items-center gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                        activeTab === 'overview'
                            ? 'border-(--primary-color) text-(--primary-color)'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <BarChart3 size={16} />
                    <span>Executive Overview</span>
                </button>
                <button
                    onClick={() => setActiveTab('patients')}
                    className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                        activeTab === 'patients'
                            ? 'border-(--primary-color) text-(--primary-color)'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Users size={16} />
                    <span>Patient Demographics</span>
                </button>
                <button
                    onClick={() => setActiveTab('departments')}
                    className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                        activeTab === 'departments'
                            ? 'border-(--primary-color) text-(--primary-color)'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Building2 size={16} />
                    <span>Department Telemetry</span>
                </button>
                <button
                    onClick={() => setActiveTab('yearly-financials')}
                    className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                        activeTab === 'yearly-financials'
                            ? 'border-(--primary-color) text-(--primary-color)'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <CalendarRange size={16} />
                    <span>Yearly Financials</span>
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs text-slate-400">Loading analytics telemetry...</div>
            ) : (
                <div className="pt-2">
                    {activeTab === 'overview' && <CmdOverviewTab data={cmdOverview} />}
                    {activeTab === 'patients' && <PatientAnalyticsTab data={patientAnalytics} />}
                    {activeTab === 'departments' && (
                        <DepartmentAnalyticsTab
                            departments={departments}
                            selectedDeptData={selectedDeptData}
                            onSelectDepartment={setSelectedDeptId}
                            selectedDeptId={selectedDeptId}
                        />
                    )}
                    {activeTab === 'yearly-financials' && <YearlyFinancialTab />}
                </div>
            )}
        </div>
    );
}
