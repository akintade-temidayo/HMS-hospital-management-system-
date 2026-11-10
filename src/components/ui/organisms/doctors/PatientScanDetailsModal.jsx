'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { FileUploadInput } from '@/components/ui/atoms/FileUploadInput';
import { patientService } from '@/services/patient.service';
import { toast } from 'sonner';

export const PatientScanDetailsModal = ({ patient, isOpen, onClose, onSuccess }) => {
    const [scanName, setScanName] = useState('');
    const [scanDetails, setScanDetails] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const patientId = patient?.id || patient?.patientId || patient?.patient_id || patient?._id;

    const handleClose = () => {
        setScanName('');
        setScanDetails('');
        setAttachment(null);
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!patientId) {
            toast.error('This patient record has no patient ID.');
            return;
        }
        if (!scanName.trim() && !scanDetails.trim() && !attachment) {
            toast.error('Add scan details or attach a scan file.');
            return;
        }

        const content = [
            'IMAGING / SCAN DETAILS',
            scanName.trim() ? `Scan: ${scanName.trim()}` : '',
            scanDetails.trim() ? `Clinical details: ${scanDetails.trim()}` : '',
            attachment ? `Attached file: ${attachment.name}` : '',
        ].filter(Boolean).join('\n');

        try {
            setSubmitting(true);
            await patientService.addPatientEntry(patientId, {
                entryType: 'GENERAL_NOTE',
                content,
                ...(attachment ? { attachment } : {}),
            });
            toast.success('Scan details added to the patient record.');
            onSuccess?.();
            handleClose();
        } catch (error) {
            toast.error(error?.message || 'Could not save scan details.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Scan Details" description="Save imaging details and optionally attach the scan report." maxWidth="max-w-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                    Scan name or type
                    <input value={scanName} onChange={(event) => setScanName(event.target.value)} placeholder="e.g. Chest X-ray" className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-(--primary-color) focus:bg-white" />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                    Findings or clinical details
                    <textarea rows={4} value={scanDetails} onChange={(event) => setScanDetails(event.target.value)} placeholder="Enter scan findings or relevant details..." className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-normal outline-none focus:border-(--primary-color) focus:bg-white" />
                </label>
                <FileUploadInput
                    label="Attach scan report (optional, up to 10 MB)"
                    accept="image/*,.pdf"
                    value={attachment}
                    onChange={setAttachment}
                />
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Save Scan Details</Button>
                </div>
            </form>
        </Modal>
    );
};
