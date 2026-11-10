'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { patientService } from '@/services/patient.service';
import { toast } from 'sonner';
import { formatSoapNoteContent } from '@/utils/doctorUtils';

export const ClinicalConsultationModal = ({ patientId, isOpen, onClose, onSuccess }) => {
    const [soap, setSoap] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const content = formatSoapNoteContent(soap);

        try {
            setSubmitting(true);
            await patientService.addPatientEntry(patientId, {
                entryType: 'GENERAL_NOTE',
                content,
            });
            toast.success('Clinical consultation notes recorded successfully.');
            setSoap({ subjective: '', objective: '', assessment: '', plan: '' });
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to save consultation notes.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="OPD Clinical Consultation (SOAP)"
            description="Record structured physician assessment and treatment plans."
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                        Subjective (Symptoms & History)
                    </label>
                    <textarea
                        rows={2}
                        value={soap.subjective}
                        onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                        placeholder="Patient complaints..."
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-(--primary-color) transition-all"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                        Objective (Vitals & Examination)
                    </label>
                    <textarea
                        rows={2}
                        value={soap.objective}
                        onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
                        placeholder="Physical examination and vitals..."
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring(--primary-color) transition-all"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                        Assessment (Diagnosis / ICD-10)
                    </label>
                    <textarea
                        rows={2}
                        value={soap.assessment}
                        onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
                        placeholder="Clinical diagnosis..."
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-(--primary-color) transition-all"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                        Plan (Prescription, Lab & Follow-up)
                    </label>
                    <textarea
                        rows={2}
                        value={soap.plan}
                        onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                        placeholder="Treatment plan..."
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-(--primary-color) transition-all"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Save Consultation</Button>
                </div>
            </form>
        </Modal>
    );
};
