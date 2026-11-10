'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { FileText, User } from 'lucide-react';

export const ViewPatientLabSummaryModal = ({ patientId, isOpen, onClose }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !patientId) return;

        const fetchSummary = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/patients/${patientId}/summary`);
                const data = res?.data?.data ?? res?.data ?? null;
                setSummary(data);
            } catch (err) {
                toast.error(err.message || 'Failed to fetch patient summary.');
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [patientId, isOpen]);

    if (!isOpen) return null;

    const patient = summary?.patient || summary || {};
    const entries = summary?.entries || summary?.clinicalEntries || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Patient Clinical & Lab Summary"
            description="Review full history, prior entries, and diagnostic logs."
            maxWidth="max-w-2xl"
        >
            {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading patient summary...</div>
            ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {/* Patient Overview Header */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-teal-50 text-[var(--primary-color)] rounded-xl">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">
                                    {`${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient Record'}
                                </h3>
                                <p className="font-mono text-xs text-slate-500">
                                    Folder ID: {patient.folderNumber || patient.folder_number || 'PAT-XXXXX'}
                                </p>
                            </div>
                        </div>
                        <Badge variant="info">{patient.gender || 'N/A'}</Badge>
                    </div>

                    {/* Entries List */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Clinical & Lab History</h4>
                        {entries.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400 border border-slate-100 rounded-xl">
                                No previous entries recorded for this patient.
                            </div>
                        ) : (
                            entries.map((entry, idx) => (
                                <div key={entry.id || idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <Badge variant={entry.entryType === 'LAB_RESULT' ? 'success' : 'info'}>
                                            {entry.entryType || 'ENTRY'}
                                        </Badge>
                                        <span className="font-mono text-[10px] text-slate-400">
                                            {entry.createdAt ? new Date(entry.createdAt).toLocaleString('en-NG') : 'N/A'}
                                        </span>
                                    </div>
                                    <pre className="whitespace-pre-wrap font-sans text-slate-700 text-xs leading-relaxed">
                                        {entry.content}
                                    </pre>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end pt-3 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};