'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { SearchInput } from '@/components/ui/atoms/SearchInput';
import { Button } from '@/components/ui/atoms/Button';
import { PatientCard } from '@/components/ui/organisms/health-records/PatientCard';
import { RegisterPatientModal } from '@/components/ui/organisms/health-records/RegisterPatientModal';
import { Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatPatientName, getPatientList } from '@/utils/patientUtils';
import { useAuth } from '@/context/AuthContext';

export default function PatientsRegistryPage() {
    const { user } = useAuth();
    const isPharmacist = String(user?.role || '').trim().toUpperCase() === 'PHARMACIST';
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/patients').catch(() => api.get('/patients/recent?limit=50'));
            setPatients(getPatientList(res));
        } catch (err) {
            toast.error(err.message || 'Failed to fetch patient records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void Promise.resolve().then(fetchPatients);
    }, []);

    const handleRegisterPatient = async (payload, { resetForm }) => {
        try {
            setSubmitting(true);
            const res = await api.post('/patients', payload);
            const created = res?.data?.data ?? res?.data;
            toast.success('Patient record successfully created with auto-generated ID.');
            setPatients((prev) => [created, ...prev]);
            setIsModalOpen(false);
            resetForm();
            fetchPatients();
        } catch (err) {
            toast.error(err.message || 'Failed to register patient.');
        } finally {
            setSubmitting(false);
        }
    };

    const activePatients = patients.filter((patient) => (
        String(patient.admissionStatus || patient.admission_status || patient.status || '').toUpperCase() !== 'DISCHARGED'
    ));
    const filteredPatients = activePatients.filter((p) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        const fullName = formatPatientName(p).toLowerCase();
        const folder = String(p.folderNumber || p.folder_number || p.patientIdNumber || p.patient_id_number || '').toLowerCase();
        const phone = String(p.phone || p.phoneNumber || p.phone_number || '').toLowerCase();
        return fullName.includes(query) || folder.includes(query) || phone.includes(query);
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Users className="text-(--primary-color)" size={28} />
                        <span>Patient Master Index & Registry</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Register permanent patient health records and access cross-departmental Patient 360 files.
                    </p>
                </div>
                {!isPharmacist && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} />
                        <span>Register Patient</span>
                    </Button>
                )}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <SearchInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by patient name, folder number (PAT - 12345), or phone number..."
                    onClear={() => setSearch('')}
                />
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs text-slate-400">Loading patient directory...</div>
            ) : activePatients.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center text-slate-400 text-xs">
                    No patient records are available yet.
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center text-slate-400 text-xs">
                    No patients found matching your search.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map((patient, index) => {
                        const pId = patient.id || patient.patient_id || patient._id || `patient-${index}`;
                        return <PatientCard key={pId} patient={patient} />;
                    })}
                </div>
            )}

            {!isPharmacist && (
                <RegisterPatientModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleRegisterPatient}
                    submitting={submitting}
                />
            )}
        </div>
    );
}
