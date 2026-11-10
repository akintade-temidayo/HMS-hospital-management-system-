'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { RecordExpenseModal } from '@/components/ui/organisms/billing/RecordExpenseModal';
import { Building2, Plus, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, getExpenseList } from '@/utils/billingUtils';

export default function OperationalExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    const fetchExpenses = useCallback(async () => {
        try {
            const res = await api.get('/billings/expenses');
            setExpenses(getExpenseList(res));
        } catch (err) {
            toast.error(err.message || 'Failed to fetch operational expenses.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchExpenses();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchExpenses]);

    const totalSpend = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Building2 className="text-(--primary-color)" size={28} />
                        <span>Hospital Operational Expenses</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Track internal facility spend, overhead costs, and operational expenditures[cite: 6, 10].
                    </p>
                </div>
                <Button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>Log Expense</span>
                </Button>
            </div>

            {/* Total Spend Counter */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between max-w-sm">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase text-slate-400">Total Recorded Spend</p>
                    <p className="text-xl font-extrabold text-slate-900 font-mono">{formatCurrency(totalSpend)}</p>
                </div>
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <Wallet size={24} />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs text-slate-400">Loading expense ledger...</div>
            ) : expenses.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center text-slate-400 text-xs">
                    No operational expenses recorded yet.
                </div>
            ) : (
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {expenses.map((exp, index) => {
                                    const expId = exp.id || exp._id || `exp-${index}`;
                                    return (
                                        <tr key={expId} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                {exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString('en-NG') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="info">{exp.category || 'General'}</Badge>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{exp.title}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-rose-600">{formatCurrency(exp.amount)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <RecordExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSuccess={fetchExpenses}
            />
        </div>
    );
}
