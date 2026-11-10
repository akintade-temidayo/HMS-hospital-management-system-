'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { patientService } from '@/services/patient.service';
import { formatPatientName, getPatientFolderNumber, getPlannedStayDetails } from '@/utils/patientUtils';
import { toast } from 'sonner';

const initialVitals = {
    systolic: '', diastolic: '', temperature: '', pulse: '', respiratoryRate: '', oxygenSaturation: '',
};
const dailyTasks = [
    ['painAssessment', 'Pain and comfort assessment'],
    ['medicationReview', 'Medication check completed'],
    ['fluidBalance', 'Fluid intake and output reviewed'],
    ['mobilitySkinCare', 'Mobility and skin care check'],
];

export const TriageNoteModal = ({ patientId, patient, isOpen, onClose, onSuccess, entryType = 'TRIAGE_NOTE', checkDates, plannedStayDuration, plannedStayUnit }) => {
    const [vitals, setVitals] = useState(initialVitals);
    const [notes, setNotes] = useState('');
    const [checks, setChecks] = useState({});
    const [confirmDayComplete, setConfirmDayComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const isDailyCheck = entryType === 'DAILY_NURSING_CHECK';
    const resolvedPatientId = patientId || patient?.id || patient?.patientId || patient?.patient_id || patient?._id;
    const checkHistoryAvailable = Array.isArray(checkDates);
    const completedDates = checkHistoryAvailable ? new Set(checkDates) : new Set();
    const todayKey = new Date().toLocaleDateString('en-CA');
    const completedToday = completedDates.has(todayKey);
    const stay = getPlannedStayDetails({
        ...patient,
        plannedStayDuration: plannedStayDuration ?? patient?.plannedStayDuration ?? patient?.planned_stay_duration,
        plannedStayUnit: plannedStayUnit ?? patient?.plannedStayUnit ?? patient?.planned_stay_unit,
    });
    const plannedDays = stay.days;
    const stayComplete = plannedDays !== null && completedDates.size >= plannedDays;
    const nextCheckDay = plannedDays ? Math.min(completedDates.size + 1, plannedDays) : null;

    useEffect(() => {
        if (!isOpen) return;
        setVitals(initialVitals);
        setNotes('');
        setChecks({});
        setConfirmDayComplete(false);
    }, [isOpen, resolvedPatientId, entryType]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!resolvedPatientId) {
            toast.error('This patient record has no patient ID.');
            return;
        }
        if (isDailyCheck && dailyTasks.some(([key]) => !checks[key])) {
            toast.error('Complete each daily nursing check before saving.');
            return;
        }
        if (isDailyCheck && !confirmDayComplete) {
            toast.error('Confirm that today’s daily check is complete before saving.');
            return;
        }

        const completedVitals = Object.values(vitals).some((value) => value !== '');
        const vitalLines = completedVitals ? [
            `Blood pressure: ${vitals.systolic || '—'}/${vitals.diastolic || '—'} mmHg`,
            `Temperature: ${vitals.temperature || '—'} °C`,
            `Pulse: ${vitals.pulse || '—'} bpm`,
            `Respiratory rate: ${vitals.respiratoryRate || '—'} /min`,
            `Oxygen saturation: ${vitals.oxygenSaturation || '—'}%`,
        ] : [];
        if (!isDailyCheck && !completedVitals && !notes.trim()) {
            toast.error('Enter at least one vital sign or a nursing note.');
            return;
        }
        const content = [
            isDailyCheck ? 'DAILY NURSING CHECK' : 'TRIAGE & NURSING OBSERVATION',
            `Recorded: ${new Date().toISOString()}`,
            ...vitalLines,
            ...(isDailyCheck ? dailyTasks.map(([, label]) => `Completed: ${label}`) : []),
            ...(isDailyCheck ? ['Daily check completion confirmed by nurse.'] : []),
            notes.trim() ? `Nursing notes: ${notes.trim()}` : '',
        ].filter(Boolean).join('\n');

        try {
            setSubmitting(true);
            await patientService.addPatientEntry(resolvedPatientId, {
                entryType: 'TRIAGE_NOTE',
                content,
            });
            toast.success(isDailyCheck ? 'Daily nursing check saved.' : 'Triage observations saved.');
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error?.message || 'Could not save nursing observations.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isDailyCheck ? 'Record Daily Nursing Check' : 'Triage & Nursing Observations'}
            description={isDailyCheck ? 'Record today’s inpatient checks and vital signs.' : 'Record vital signs and nursing observations in the patient file.'}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {patient && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div>
                            <p className="text-sm font-bold text-slate-900">{formatPatientName(patient)}</p>
                            <p className="mt-0.5 font-mono text-xs text-slate-500">{getPatientFolderNumber(patient)}</p>
                        </div>
                    </div>
                )}

                {isDailyCheck && (
                    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Daily check history</h3>
                            <span className="text-xs text-slate-500">Admitted for {stay.label}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs text-slate-600">
                                {!checkHistoryAvailable ? 'History could not be loaded' : plannedDays && stay.admissionDay ? `Day ${stay.admissionDay} of ${plannedDays} days` : plannedDays && !stayComplete ? `Next check: Day ${nextCheckDay} of ${plannedDays} days` : `${completedDates.size}${plannedDays ? ` / ${plannedDays}` : ''} daily checks completed`}
                            </p>
                            {stay.duration && <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${!checkHistoryAvailable ? 'bg-slate-100 text-slate-500' : stayComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{!checkHistoryAvailable ? 'History unavailable' : stayComplete ? 'Completed' : 'In progress'}</span>}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 7 }, (_, offset) => {
                                const date = new Date();
                                date.setDate(date.getDate() - (6 - offset));
                                const dateKey = date.toLocaleDateString('en-CA');
                                const done = completedDates.has(dateKey);
                                const isToday = dateKey === todayKey;
                                return (
                                    <div key={dateKey} className={`rounded-lg border p-2 text-center ${done ? 'border-emerald-200 bg-emerald-50' : isToday ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
                                        <p className="text-[10px] font-semibold text-slate-500">{date.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                                        <p className="text-[10px] text-slate-500">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                        <p className={`mt-1 text-[10px] font-bold ${done ? 'text-emerald-700' : isToday ? 'text-amber-700' : 'text-slate-400'}`}>{done ? 'Done' : isToday ? 'Due' : '—'}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <section className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Vital signs</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {[
                            ['systolic', 'BP systolic (mmHg)', '0'], ['diastolic', 'BP diastolic (mmHg)', '0'],
                            ['temperature', 'Temperature (°C)', '0.1'], ['pulse', 'Pulse (bpm)', '0'],
                            ['respiratoryRate', 'Respiratory rate (/min)', '0'], ['oxygenSaturation', 'Oxygen saturation (%)', '0'],
                        ].map(([key, label, step]) => (
                            <label key={key} className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                                {label}
                                <input type="number" min="0" step={step} value={vitals[key]} onChange={(event) => setVitals((current) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-(--primary-color) focus:bg-white focus:ring-2 focus:ring-(--primary-color)/20" />
                            </label>
                        ))}
                    </div>
                </section>

                {isDailyCheck && (
                    <fieldset className="space-y-2 border-t border-slate-100 pt-4">
                        <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">Daily nursing checklist</legend>
                        {dailyTasks.map(([key, label]) => (
                            <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                                <input type="checkbox" checked={Boolean(checks[key])} onChange={(event) => setChecks((current) => ({ ...current, [key]: event.target.checked }))} className="size-4 accent-(--primary-color)" />
                                {label}
                            </label>
                        ))}
                    </fieldset>
                )}

                {isDailyCheck && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
                        <input type="checkbox" checked={confirmDayComplete} onChange={(event) => setConfirmDayComplete(event.target.checked)} className="mt-0.5 size-4 accent-(--primary-color)" />
                        <span><strong>Confirm day completed</strong><span className="mt-0.5 block text-xs text-teal-700">I confirm that today’s required patient checks have been completed.</span></span>
                    </label>
                )}

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                    Nursing notes
                    <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add observations, care provided, or follow-up needed..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-normal text-slate-900 outline-none focus:border-(--primary-color) focus:bg-white focus:ring-2 focus:ring-(--primary-color)/20" />
                </label>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting} disabled={isDailyCheck && completedToday}>{isDailyCheck && completedToday ? 'Today Complete' : isDailyCheck ? 'Save Daily Check' : 'Save Observations'}</Button>
                </div>
            </form>
        </Modal>
    );
};
