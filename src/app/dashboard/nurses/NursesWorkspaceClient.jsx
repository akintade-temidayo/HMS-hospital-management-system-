'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { patientService } from '@/services/patient.service';
import { NurseQueueTable } from '@/components/ui/organisms/nurses/NurseQueueTable';
import { TransitionQueueModal } from '@/components/ui/organisms/nurses/TransitionQueueModal';
import { TriageNoteModal } from '@/components/ui/organisms/nurses/TriageNoteModal';
import { AdmissionUpdateModal } from '@/components/ui/organisms/nurses/AdmissionUpdateModal';
import { PatientQuickSummaryModal } from '@/components/ui/organisms/nurses/PatientQuickSummaryModal';
import { SearchInput } from '@/components/ui/atoms/SearchInput';
import { Button } from '@/components/ui/atoms/Button';
import { HeartPulse, Users, BedDouble, PencilLine, ClipboardCheck, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getActiveQueueList } from '@/utils/nurseUtils';
import { formatPatientName, getPatientFolderNumber, getPatientList, getPatientRecordId, getPlannedStayDetails } from '@/utils/patientUtils';

export default function NursesWorkspacePage() {
    const [activeTab, setActiveTab] = useState('queue');
    const [queue, setQueue] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [transitionItem, setTransitionItem] = useState(null);
    const [triagePatientId, setTriagePatientId] = useState(null);
    const [triageSearch, setTriageSearch] = useState('');
    const [triageEntryType, setTriageEntryType] = useState('TRIAGE_NOTE');
    const [admissionPatient, setAdmissionPatient] = useState(null);
    const [summaryPatient, setSummaryPatient] = useState(null);
    const [dailyCheckDates, setDailyCheckDates] = useState({});

    const admittedPatients = useMemo(() => patients.filter((patient) => (
        String(patient.admissionStatus || patient.admission_status || '').toUpperCase() === 'ADMITTED'
    )), [patients]);

    const activeAdmittedQueueCount = useMemo(() => {
        const seenPatients = new Set();
        return queue.filter((item) => {
            const status = String(item.status || 'WAITING').toUpperCase();
            if (!['WAITING', 'IN_CONSULTATION'].includes(status)) return false;
            const appointmentType = String(item.type || item.appointmentType || item.appointment_type || 'CONSULTATION').toUpperCase().replace(/[^A-Z]/g, '');
            if (!['CONSULTATION', 'CHECKIN'].includes(appointmentType)) return false;
            const queuePatient = item.patient || {};
            const patientId = getPatientRecordId(queuePatient) || item.patientId || item.patient_id;
            const patient = patients.find((candidate) => String(getPatientRecordId(candidate)) === String(patientId)) || queuePatient;
            if (String(patient.admissionStatus || patient.admission_status || '').toUpperCase() !== 'ADMITTED') return false;
            const uniqueId = patientId || item.id || item._id;
            if (uniqueId && seenPatients.has(String(uniqueId))) return false;
            if (uniqueId) seenPatients.add(String(uniqueId));
            return true;
        }).length;
    }, [queue, patients]);

    const visiblePatients = useMemo(() => {
        const query = search.trim().toLowerCase();
        return patients.filter((patient) => {
            if (String(patient.admissionStatus || patient.admission_status || '').toUpperCase() === 'DISCHARGED') return false;
            if (!query) return true;
            return formatPatientName(patient).toLowerCase().includes(query)
                || getPatientFolderNumber(patient).toLowerCase().includes(query)
                || String(patient.phoneNumber || patient.phone_number || patient.phone || '').toLowerCase().includes(query);
        });
    }, [patients, search]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [queueResult, patientResult] = await Promise.allSettled([
            api.get('/appointments/queue/today'),
            api.get('/patients').catch(() => api.get('/patients/recent?limit=100')),
        ]);

        if (queueResult.status === 'fulfilled') {
            setQueue(getActiveQueueList(queueResult.value));
        } else {
            setQueue([]);
            toast.error(queueResult.reason?.message || 'Could not load today’s patient queue.');
        }

        if (patientResult.status === 'fulfilled') {
            const patientList = getPatientList(patientResult.value);
            setPatients(patientList);
            const admitted = patientList.filter((patient) => String(patient.admissionStatus || patient.admission_status || '').toUpperCase() === 'ADMITTED' && getPatientRecordId(patient));
            const summaries = await Promise.allSettled(admitted.map((patient) => patientService.getPatientSummary(getPatientRecordId(patient))));
            const checksByPatient = {};
            summaries.forEach((result, index) => {
                if (result.status !== 'fulfilled') return;
                const summary = result.value?.data?.data ?? result.value?.data ?? result.value;
                const entries = summary?.entries || summary?.patient?.entries || summary?.clinicalEntries || summary?.clinical_entries || [];
                const patientId = String(getPatientRecordId(admitted[index]));
                checksByPatient[patientId] = Array.isArray(entries) ? entries.filter((entry) => String(entry.entryType || entry.entry_type || entry.type || '').toUpperCase() === 'DAILY_NURSING_CHECK')
                    .map((entry) => {
                        const dateValue = entry.createdAt || entry.created_at || entry.recordedAt || entry.recorded_at || entry.date;
                        const fromContent = String(entry.content || '').match(/Recorded:\s*(\d{4}-\d{2}-\d{2})/i)?.[1];
                        const date = dateValue ? new Date(dateValue) : fromContent ? new Date(`${fromContent}T12:00:00`) : null;
                        return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-CA') : null;
                    }).filter(Boolean) : [];
            });
            summaries.forEach((result, index) => {
                if (result.status === 'rejected') checksByPatient[String(getPatientRecordId(admitted[index]))] = null;
            });
            setDailyCheckDates(checksByPatient);
        } else {
            setPatients([]);
            toast.error(patientResult.reason?.message || 'Could not load patient admission records.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void fetchData();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [fetchData]);

    useEffect(() => {
        const syncTabFromHash = () => {
            const tab = window.location.hash.slice(1);
            if (['queue', 'wards', 'triage'].includes(tab)) setActiveTab(tab);
        };
        const timeoutId = window.setTimeout(syncTabFromHash, 0);
        window.addEventListener('hashchange', syncTabFromHash);
        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener('hashchange', syncTabFromHash);
        };
    }, []);

    const handleUpdateQueueStatus = async (queueId, status) => {
        try {
            await api.patch(`/appointments/queue/${encodeURIComponent(queueId)}/status`, { status });
            toast.success(`Queue status updated to ${status.replace('_', ' ').toLowerCase()}.`);
            await fetchData();
        } catch (error) {
            toast.error(error.message || 'Failed to update queue status.');
        }
    };

    const selectTab = (tab) => {
        setActiveTab(tab);
        if (typeof window !== 'undefined' && window.location.hash !== `#${tab}`) {
            window.location.hash = tab;
        }
    };

    const visibleTriagePatients = useMemo(() => {
        const query = triageSearch.trim().toLowerCase();
        return patients.filter((patient) => {
            if (String(patient.admissionStatus || patient.admission_status || '').toUpperCase() === 'DISCHARGED') return false;
            if (!query) return true;
            return formatPatientName(patient).toLowerCase().includes(query)
                || getPatientFolderNumber(patient).toLowerCase().includes(query)
                || String(patient.phoneNumber || patient.phone_number || patient.phone || '').toLowerCase().includes(query);
        });
    }, [patients, triageSearch]);

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <header>
                <div className="flex items-center gap-2">
                    <HeartPulse className="text-(--primary-color)" size={28} />
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nurse Operations</h1>
                </div>
                <p className="mt-1 text-sm text-slate-500">Manage today’s patient flow, ward admissions, and triage documentation.</p>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wide">Active admitted queue today</span>
                        <Users size={18} className="text-(--primary-color)" />
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-slate-900">{activeAdmittedQueueCount}</p>
                    <p className="mt-1 text-xs text-slate-500">Admitted patients here for consultation or check-in</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wide">Admitted inpatients</span>
                        <BedDouble size={18} className="text-(--primary-color)" />
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-slate-900">{admittedPatients.length}</p>
                    <p className="mt-1 text-xs text-slate-500">Currently assigned to a ward</p>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200">
                <button
                    type="button"
                    onClick={() => selectTab('queue')}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${activeTab === 'queue' ? 'border-(--primary-color) text-(--primary-color)' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                    <Users size={16} /> Appointments & Queue ({queue.length})
                </button>
                <button
                    type="button"
                    onClick={() => selectTab('wards')}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${activeTab === 'wards' ? 'border-(--primary-color) text-(--primary-color)' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                    <BedDouble size={16} /> Ward & Admissions ({admittedPatients.length})
                </button>
                <button
                    type="button"
                    onClick={() => selectTab('triage')}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${activeTab === 'triage' ? 'border-(--primary-color) text-(--primary-color)' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                    <HeartPulse size={16} /> Triage & Clinical Entries
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-sm text-slate-400">Loading nurse workspace…</div>
            ) : activeTab === 'queue' ? (
                <NurseQueueTable
                    queue={queue}
                    onUpdateStatus={handleUpdateQueueStatus}
                    onTransition={setTransitionItem}
                    onAddTriage={(id) => { setTriageEntryType('TRIAGE_NOTE'); setTriagePatientId(id); }}
                />
            ) : activeTab === 'triage' ? (
                <section className="space-y-4">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Triage & Clinical Entries</h2>
                        <p className="mt-1 text-xs text-slate-500">View patient summaries and complete daily nursing checks for admitted patients.</p>
                    </div>
                    <SearchInput value={triageSearch} onChange={(event) => setTriageSearch(event.target.value)} onClear={() => setTriageSearch('')} placeholder="Search all patients by name, folder number, or phone..." />
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <table className="w-full min-w-[980px] text-left text-sm">
                            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Folder number</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Planned stay</th><th className="px-5 py-3">Stay progress</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {visibleTriagePatients.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-xs text-slate-400">No active patient records match your search.</td></tr> : visibleTriagePatients.map((patient, index) => {
                                    const patientId = getPatientRecordId(patient);
                                    const status = String(patient.admissionStatus || patient.admission_status || 'OUTPATIENT').toUpperCase();
                                    const checkHistory = dailyCheckDates[String(patientId)];
                                    const historyAvailable = Array.isArray(checkHistory);
                                    const completedCheckDays = historyAvailable ? new Set(checkHistory).size : 0;
                                    const plannedStay = getPlannedStayDetails(patient);
                                    const stayComplete = plannedStay.days !== null && completedCheckDays >= plannedStay.days;
                                    return <tr key={patientId || index}>
                                        <td className="px-5 py-3 font-semibold text-slate-900">{formatPatientName(patient)}</td>
                                        <td className="px-5 py-3 font-mono text-xs text-slate-500">{getPatientFolderNumber(patient)}</td>
                                        <td className="px-5 py-3 text-xs text-slate-600">{status}</td>
                                        <td className="px-5 py-3 text-xs text-slate-600">{status === 'ADMITTED' ? plannedStay.label : '—'}</td>
                                        <td className="px-5 py-3">
                                            {status === 'ADMITTED' ? <div className="space-y-1">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${!historyAvailable ? 'bg-slate-100 text-slate-500' : stayComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{!historyAvailable ? 'History unavailable' : stayComplete ? 'Completed' : 'In progress'}</span>
                                                <p className="text-[10px] text-slate-500">{plannedStay.admissionDay && plannedStay.days ? `Day ${plannedStay.admissionDay} of ${plannedStay.days} days` : plannedStay.days ? (stayComplete ? `All ${plannedStay.days} days completed` : `Next check: Day ${Math.min(completedCheckDays + 1, plannedStay.days)} of ${plannedStay.days} days`) : `${completedCheckDays} daily checks`}</p>
                                            </div> : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-right"><div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setSummaryPatient(patient)}><Eye size={14} /><span>Patient record</span></Button>
                                            {status === 'ADMITTED' && <Button size="sm" variant="outline" onClick={() => { setTriageEntryType('DAILY_NURSING_CHECK'); setTriagePatientId(patientId); }}><ClipboardCheck size={14} /><span>Daily checks</span></Button>}
                                        </div></td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : (
                <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">Ward & Admission Management</h2>
                            <p className="mt-1 text-xs text-slate-500">Review current admissions or update a patient’s admission status.</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{admittedPatients.length} admitted</span>
                    </div>
                    <SearchInput
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onClear={() => setSearch('')}
                        placeholder="Search patients by name, folder number, or phone..."
                    />
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full min-w-[1000px] text-left">
                            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Patient</th>
                                    <th className="px-4 py-3">Folder Number</th>
                                    <th className="px-4 py-3">Admission</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Ward / Room</th>
                                    <th className="px-4 py-3">Planned stay</th>
                                    <th className="px-4 py-3">Stay progress</th>
                                    <th className="px-4 py-3">Daily checks</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {visiblePatients.length === 0 ? (
                                    <tr><td colSpan={9} className="px-4 py-12 text-center text-xs text-slate-400">No active patient records match your search.</td></tr>
                                ) : visiblePatients.map((patient, index) => {
                                    const patientId = getPatientRecordId(patient);
                                    const status = String(patient.admissionStatus || patient.admission_status || 'OUTPATIENT').toUpperCase();
                                    const checkHistory = dailyCheckDates[String(patientId)];
                                    const historyUnavailable = !Array.isArray(checkHistory);
                                    const checks = historyUnavailable ? [] : checkHistory;
                                    const completedCheckDays = new Set(checks).size;
                                    const plannedStay = getPlannedStayDetails(patient);
                                    const stayComplete = plannedStay.days !== null && completedCheckDays >= plannedStay.days;
                                    return (
                                        <tr key={patientId || index}>
                                            <td className="px-4 py-3 font-semibold text-slate-900">{formatPatientName(patient)}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{getPatientFolderNumber(patient)}</td>
                                            <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${status === 'ADMITTED' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{status}</span></td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{status === 'ADMITTED' ? 'Nurse' : patient.admittedDepartmentName || patient.admitted_department_name || patient.departmentName || patient.department_name || patient.admittedDepartmentId || patient.admitted_department_id || '—'}</td>
                                            <td className="px-4 py-3 text-xs text-slate-600">{patient.wardRoomNumber || patient.ward_room_number || '—'}</td>
                                            <td className="px-4 py-3 text-xs font-medium text-slate-700">{status === 'ADMITTED' ? plannedStay.label : '—'}</td>
                                            <td className="px-4 py-3">
                                                {status === 'ADMITTED' ? (
                                                    <div className="space-y-1">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${historyUnavailable ? 'bg-slate-100 text-slate-500' : stayComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{historyUnavailable ? 'History unavailable' : stayComplete ? 'Completed' : 'In progress'}</span>
                                                        <p className="text-[10px] text-slate-500">{historyUnavailable ? 'Could not load check history' : plannedStay.admissionDay && plannedStay.days ? `Day ${plannedStay.admissionDay} of ${plannedStay.days} days` : plannedStay.days ? (stayComplete ? `All ${plannedStay.days} days completed` : `Next check: Day ${Math.min(completedCheckDays + 1, plannedStay.days)} of ${plannedStay.days} days`) : `${completedCheckDays} daily checks`}</p>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {(() => {
                                                    const today = new Date().toLocaleDateString('en-CA');
                                                    const completedToday = checks.includes(today);
                                                    return <div className="space-y-1">
                                                        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${historyUnavailable ? 'bg-slate-100 text-slate-500' : completedToday ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{historyUnavailable ? 'History unavailable' : completedToday ? 'Completed today' : 'Due today'}</span>
                                                        <p className="text-[10px] text-slate-500">{plannedStay.admissionDay && plannedStay.days ? `Day ${plannedStay.admissionDay} of ${plannedStay.days} days` : historyUnavailable ? 'Could not load check history' : `${completedCheckDays}${plannedStay.days ? ` / ${plannedStay.days}` : ''} days recorded`}</p>
                                                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Last 7 days</p>
                                                        <div className="flex gap-1" aria-label="Daily check history for the last seven days">
                                                            {Array.from({ length: 7 }, (_, offset) => {
                                                                const day = new Date();
                                                                day.setDate(day.getDate() - (6 - offset));
                                                                const key = day.toLocaleDateString('en-CA');
                                                                const done = checks.includes(key);
                                                                return <span key={key} title={`${key}: ${done ? 'completed' : 'not recorded'}`} className={`flex size-5 items-center justify-center rounded-full text-[9px] font-bold ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{day.getDate()}</span>;
                                                            })}
                                                        </div>
                                                        <Button size="sm" variant="outline" onClick={() => { setTriageEntryType('DAILY_NURSING_CHECK'); setTriagePatientId(patientId); }}><ClipboardCheck size={13} /><span>Daily check</span></Button>
                                                    </div>;
                                                })()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button size="sm" variant="outline" onClick={() => setAdmissionPatient(patient)}>
                                                    <PencilLine size={14} /><span>Manage</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <TransitionQueueModal
                queueItem={transitionItem}
                isOpen={!!transitionItem}
                onClose={() => setTransitionItem(null)}
                onSuccess={fetchData}
            />
            <TriageNoteModal
                patientId={triagePatientId}
                patient={patients.find((item) => String(getPatientRecordId(item)) === String(triagePatientId)) || queue.find((item) => String(getPatientRecordId(item.patient || {}) || item.patientId || item.patient_id) === String(triagePatientId))?.patient}
                checkDates={dailyCheckDates[String(triagePatientId)]}
                plannedStayDuration={patients.find((item) => String(getPatientRecordId(item)) === String(triagePatientId))?.plannedStayDuration ?? patients.find((item) => String(getPatientRecordId(item)) === String(triagePatientId))?.planned_stay_duration}
                plannedStayUnit={patients.find((item) => String(getPatientRecordId(item)) === String(triagePatientId))?.plannedStayUnit || patients.find((item) => String(getPatientRecordId(item)) === String(triagePatientId))?.planned_stay_unit}
                isOpen={!!triagePatientId}
                onClose={() => setTriagePatientId(null)}
                onSuccess={fetchData}
                entryType={triageEntryType}
            />
            <AdmissionUpdateModal
                patient={admissionPatient}
                isOpen={!!admissionPatient}
                onClose={() => setAdmissionPatient(null)}
                onSuccess={fetchData}
            />
            <PatientQuickSummaryModal
                patient={summaryPatient}
                checkDates={dailyCheckDates[String(getPatientRecordId(summaryPatient))]}
                isOpen={!!summaryPatient}
                onClose={() => setSummaryPatient(null)}
            />
        </div>
    );
}
