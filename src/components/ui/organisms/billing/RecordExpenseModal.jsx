'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { SelectDropdown } from '@/components/ui/atoms/SelectDropdown';
import { api } from '@/services/api';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
    { value: 'Utilities', label: 'Utilities (Diesel, Power, Water)' },
    { value: 'Medical Supplies', label: 'Medical Supplies & Consumables' },
    { value: 'Maintenance', label: 'Equipment & Facility Maintenance' },
    { value: 'Salaries', label: 'Staff Allowances & Payroll' },
    { value: 'Logistics', label: 'Logistics & Transportation' },
    { value: 'Other', label: 'Other Operational Spend' },
];

export const RecordExpenseModal = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        category: 'Utilities',
        title: '',
        amount: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                category: form.category,
                title: form.title,
                amount: Number(form.amount),
                description: form.description || null,
                expenseDate: form.expenseDate ? new Date(form.expenseDate).toISOString() : new Date().toISOString(),
            };

            await api.post('/billings/expenses', payload);
            toast.success('Hospital expense logged successfully[cite: 10].');
            setForm({ category: 'Utilities', title: '', amount: '', description: '', expenseDate: new Date().toISOString().split('T')[0] });
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to record expense.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Log Hospital Operational Expense"
            description="Record internal overhead spend and costs."
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <SelectDropdown
                    label="Expense Category"
                    value={form.category}
                    onChange={(val) => setForm({ ...form, category: val })}
                    options={CATEGORY_OPTIONS}
                    required
                />

                <TextInput
                    label="Expense Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Generator Fuel Purchase"
                    required
                />

                <TextInput
                    type="number"
                    label="Amount (₦)"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    required
                />

                <TextInput
                    type="date"
                    label="Expense Date"
                    value={form.expenseDate}
                    onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                    required
                />
                <p className="-mt-3 text-xs italic text-slate-500">(The day this expense was made)</p>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">Description (Optional)</label>
                    <textarea
                        rows={2}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Additional details..."
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-(--primary-color) transition-all"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Log Expense</Button>
                </div>
            </form>
        </Modal>
    );
};
