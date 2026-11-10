'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { RotateCcw, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/atoms/Button';
import { SearchInput } from '@/components/ui/atoms/SearchInput';
import { patientService } from '@/services/patient.service';
import { formatPatientName, getPatientFolderNumber, getPatientList, getPatientRecordId } from '@/utils/patientUtils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PatientArchivePageClient() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const isNurse = String(user?.role || '').trim().toUpperCase() === 'NURSE';
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restoringId, setRestoringId] = useState(null);
    const [search, setSearch] = useState('');

    const loadArchive = useCallback(async () => {
        try {
            const response = await patientService.getArchivedPatients();
            setPatients(getPatientList(response));
        } catch (error) {
            toast.error(error?.message || 'Could not load archived patients.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && isNurse) router.replace('/dashboard/nurses');
    }, [authLoading, isNurse, router]);

    useEffect(() => {
        if (authLoading || isNurse) return;
        void loadArchive();
    }, [authLoading, isNurse, loadArchive]);

    if (authLoading || isNurse) return null;

    const restorePatient = async (patient) => {
        const patientId = getPatientRecordId(patient);
        if (!patientId) {
            toast.error('This patient record is missing its ID and cannot be restored.');
            return;
        }
        setRestoringId(patientId);
        try {
            await patientService.restorePatient(patientId);
            setPatients((current) => current.filter((item) => String(getPatientRecordId(item)) !== String(patientId)));
            toast.success(`${formatPatientName(patient)} restored as an admitted patient.`);
        } catch (error) {
            toast.error(error?.message || 'Could not restore this patient.');
        } finally {
            setRestoringId(null);
        }
    };

    const query = search.trim().toLowerCase();
    const filteredPatients = patients.filter((patient) => (
        formatPatientName(patient).toLowerCase().includes(query) ||
        getPatientFolderNumber(patient).toLowerCase().includes(query) ||
        String(patient.phone || patient.phoneNumber || patient.phone_number || '').toLowerCase().includes(query)
    ));

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Archive</h1>
                <p className="mt-1 text-sm text-slate-500">Discharged patients are kept here with their records intact.</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <SearchInput
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onClear={() => setSearch('')}
                    placeholder="Search archived patients by name, folder ID, or phone number..."
                />
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                {loading ? (
                    <p className="py-12 text-center text-sm text-slate-400">Loading archived patients…</p>
                ) : patients.length === 0 ? (
                    <div className="py-14 text-center">
                        <Archive className="mx-auto mb-3 text-slate-300" size={28} />
                        <p className="text-sm font-medium text-slate-600">No archived patients</p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <p className="py-12 text-center text-sm text-slate-500">No archived patients match your search.</p>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Patient</th>
                                <th className="px-6 py-4 font-semibold">Folder ID</th>
                                <th className="px-6 py-4 text-right font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {filteredPatients.map((patient, index) => {
                            const id = getPatientRecordId(patient) || `archived-${index}`;
                            return (
                                <tr key={id} className="hover:bg-slate-50/70">
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{formatPatientName(patient)}</td>
                                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">{getPatientFolderNumber(patient)}</td>
                                    <td className="px-6 py-3 text-right">
                                        <Button size="sm" variant="outline" isLoading={restoringId === id} disabled={restoringId !== null} onClick={() => restorePatient(patient)}>
                                            <RotateCcw size={14} />
                                            <span>Restore</span>
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    </div>
                )}
            </section>
        </div>
    );
}
