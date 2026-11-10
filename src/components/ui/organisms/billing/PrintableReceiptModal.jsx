'use client';

import React from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { Printer } from 'lucide-react';
import { formatCurrency } from '@/utils/billingUtils';

export const PrintableReceiptModal = ({ receiptData, isOpen, onClose }) => {
    if (!receiptData || !isOpen) return null;

    const {
        invoiceNumber = 'INV-000000',
        patientName = 'N/A',
        patientId = 'PAT-XXXXX',
        totalAmount = 0,
        paidAmount = 0,
        status = 'PAID',
        paidAt = new Date().toISOString(),
        items = [],
    } = receiptData;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Official Payment Receipt"
            description="View or print printable payment receipt snapshot."
            maxWidth="max-w-lg"
        >
            <div className="space-y-6">
                {/* Print Container */}
                <div id="printable-receipt" className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 print:border-none print:p-0">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-4 text-center space-y-1">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Hospital Payment Receipt</h2>
                        <p className="text-xs text-slate-500 font-mono">Invoice Ref: {invoiceNumber}</p>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <p className="font-semibold text-slate-400 uppercase text-[10px]">Patient Name</p>
                            <p className="font-bold text-slate-900">{patientName}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-400 uppercase text-[10px]">Folder ID</p>
                            <p className="font-mono font-bold text-slate-900">{patientId}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-400 uppercase text-[10px]">Status</p>
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {status}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-400 uppercase text-[10px]">Payment Date</p>
                            <p className="font-mono font-medium text-slate-700">{new Date(paidAt).toLocaleString('en-NG')}</p>
                        </div>
                    </div>

                    {/* Itemized Table */}
                    {items.length > 0 && (
                        <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                                    <tr>
                                        <th className="p-2">Description</th>
                                        <th className="p-2 text-center">Qty</th>
                                        <th className="p-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="p-2 font-medium text-slate-800">{item.description}</td>
                                            <td className="p-2 text-center text-slate-500">{item.quantity || 1}</td>
                                            <td className="p-2 text-right font-mono text-slate-800">{formatCurrency(item.unitPrice || item.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Totals Summary */}
                    <div className="border-t border-slate-100 pt-4 space-y-1 text-right">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Total Charged:</span>
                            <span className="font-mono font-bold text-slate-900">{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-slate-900">
                            <span>Amount Paid:</span>
                            <span className="font-mono text-(--primary-color)">{formatCurrency(paidAmount)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 font-mono">
                        Thank you for choosing our hospital. Keep this receipt for official records.
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 print:hidden">
                    <Button type="button" variant="outline" onClick={onClose}>Close</Button>
                    <Button type="button" onClick={handlePrint} className="flex items-center gap-2">
                        <Printer size={16} />
                        <span>Print Receipt</span>
                    </Button>
                </div>
            </div>
        </Modal>
    );
};