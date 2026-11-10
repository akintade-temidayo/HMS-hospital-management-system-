'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/billingUtils';

export const RecordPaymentModal = ({ invoice, isOpen, onClose, onSuccess, onReceiptGenerated }) => {
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!invoice || !isOpen) return null;

    const remainingBalance = (invoice.totalAmount || 0) - (invoice.paidAmount || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payAmount = Number(amount);
        if (!payAmount || payAmount <= 0) {
            toast.error('Please enter a valid payment amount.');
            return;
        }

        try {
            setSubmitting(true);
            const invoiceId = invoice.id || invoice._id;
            const res = await api.patch(`/billings/invoices/${invoiceId}/pay`, { amount: payAmount });
            
            toast.success('Payment recorded successfully.');
            const data = res?.data?.data ?? res?.data ?? {};
            
            // Check if receipt snapshot returned upon full payment
            if (data.receipt || data.status === 'PAID') {
                onReceiptGenerated(data.receipt || data);
            }

            setAmount('');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to record payment.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Record Patient Payment"
            description={`Invoice Ref: ${invoice.invoiceNumber || invoice.id}`}
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                        <span>Total Invoice Amount:</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>Already Paid:</span>
                        <span className="font-mono text-emerald-600">{formatCurrency(invoice.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                        <span>Remaining Balance:</span>
                        <span className="font-mono text-rose-600">{formatCurrency(remainingBalance)}</span>
                    </div>
                </div>

                <TextInput
                    type="number"
                    label="Payment Amount (₦)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Max ${remainingBalance}`}
                    max={remainingBalance}
                    required
                />

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Submit Payment</Button>
                </div>
            </form>
        </Modal>
    );
};