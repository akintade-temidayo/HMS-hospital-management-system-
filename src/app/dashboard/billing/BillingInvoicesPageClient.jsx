'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { CreateInvoiceModal } from '@/components/ui/organisms/billing/CreateInvoiceModal';
import { RecordPaymentModal } from '@/components/ui/organisms/billing/RecordPaymentModal';
import { PrintableReceiptModal } from '@/components/ui/organisms/billing/PrintableReceiptModal';
import { ReceiptText, Plus, CreditCard, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, getInvoiceList, getInvoiceBadgeVariant } from '@/utils/billingUtils';

export default function BillingInvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState(null);
    const [receiptData, setReceiptData] = useState(null);

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/billings/invoices');
            setInvoices(getInvoiceList(res));
        } catch (err) {
            toast.error(err.message || 'Failed to fetch invoices.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInvoices();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <ReceiptText className="text-(--primary-color)" size={28} />
                        <span>Patient Invoices & Billing</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Manage patient billing records, process incoming revenue payments, and generate official receipts[cite: 6, 11].
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>Create Invoice</span>
                </Button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs text-slate-400">Loading billing records...</div>
            ) : invoices.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center text-slate-400 text-xs">
                    No billing invoices recorded yet.
                </div>
            ) : (
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-3">Invoice Ref</th>
                                    <th className="px-6 py-3">Patient Folder ID</th>
                                    <th className="px-6 py-3">Total Amount</th>
                                    <th className="px-6 py-3">Paid Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {invoices.map((inv, index) => {
                                    const invId = inv.id || inv._id || `inv-${index}`;
                                    const patient = inv.patient || {};
                                    const folderId = patient.folderNumber || patient.folder_number || patient.patientId ;
                                    const status = inv.status || 'PENDING';

                                    return (
                                        <tr key={invId} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4 font-bold font-mono text-slate-900">{inv.invoiceNumber || invId.slice(0, 8)}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-600">{folderId}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                                            <td className="px-6 py-4 font-mono text-emerald-600 font-bold">{formatCurrency(inv.paidAmount)}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getInvoiceBadgeVariant(status)}>{status}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {status !== 'PAID' && (
                                                    <Button size="sm" onClick={() => setPaymentInvoice(inv)}>
                                                        <CreditCard size={14} />
                                                        <span>Pay</span>
                                                    </Button>
                                                )}
                                                {status === 'PAID' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setReceiptData({
                                                            invoiceNumber: inv.invoiceNumber || invId,
                                                            patientName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient',
                                                            patientId: folderId,
                                                            totalAmount: inv.totalAmount,
                                                            paidAmount: inv.paidAmount,
                                                            status: 'PAID',
                                                            items: inv.items || [],
                                                        })}
                                                    >
                                                        <Printer size={14} />
                                                        <span>Receipt</span>
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <CreateInvoiceModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchInvoices}
            />

            <RecordPaymentModal
                invoice={paymentInvoice}
                isOpen={!!paymentInvoice}
                onClose={() => setPaymentInvoice(null)}
                onSuccess={fetchInvoices}
                onReceiptGenerated={setReceiptData}
            />

            <PrintableReceiptModal
                receiptData={receiptData}
                isOpen={!!receiptData}
                onClose={() => setReceiptData(null)}
            />
        </div>
    );
}