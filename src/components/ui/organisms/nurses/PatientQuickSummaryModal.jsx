'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { patientService } from '@/services/patient.service';
import { formatPatientDateOfBirth, formatPatientName, getPatientFolderNumber, getPlannedStayDetails } from '@/utils/patientUtils';

const getValue = (source, ...keys) => keys.map((key) => source?.[key]).find((value) => value !== undefined && value !== null && value !== '') || '';

export const PatientQuickSummaryModal = ({ patient, isOpen, onClose, checkDates }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const patientId = patient?.id || patient?.patientId || patient?.patient_id || patient?._id;

    useEffect(() => {
        if (!isOpen || !patientId) return undefined;
        let active = true;
        setLoading(true);
        setError('');
        patientService.getPatientSummary(patientId)
            .then((response) => {
                if (!active) return;
                setSummary(response?.data?.data ?? response?.data ?? response ?? {});
            })
            .catch((requestError) => {
                if (active) setError(requestError?.message || 'Could not load this patient summary.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [isOpen, patientId]);

    const record = { ...(patient || {}), ...(summary?.patient || summary || {}) };
    const entries = summary?.entries || summary?.clinicalEntries || summary?.clinical_entries || [];
    const plannedStay = getPlannedStayDetails(record);
    const status = String(getValue(record, 'admissionStatus', 'admission_status') || 'OUTPATIENT').toUpperCase();
    const checkHistoryAvailable = Array.isArray(checkDates);
    const completedDays = checkHistoryAvailable ? new Set(checkDates).size : 0;
    const stayComplete = plannedStay.days !== null && completedDays >= plannedStay.days;
    const nextCheckDay = plannedStay.days ? Math.min(completedDays + 1, plannedStay.days) : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Patient Summary" description="Quick view of this patient’s record and recent clinical entries." maxWidth="max-w-2xl">
            {loading ? (
                <div className="py-12 text-center text-sm text-slate-400">Loading patient summary...</div>
            ) : error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            ) : (
                <div className="space-y-5">
                    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{formatPatientName(record)}</h4>
                                <p className="mt-1 font-mono text-xs text-slate-500">{getPatientFolderNumber(record)}</p>
                            </div>
                            <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase text-teal-700">{status}</span>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                            ['Date of birth', formatPatientDateOfBirth(getValue(record, 'dateOfBirth', 'date_of_birth'))],
                            ['Gender', getValue(record, 'gender') || 'Not recorded'],
                            ['Phone', getValue(record, 'phone', 'phoneNumber', 'phone_number') || 'Not recorded'],
                            ['Email', getValue(record, 'email') || 'Not recorded'],
                            ['Blood group', getValue(record, 'bloodGroup', 'blood_group') || 'Not recorded'],
                            ['Genotype', getValue(record, 'genotype') || 'Not recorded'],
                            ['Ward / room', getValue(record, 'wardRoomNumber', 'ward_room_number') || 'Not assigned'],
                            ['Planned stay', plannedStay.label],
                            ['Stay progress', plannedStay.duration ? (!checkHistoryAvailable ? 'History unavailable' : stayComplete ? 'Completed' : 'In progress') : 'Not set'],
                            ['Admission day', plannedStay.admissionDay && plannedStay.days ? `Day ${plannedStay.admissionDay} of ${plannedStay.days} days` : plannedStay.days ? (stayComplete ? `All ${plannedStay.days} days completed` : `Next check: Day ${nextCheckDay} of ${plannedStay.days} days`) : plannedStay.unit === 'MONTHS' ? 'Admission date needed to calculate day count' : 'Not applicable'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border border-slate-100 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                                <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
                            </div>
                        ))}
                    </section>

                    <section>
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">Recent record entries</h4>
                        {!Array.isArray(entries) || entries.length === 0 ? (
                            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No clinical entries are available.</p>
                        ) : (
                            <ul className="max-h-56 space-y-2 overflow-y-auto">
                                {entries.slice(0, 8).map((entry, index) => (
                                    <li key={entry.id || entry._id || index} className="rounded-xl border border-slate-100 p-3">
                                        <div className="flex flex-wrap justify-between gap-2">
                                            <span className="text-xs font-bold text-slate-700">{entry.entryType || entry.entry_type || entry.type || 'Clinical entry'}</span>
                                            <span className="text-[10px] text-slate-400">{entry.createdAt || entry.created_at ? new Date(entry.createdAt || entry.created_at).toLocaleString() : ''}</span>
                                        </div>
                                        <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">{entry.content || entry.notes || 'No entry details.'}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </Modal>
    );
};
