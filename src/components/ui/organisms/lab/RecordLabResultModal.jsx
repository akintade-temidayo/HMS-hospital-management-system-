'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { FileUploadInput } from '@/components/ui/atoms/FileUploadInput';
import { patientService } from '@/services/patient.service';
import { toast } from 'sonner';
import { CheckCircle2, User } from 'lucide-react';
import { formatLabResultContent } from '@/utils/labUtils';
import { formatPatientName, getPatientFolderNumber } from '@/utils/patientUtils';

export const RecordLabResultModal = ({ isOpen, onClose, onSuccess, patientId, patient }) => {
    const [testName, setTestName] = useState('');
    const [parameters, setParameters] = useState('');
    const [remarks, setRemarks] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleClose = () => {
        setTestName('');
        setParameters('');
        setRemarks('');
        setAttachment(null);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patientId) {
            toast.error('This patient record has no patient ID.');
            return;
        }

        try {
            setSubmitting(true);
            const content = formatLabResultContent({
                testName,
                parameters,
                remarks,
                attachmentName: attachment?.name,
            });

            await patientService.addPatientEntry(patientId, {
                entryType: 'LAB_RESULT',
                content,
                ...(attachment ? { attachment } : {}),
            });

            toast.success('Laboratory test results logged directly to patient record.');
            onSuccess?.();
            handleClose();
        } catch (err) {
            toast.error(err.message || 'Failed to record lab results.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Log Diagnostic Lab Result"
            description="Record diagnostic findings and attach the supporting report to the patient record."
            maxWidth="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="rounded-lg bg-teal-50 p-2 text-(--primary-color)">
                        <User size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {formatPatientName(patient)}
                        </p>
                        <p className="font-mono text-xs text-slate-500">
                            Patient ID: {getPatientFolderNumber(patient)}
                        </p>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                        Diagnostic Test Name
                    </label>
                    <input
                        type="text"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        placeholder="e.g., Full Blood Count (FBC) / Widal Test"
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-(--primary-color) transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                        Findings & Value Parameters
                    </label>
                    <textarea
                        rows={3}
                        value={parameters}
                        onChange={(e) => setParameters(e.target.value)}
                        placeholder="e.g., Hb: 13.5 g/dL, WBC: 6,500/mm³, Platelets: 250,000/mm³"
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-(--primary-color) transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                        Lab Technician Remarks & Interpretation
                    </label>
                    <textarea
                        rows={2}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Clinical impressions or further recommendations..."
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-(--primary-color) transition-all"
                    />
                </div>

                <FileUploadInput
                    label="Attach result image or file (optional, up to 10 MB)"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    value={attachment}
                    onChange={setAttachment}
                />

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting} className="flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        <span>Submit Lab Entry</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
};