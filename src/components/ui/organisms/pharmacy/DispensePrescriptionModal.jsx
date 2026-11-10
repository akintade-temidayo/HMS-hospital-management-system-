'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { inventoryService } from '@/services/inventory.service';
import { patientService } from '@/services/patient.service';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { formatPatientName, getPatientList, getPatientRecordId } from '@/utils/patientUtils';
import { getPrescriptionList } from '@/utils/pharmacyUtils';

const getPrescriptionId = (prescription) => (
    prescription.prescriptionId
    || prescription.prescription_id
    || prescription.id
    || prescription._id
    || ''
);

const getPrescriptionPatientId = (prescription) => (
    prescription.patientId
    || prescription.patient_id
    || prescription.patient?.id
    || prescription.patient?._id
    || prescription.patient?.patientId
    || prescription.patient?.patient_id
    || (typeof prescription.patient === 'string' ? prescription.patient : '')
    || prescription.encounter?.patientId
    || prescription.encounter?.patient_id
    || prescription.encounter?.patient?.id
    || prescription.encounter?.patient?._id
    || prescription.encounter?.patient?.patientId
    || prescription.encounter?.patient?.patient_id
    || (typeof prescription.encounter?.patient === 'string' ? prescription.encounter.patient : '')
    || ''
);

const getEmbeddedPatientName = (prescription) => {
    const patient = prescription.patient || prescription.encounter?.patient;
    const directName = prescription.patientName
        || prescription.patient_name
        || prescription.patientFullName
        || prescription.patient_full_name;
    if (directName) return directName;
    if (!patient || typeof patient !== 'object') return '';
    const name = formatPatientName(patient);
    return name === 'Unnamed Patient' ? '' : name;
};

const normalizeName = (name) => String(name || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

const isDispensedPrescription = (prescription) => {
    const status = String(
        prescription.status
        || prescription.dispensingStatus
        || prescription.dispensing_status
        || '',
    ).toUpperCase();
    return ['DISPENSED', 'COMPLETED', 'CANCELLED', 'CANCELED', 'VOID'].includes(status)
        || Boolean(
            prescription.dispensed
            || prescription.isDispensed
            || prescription.is_dispensed
            || prescription.dispensedAt
            || prescription.dispensed_at,
        );
};

const getPrescriptionDate = (prescription) => {
    const date = prescription.createdAt
        || prescription.created_at
        || prescription.issuedAt
        || prescription.issued_at
        || prescription.date;
    const timestamp = date ? new Date(date).getTime() : Number.NaN;
    return Number.isNaN(timestamp) ? null : timestamp;
};

export const DispensePrescriptionModal = ({ isOpen, onClose, onSuccess }) => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [prescriptionsLoaded, setPrescriptionsLoaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const loadingPrescriptions = isOpen && !prescriptionsLoaded;

    useEffect(() => {
        if (!isOpen) return undefined;

        let isActive = true;

        inventoryService.getPrescriptions()
            .then((prescriptionResponse) => {
                if (!isActive) return;
                setPrescriptions(getPrescriptionList(prescriptionResponse));
            })
            .catch((error) => {
                if (isActive) {
                    toast.error(error?.message || 'Failed to load prescriptions.');
                }
            })
            .finally(() => {
                if (isActive) setPrescriptionsLoaded(true);
            });

        return () => {
            isActive = false;
        };
    }, [isOpen]);

    const closeModal = () => {
        setPrescriptions([]);
        setPatientName('');
        setPrescriptionsLoaded(false);
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const normalizedName = normalizeName(patientName);
        if (!normalizedName) {
            toast.error('Enter the patient’s name.');
            return;
        }

        try {
            setSubmitting(true);
            const patientResponse = await patientService.searchPatients(patientName.trim(), 50);
            const matchingPatients = getPatientList(patientResponse).filter(
                (patient) => normalizeName(formatPatientName(patient)) === normalizedName,
            );
            const patientIds = new Set(matchingPatients.map(getPatientRecordId).filter(Boolean).map(String));
            if (patientIds.size > 1) {
                toast.error('More than one patient has this name. Verify the patient record before dispensing.');
                return;
            }

            const patientId = patientIds.values().next().value;
            const matchingPrescriptions = prescriptions
                .map((prescription, index) => {
                    const prescriptionPatientId = getPrescriptionPatientId(prescription);
                    const linkedPatientName = getEmbeddedPatientName(prescription);
                    const belongsToPatient = patientId
                        ? String(prescriptionPatientId) === String(patientId)
                            || (!prescriptionPatientId && normalizeName(linkedPatientName) === normalizedName)
                        : normalizeName(linkedPatientName) === normalizedName;
                    const prescriptionId = String(getPrescriptionId(prescription));
                    if (!belongsToPatient || !prescriptionId || isDispensedPrescription(prescription)) return null;
                    return { prescriptionId, index, timestamp: getPrescriptionDate(prescription) };
                })
                .filter(Boolean)
                .sort((first, second) => {
                    if (first.timestamp !== null && second.timestamp !== null) {
                        return second.timestamp - first.timestamp;
                    }
                    if (first.timestamp !== null) return -1;
                    if (second.timestamp !== null) return 1;
                    return first.index - second.index;
                });

            const newestPrescription = matchingPrescriptions[0];
            if (!newestPrescription) {
                toast.error(`No active prescription found for ${patientName.trim()}.`);
                return;
            }

            await inventoryService.dispensePrescription(newestPrescription.prescriptionId, {});
            toast.success('Prescription successfully dispensed and stock updated.');
            onSuccess();
            closeModal();
        } catch (error) {
            toast.error(error?.message || 'Could not find the patient or dispense their prescription.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            title="Dispense Patient Prescription"
            description="Enter the patient’s name to dispense their newest active prescription."
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                    label="Patient Name"
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    placeholder="Enter the patient’s full name"
                    required
                />

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                    <Button
                        type="submit"
                        isLoading={submitting}
                        disabled={loadingPrescriptions || submitting}
                        className="flex items-center gap-2"
                    >
                        <CheckCircle2 size={16} />
                        <span>Confirm Dispensing</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
