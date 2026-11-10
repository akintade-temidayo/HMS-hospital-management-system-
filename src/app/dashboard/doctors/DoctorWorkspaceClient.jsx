'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { patientService } from '@/services/patient.service';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { RegisterPatientModal } from '@/components/ui/organisms/health-records/RegisterPatientModal';
import { DoctorPatientActionsModal } from '@/components/ui/organisms/doctors/DoctorPatientActionsModal';
import { ClinicalConsultationModal } from '@/components/ui/organisms/doctors/ClinicalConsultationModal';
import { PatientScanDetailsModal } from '@/components/ui/organisms/doctors/PatientScanDetailsModal';
import { ScheduleAppointmentModal } from '@/components/ui/organisms/doctors/ScheduleAppointmentModal';
import { Activity, ArrowRight, ClipboardList, Plus, Search, Stethoscope, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getDoctorQueueList, getDoctorQueueStatusBadge } from '@/utils/doctorUtils';
import { formatPatientName, getPatientFolderNumber, getPatientList, getPatientRecordId } from '@/utils/patientUtils';

export default function DoctorWorkspaceClient() {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientSearch, setPatientSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchFailed, setSearchFailed] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [soapOpen, setSoapOpen] = useState(false);
    const [scanOpen, setScanOpen] = useState(false);
    const [appointmentOpen, setAppointmentOpen] = useState(false);

    const loadQueue = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/appointments/queue/today');
            setQueue(getDoctorQueueList(response));
        } catch (error) {
            setQueue([]);
            toast.error(error?.message || 'Could not load today’s doctor queue.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadQueue();
    }, [loadQueue]);

    const searchRegisteredPatients = async (query) => {
        const normalizedQuery = query.trim();
        if (normalizedQuery.length < 2 || normalizedQuery.length > 100) {
            toast.error('Enter between 2 and 100 characters to search for a patient.');
            return;
        }

        setSearching(true);
        setHasSearched(false);
        setSearchFailed(false);
        try {
            const response = await patientService.searchPatients(normalizedQuery);
            setSearchResults(getPatientList(response));
            setHasSearched(true);
        } catch (error) {
            setSearchResults([]);
            setSearchFailed(true);
            toast.error(error?.message || 'Could not search registered patients.');
        } finally {
            setSearching(false);
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        void searchRegisteredPatients(patientSearch);
    };

    const startRegistration = () => {
        if (!hasSearched || searchResults.length > 0 || searchFailed) {
            toast.info('Search for the patient first. Registration opens when no matching patient is found.');
            return;
        }
        setRegisterOpen(true);
    };

    const handleRegisterPatient = async (payload, { resetForm }) => {
        try {
            setRegistering(true);
            const response = await patientService.createPatient(payload);
            const created = response?.data?.patient ?? response?.data?.data ?? response?.data ?? response?.patient ?? response;
            const createdId = getPatientRecordId(created);
            setRegisterOpen(false);
            resetForm?.();
            toast.success('Patient registered successfully.');

            if (createdId) {
                setSelectedPatient(created);
                setActionsOpen(true);
                setSearchResults((current) => [created, ...current.filter((patient) => String(getPatientRecordId(patient)) !== String(createdId))]);
                setHasSearched(true);
            } else {
                const query = payload.phone || `${payload.firstName} ${payload.lastName}`;
                setPatientSearch(query);
                await searchRegisteredPatients(query);
            }
        } catch (error) {
            toast.error(error?.message || 'Could not register the patient.');
        } finally {
            setRegistering(false);
        }
    };

    const selectPatient = (patient) => {
        setSelectedPatient(patient);
        setActionsOpen(true);
    };

    const counts = useMemo(() => queue.reduce((result, item) => {
        const status = String(item.status || 'WAITING').toUpperCase();
        if (status === 'WAITING') result.waiting += 1;
        if (status === 'IN_CONSULTATION') result.consulting += 1;
        result.total += 1;
        return result;
    }, { waiting: 0, consulting: 0, total: 0 }), [queue]);

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <header>
                <div className="flex items-center gap-2">
                    <Stethoscope className="text-(--primary-color)" size={28} />
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctor Workspace</h1>
                </div>
                <p className="mt-1 text-sm text-slate-500">Review today’s workload, open the patient queue, and continue clinical consultations.</p>
            </header>

            <section className="grid gap-4 sm:grid-cols-3" aria-label="Today's doctor workload">
                {[
                    { label: 'Patients in today’s queue', value: counts.total, icon: Users },
                    { label: 'Waiting to be seen', value: counts.waiting, icon: ClipboardList },
                    { label: 'In consultation', value: counts.consulting, icon: Activity },
                ].map(({ label, value, icon: Icon }) => (
                    <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
                            <Icon size={18} className="text-(--primary-color)" />
                        </div>
                        <p className="mt-3 text-3xl font-extrabold text-slate-900">{loading ? '—' : value}</p>
                    </article>
                ))}
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Find or register a patient</h2>
                        <p className="mt-1 text-xs text-slate-500">Search by name, folder number, or phone before registering to avoid duplicate records.</p>
                    </div>
                    <Button variant="outline" onClick={startRegistration}><Plus size={15} /><span>Register patient</span></Button>
                </div>
                <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <label className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={patientSearch}
                            onChange={(event) => setPatientSearch(event.target.value)}
                            placeholder="Patient name, ID, or phone number..."
                            className="w-full rounded-lg border border-slate-300 bg-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-600 outline-none focus:border-(--primary-color) focus:bg-slate-100"
                        />
                    </label>
                    <Button type="submit" isLoading={searching}><Search size={15} /><span>Search patients</span></Button>
                </form>

                {hasSearched && searchResults.length > 0 && (
                    <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
                        {searchResults.map((patient, index) => {
                            const patientId = getPatientRecordId(patient);
                            return (
                                <button
                                    key={patientId || index}
                                    type="button"
                                    onClick={() => selectPatient(patient)}
                                    className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50"
                                >
                                    <span>
                                        <span className="block text-sm font-semibold text-slate-900">{formatPatientName(patient)}</span>
                                        <span className="mt-1 block font-mono text-[11px] text-slate-500">{getPatientFolderNumber(patient)} · {patient.phone || patient.phoneNumber || patient.phone_number || 'No phone listed'}</span>
                                    </span>
                                    <span className="shrink-0 text-xs font-semibold text-(--primary-color)">Open patient actions <ArrowRight size={13} className="ml-1 inline" /></span>
                                </button>
                            );
                        })}
                    </div>
                )}
                {hasSearched && searchResults.length === 0 && !searchFailed && (
                    <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 sm:flex-row sm:items-center">
                        <p className="text-sm text-amber-900">No registered patient matched. Register a new patient to continue.</p>
                        <Button size="sm" onClick={startRegistration}><Plus size={14} /><span>Register this patient</span></Button>
                    </div>
                )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Today’s patients</h2>
                        <p className="mt-1 text-xs text-slate-500">Queue, consultation notes, and follow-up actions.</p>
                    </div>
                    <Link href="/dashboard/opd" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary-color)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90">
                        <span>Open patient queue</span><ArrowRight size={15} />
                    </Link>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-sm text-slate-400">Loading today’s patients…</div>
                ) : queue.length === 0 ? (
                    <div className="px-5 py-16 text-center text-sm text-slate-400">No patients are currently in today’s queue.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left text-sm">
                            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                <tr><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Folder number</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Record</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {queue.slice(0, 8).map((item, index) => {
                                    const patient = item.patient || {};
                                    const patientId = getPatientRecordId(patient) || item.patientId || item.patient_id;
                                    const queueId = item.id || item._id || patientId || index;
                                    return (
                                        <tr key={queueId}>
                                            <td className="px-5 py-3 font-semibold text-slate-900">
                                                <button type="button" onClick={() => selectPatient(patient)} className="text-left hover:text-(--primary-color) hover:underline">{formatPatientName(patient)}</button>
                                            </td>
                                            <td className="px-5 py-3 font-mono text-xs text-slate-500">{getPatientFolderNumber(patient)}</td>
                                            <td className="px-5 py-3"><Badge variant={getDoctorQueueStatusBadge(item.status)}>{item.status || 'WAITING'}</Badge></td>
                                            <td className="px-5 py-3 text-right">
                                                {patientId ? <Link className="font-semibold text-(--primary-color) hover:underline" href={`/dashboard/records/${encodeURIComponent(patientId)}`}>Open patient record</Link> : <span className="text-xs text-slate-400">Record unavailable</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <RegisterPatientModal
                isOpen={registerOpen}
                onClose={() => setRegisterOpen(false)}
                onSubmit={handleRegisterPatient}
                submitting={registering}
            />
            <DoctorPatientActionsModal
                patient={selectedPatient}
                isOpen={actionsOpen}
                onClose={() => setActionsOpen(false)}
                onSoap={() => { setActionsOpen(false); setSoapOpen(true); }}
                onScan={() => { setActionsOpen(false); setScanOpen(true); }}
                onAppointment={() => { setActionsOpen(false); setAppointmentOpen(true); }}
            />
            <ClinicalConsultationModal
                patientId={getPatientRecordId(selectedPatient)}
                isOpen={soapOpen}
                onClose={() => setSoapOpen(false)}
                onSuccess={loadQueue}
            />
            <PatientScanDetailsModal
                patient={selectedPatient}
                isOpen={scanOpen}
                onClose={() => setScanOpen(false)}
            />
            <ScheduleAppointmentModal
                patientId={getPatientRecordId(selectedPatient)}
                isOpen={appointmentOpen}
                onClose={() => setAppointmentOpen(false)}
                onSuccess={loadQueue}
            />
        </div>
    );
}
