'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { NumberInput } from '@/components/ui/atoms/NumberInput';
import { TextAreaInput } from '@/components/ui/atoms/TextAreaInput';
import { SelectDropdown } from '@/components/ui/atoms/SelectDropdown';
import { DatePicker } from '@/components/ui/atoms/DatePicker';
import { Modal } from '@/components/ui/atoms/Modal';
import { Plus, Calendar, Building2, Edit3 } from 'lucide-react';
import { TbCurrencyNaira } from 'react-icons/tb';
import { toast } from 'sonner';

export const BudgetsTab = () => {
const [budgets, setBudgets] = useState([]);
const [departments, setDepartments] = useState([]);
const [loading, setLoading] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingBudget, setEditingBudget] = useState(null);
const [selectedBudget, setSelectedBudget] = useState(null);
const [form, setForm] = useState({ title: '', amount: '', departmentName: '', periodStart: '', periodEnd: '', notes: '' });
const [submitting, setSubmitting] = useState(false);
const departmentOptions = departments
    .map((department) => ({
        value: department.name || department.departmentName || department.department_name || '',
        label: department.name || department.departmentName || department.department_name || 'Department',
    }))
    .filter((option) => option.value);
const emptyForm = { title: '', amount: '', departmentName: '', periodStart: '', periodEnd: '', notes: '' };

const toIsoDateTime = (date) => new Date(`${date}T00:00:00.000Z`).toISOString();
const getBudgetUuid = (budget) => {
    const candidates = [budget?.budgetId, budget?.budget_id, budget?.uuid, budget?.id, budget?._id, budget?.budget?.id];
    return candidates.find((candidate) => typeof candidate === 'string' && /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(candidate));
};
const formatBudgetDate = (value) => {
    if (!value) return 'Not set';
    const [year, month, day] = String(value).split('T')[0].split('-').map(Number);
    if (!year || !month || !day) return String(value);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const handlePeriodStartChange = (periodStart) => {
    setForm((current) => ({
        ...current,
        periodStart,
        periodEnd: current.periodEnd && current.periodEnd < periodStart ? '' : current.periodEnd,
    }));
};

const fetchBudgets = async () => {
    try {
    const res = await api.get('/governance/budgets');
    const payload = res.data?.data ?? res.data;
    setBudgets(Array.isArray(payload) ? payload : payload?.budgets || []);
    } catch (err) {
    toast.error(err.message || 'Failed to fetch financial budgets.');
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    let active = true;
    api.get('/governance/budgets')
    .then((res) => {
        if (!active) return;
        const payload = res.data?.data ?? res.data;
        setBudgets(Array.isArray(payload) ? payload : payload?.budgets || []);
    })
    .catch((err) => {
        if (active) toast.error(err.message || 'Failed to fetch financial budgets.');
    })
    .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
}, []);

useEffect(() => {
    let active = true;
    api.get('/cmd/departments')
    .then((res) => {
        if (!active) return;
        const payload = res.data?.data ?? res.data;
        setDepartments(Array.isArray(payload) ? payload : payload?.departments || []);
    })
    .catch((err) => {
        if (active) toast.error(err.message || 'Failed to load hospital departments.');
    });
    return () => { active = false; };
}, []);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.periodStart || !form.periodEnd) {
        toast.error('Please select both the period start and end dates.');
        return;
    }
    if (form.periodEnd < form.periodStart) {
        toast.error('The period end date must be on or after the start date.');
        return;
    }
    setSubmitting(true);
    try {
    const commonPayload = {
        title: form.title,
        amount: Number(form.amount),
        periodStart: toIsoDateTime(form.periodStart),
        periodEnd: toIsoDateTime(form.periodEnd),
        notes: form.notes || '',
    };

    if (editingBudget) {
        const budgetId = getBudgetUuid(editingBudget);
        if (!budgetId) throw new Error('This budget does not include the UUID required by the update endpoint.');
        await api.patch(`/governance/budgets/${encodeURIComponent(budgetId)}`, commonPayload);
        toast.success('Budget successfully updated.');
    } else {
        await api.post('/governance/budgets', {
            ...commonPayload,
            ...(form.departmentName ? { departmentName: form.departmentName } : {}),
        });
        toast.success('Time-bound budget successfully created[cite: 14].');
    }
    setIsModalOpen(false);
    setEditingBudget(null);
    setForm(emptyForm);
    await fetchBudgets();
    } catch (err) {
    toast.error(err.message || 'Failed to save budget.');
    } finally {
    setSubmitting(false);
    }
};

return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
        <div>
        <h3 className="text-base font-bold text-slate-900">Financial Budgets</h3>
        <p className="text-xs text-slate-500 mt-1">Manage departmental allocations and time-bound financial controls.</p>
        </div>
        <Button onClick={() => { setEditingBudget(null); setForm(emptyForm); setIsModalOpen(true); }}>
        <Plus size={16} />
        <span>Create Budget</span>
        </Button>
    </div>

    {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading financial budgets...</div>
    ) : budgets.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-xs">
        No financial budgets recorded yet.
        </div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b) => {
            const id = getBudgetUuid(b) || b.id || b._id || `budget-${b.title}-${b.periodStart}`;
            const departmentId = b.departmentId || b.department_id || b.department?.id || '';
            const departmentName = b.departmentName || b.department_name || (typeof b.department === 'string' ? b.department : b.department?.name)
                || departments.find((department) => (department.id || department.department_id) === departmentId)?.name
                || (departmentId ? 'Department' : 'Hospital-wide');
            return (
            <article key={id} className="relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-(--primary-color) hover:shadow-md">
                <button
                    type="button"
                    aria-label={`View details for budget ${b.title}`}
                    onClick={() => setSelectedBudget(b)}
                    className="absolute inset-0 z-0 rounded-2xl focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--primary-color)"
                />
                <div className="relative z-10 pointer-events-none">
                <div className="flex items-end justify-between mb-3">
                    <button
                    type="button"
                    disabled={!getBudgetUuid(b)}
                    title={!getBudgetUuid(b) ? 'The budget API did not return the UUID required to edit it.' : 'Edit budget'}
                    onClick={() => {
                        setEditingBudget(b);
                        setForm({
                        title: b.title,
                        amount: b.amount,
                        departmentName: departmentName === 'Hospital-wide' ? '' : departmentName,
                        periodStart: b.periodStart?.split('T')[0] || '',
                        periodEnd: b.periodEnd?.split('T')[0] || '',
                        notes: b.notes || '',
                        });
                        setIsModalOpen(true);
                    }}
                    className="pointer-events-auto relative z-10 p-1.5 text-slate-400 hover:text-(--primary-color) transition-colors items-end"
                    >
                    <Edit3 size={16} />
                    </button>
                </div>

                <h4 className="text-base font-bold text-slate-900">{b.title}</h4>
                <p className="mt-1 flex items-center gap-0.5 text-xl font-extrabold text-emerald-600"><TbCurrencyNaira size={22} />{Number(b.amount || 0).toLocaleString()}</p>
                
                <div className="mt-4 space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-slate-400" />
                    <span>Department: {departmentName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{b.periodStart?.split('T')[0]} to {b.periodEnd?.split('T')[0]}</span>
                    </div>
                </div>
                </div>
            </article>
            );
        })}
        </div>
    )}

    <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Edit Financial Budget' : 'Create Time-Bound Budget'}
        description="Allocate and control financial limits across hospital units."
    >
        <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
            label="Budget Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Q3 Pharmacy Procurement"
            required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberInput
            label="Amount "
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="50000"
            required
            />
            {editingBudget ? (
                <div className="flex w-full flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">Department</span>
                    <div className="rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-600">{form.departmentName || 'Hospital-wide'}</div>
                </div>
            ) : (
                <SelectDropdown
                    label="Department (Optional)"
                    options={departmentOptions}
                    value={form.departmentName}
                    onChange={(departmentName) => setForm({ ...form, departmentName })}
                    placeholder="Hospital-wide"
                />
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
                label="Period Start"
                value={form.periodStart}
                onChange={handlePeriodStartChange}
                required
            />
            <DatePicker
                label="Period End"
                value={form.periodEnd}
                onChange={(periodEnd) => setForm({ ...form, periodEnd })}
                minDate={form.periodStart || undefined}
                required
            />
        </div>
        <TextAreaInput
            label="Notes / Description"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Optional notes..."
        />
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>{editingBudget ? 'Update Budget' : 'Create Budget'}</Button>
        </div>
        </form>
    </Modal>

    <Modal
        isOpen={!!selectedBudget}
        onClose={() => setSelectedBudget(null)}
        title={selectedBudget?.title || 'Budget details'}
        description="Time-bound hospital budget details."
    >
        {selectedBudget && (() => {
            const selectedDepartmentId = selectedBudget.departmentId || selectedBudget.department_id || selectedBudget.department?.id;
            const selectedDepartmentName = selectedBudget.departmentName || selectedBudget.department_name
                || (typeof selectedBudget.department === 'string' ? selectedBudget.department : selectedBudget.department?.name)
                || departments.find((department) => (department.id || department.department_id) === selectedDepartmentId)?.name
                || (selectedDepartmentId ? 'Department' : 'Hospital-wide');
            return (
                <div className="space-y-5">
                    <div className="flex items-center gap-1 text-2xl font-extrabold text-emerald-600">
                        <TbCurrencyNaira size={26} />
                        <span>{Number(selectedBudget.amount || 0).toLocaleString()}</span>
                    </div>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-800">{selectedDepartmentName}</dd>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Period</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-800">
                                {formatBudgetDate(selectedBudget.periodStart || selectedBudget.period_start)} – {formatBudgetDate(selectedBudget.periodEnd || selectedBudget.period_end)}
                            </dd>
                        </div>
                    </dl>
                    <div className="rounded-xl border border-slate-200 p-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes / Description</h4>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selectedBudget.notes || 'No notes provided.'}</p>
                    </div>
                    <div className="flex justify-end border-t border-slate-100 pt-4">
                        <Button type="button" variant="outline" onClick={() => setSelectedBudget(null)}>Close</Button>
                    </div>
                </div>
            );
        })()}
    </Modal>
    </div>
);
};
