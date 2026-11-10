'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { Badge } from '@/components/ui/atoms/Badge';
import { Activity, CalendarRange, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/analyticsUtils';

const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

const getValue = (...values) => {
    const value = values.find((candidate) => candidate !== undefined && candidate !== null);
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getBreakdown = (data) => {
    const breakdown = data?.budgetBreakdown || data?.budget_breakdown || data?.budgets || [];
    return Array.isArray(breakdown) ? breakdown : breakdown?.items || [];
};

const financialPeriod = () => {
    const year = new Date().getFullYear();
    return { startDate: `${year}-01-01`, endDate: `${year + 1}-01-01` };
};

export const YearlyFinancialTab = () => {
    const [period, setPeriod] = useState(financialPeriod);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchYearlyFinancials = useCallback(async (range) => {
        setLoading(true);
        try {
            const response = await api.get('/analytics/cmd-dashboard/yearly', {
                params: { startDate: range.startDate, endDate: range.endDate },
            });
            setData(getPayload(response));
        } catch (error) {
            toast.error(error.message || 'Failed to load yearly financial analytics.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => fetchYearlyFinancials(period));
    }, [fetchYearlyFinancials]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!period.startDate || !period.endDate || period.endDate <= period.startDate) {
            toast.error('Choose a valid period. The exclusive end date must be after the start date.');
            return;
        }
        fetchYearlyFinancials(period);
    };

    const revenue = getValue(data?.revenue, data?.totalRevenue, data?.total_revenue);
    const budgetBreakdown = getBreakdown(data);
    const breakdownTotal = budgetBreakdown.reduce((total, budget) => total + getValue(budget.amount, budget.total, budget.budgetAmount, budget.budget_amount), 0);
    const operatingExpenses = getValue(data?.operatingExpenses, data?.operating_expenses, data?.totalBudget, data?.total_budget, data?.budgetTotal, data?.budget_total, breakdownTotal);
    const netIncome = getValue(data?.netOperatingIncome, data?.net_operating_income, data?.netIncome, data?.net_income, revenue - operatingExpenses);

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-900">Yearly Financial Performance</h3>
                    <p className="mt-1 text-xs text-slate-500">Revenue is counted by payment date. Budgets are included when they overlap the period.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-end">
                    <TextInput
                        type="date"
                        label="Start Date"
                        value={period.startDate}
                        onChange={(event) => setPeriod((current) => ({ ...current, startDate: event.target.value }))}
                        required
                    />
                    <div className="w-full">
                        <TextInput
                            type="date"
                            label="End Date (Exclusive)"
                            value={period.endDate}
                            onChange={(event) => setPeriod((current) => ({ ...current, endDate: event.target.value }))}
                            required
                        />
                        <p className="mt-1 text-[11px] text-slate-500">The selected end date is excluded from the report.</p>
                    </div>
                    <Button type="submit" isLoading={loading} className="shrink-0">
                        <CalendarRange size={15} />
                        <span>Apply Period</span>
                    </Button>
                </form>
            </section>

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2"><RefreshCw size={16} className="animate-spin" />Loading yearly financials...</span>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <FinancialMetric title="Revenue Received" value={revenue} description="Payments received during the selected period" icon={TrendingUp} tone="emerald" />
                        <FinancialMetric title="Operating Budget" value={operatingExpenses} description="Budgets overlapping the selected period" icon={TrendingDown} tone="rose" />
                        <FinancialMetric title="Net Operating Income" value={netIncome} description="Revenue minus operating budget" icon={Activity} tone="teal" />
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h3 className="text-sm font-bold text-slate-900">Budget Breakdown</h3>
                            <p className="mt-1 text-xs text-slate-500">Budget allocations that overlap this reporting period.</p>
                        </div>
                        {budgetBreakdown.length === 0 ? (
                            <p className="px-5 py-10 text-center text-sm text-slate-500">No overlapping budgets were returned for this period.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] text-left">
                                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-5 py-3">Budget</th>
                                            <th className="px-5 py-3">Department</th>
                                            <th className="px-5 py-3">Period</th>
                                            <th className="px-5 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {budgetBreakdown.map((budget, index) => {
                                            const department = budget.departmentName || budget.department_name || budget.department?.name || 'Hospital-wide';
                                            const amount = getValue(budget.amount, budget.total, budget.budgetAmount, budget.budget_amount);
                                            return (
                                                <tr key={budget.id || budget.budgetId || budget.budget_id || `${budget.title || 'budget'}-${index}`}>
                                                    <td className="px-5 py-4 font-semibold text-slate-900">{budget.title || budget.name || 'Budget allocation'}</td>
                                                    <td className="px-5 py-4"><Badge variant="default">{department}</Badge></td>
                                                    <td className="px-5 py-4 text-xs text-slate-600">
                                                        {budget.periodStart || budget.period_start ? String(budget.periodStart || budget.period_start).slice(0, 10) : '—'}
                                                        {' – '}
                                                        {budget.periodEnd || budget.period_end ? String(budget.periodEnd || budget.period_end).slice(0, 10) : '—'}
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-bold text-slate-900">{formatCurrency(amount)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

const FinancialMetric = ({ title, value, description, icon: Icon, tone }) => {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        teal: 'bg-teal-50 text-teal-600',
    };

    return (
        <article className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>
                <span className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon size={18} /></span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(value)}</p>
            <p className="text-xs text-slate-500">{description}</p>
        </article>
    );
};
