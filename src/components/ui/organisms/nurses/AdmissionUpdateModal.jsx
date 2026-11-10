'use client';

import React, { useEffect, useState } from 'react';
import { patientService } from '@/services/patient.service';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { SelectDropdown } from '@/components/ui/atoms/SelectDropdown';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { toast } from 'sonner';

export const AdmissionUpdateModal = ({ patient, isOpen, onClose, onSuccess }) => {
    const [admissionStatus, setAdmissionStatus] = useState('OUTPATIENT');
    const [wardRoomNumber, setWardRoomNumber] = useState('');
    const [plannedStayDuration, setPlannedStayDuration] = useState('');
    const [plannedStayUnit, setPlannedStayUnit] = useState('DAYS');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !patient) return;
        setAdmissionStatus(String(patient.admissionStatus || patient.admission_status || 'OUTPATIENT').toUpperCase());
        setWardRoomNumber(patient.wardRoomNumber || patient.ward_room_number || '');
        setPlannedStayDuration(String(patient.plannedStayDuration ?? patient.planned_stay_duration ?? ''));
        setPlannedStayUnit(String(patient.plannedStayUnit || patient.planned_stay_unit || 'DAYS').toUpperCase());
    }, [isOpen, patient]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const patientId = patient?.id || patient?.patientId || patient?.patient_id || patient?._id;
        if (!patientId) {
            toast.error('This patient record has no patient ID.');
            return;
        }
        if (admissionStatus === 'ADMITTED' && !wardRoomNumber.trim()) {
            toast.error('Enter the ward or room number.');
            return;
        }
        const stayDuration = plannedStayDuration === '' ? null : Number(plannedStayDuration);
        if (admissionStatus === 'ADMITTED' && stayDuration !== null && (!Number.isInteger(stayDuration) || stayDuration < 1 || stayDuration > 3650)) {
            toast.error('Planned stay must be a whole number from 1 to 3650.');
            return;
        }

        try {
            setLoading(true);
            await patientService.updateAdmissionStatus(patientId, {
                admissionStatus,
                wardRoomNumber: admissionStatus === 'ADMITTED' ? wardRoomNumber.trim() : null,
                plannedStayDuration: admissionStatus === 'ADMITTED' ? stayDuration : null,
                plannedStayUnit: admissionStatus === 'ADMITTED' && stayDuration !== null ? plannedStayUnit : null,
            });
            toast.success('Patient admission details updated.');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.message || 'Could not update admission details.');
        } finally {
            setLoading(false);
        }
    };

    if (!patient) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Update Admission" description="Change this patient’s admission status and ward details." maxWidth="max-w-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-bold text-slate-900">{patient.fullName || patient.full_name || [patient.firstName || patient.first_name, patient.lastName || patient.last_name].filter(Boolean).join(' ') || 'Patient'}</p>
                </div>
                <SelectDropdown
                    label="Admission Status"
                    value={admissionStatus}
                    onChange={setAdmissionStatus}
                    options={[
                        { value: 'OUTPATIENT', label: 'Outpatient' },
                        { value: 'ADMITTED', label: 'Admitted' },
                        { value: 'DISCHARGED', label: 'Discharged' },
                    ]}
                    required
                />
                {admissionStatus === 'ADMITTED' && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">Admitting Department <span className="text-rose-500">*</span></label>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900">Nurse</div>
                        </div>
                        <TextInput
                            label="Ward / Room Number"
                            value={wardRoomNumber}
                            onChange={(event) => setWardRoomNumber(event.target.value)}
                            placeholder="e.g. General Ward, Bed 4"
                            required
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <TextInput
                                type="number"
                                label="Planned Length of Stay"
                                value={plannedStayDuration}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 3650)) setPlannedStayDuration(value);
                                }}
                                min="1"
                                max="3650"
                                step="1"
                                placeholder="Optional"
                            />
                            <SelectDropdown
                                label="Stay Unit"
                                value={plannedStayUnit}
                                onChange={setPlannedStayUnit}
                                options={[
                                    { value: 'DAYS', label: 'Days' },
                                    { value: 'WEEKS', label: 'Weeks' },
                                    { value: 'MONTHS', label: 'Months' },
                                ]}
                            />
                        </div>
                        <p className="-mt-2 text-[11px] text-slate-500">Optional. Enter a whole number from 1 to 3650; the selected unit is saved with it.</p>
                    </>
                )}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={loading}>Save Admission</Button>
                </div>
            </form>
        </Modal>
    );
};
