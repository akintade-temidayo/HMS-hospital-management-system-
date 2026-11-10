'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { ConfirmModal } from '@/components/ui/molecules/ConfirmModal';
import { patientService } from '@/services/patient.service';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Phone, MapPin, FileText, Activity, CreditCard, Stethoscope, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { formatPatientName, formatPatientDateOfBirth, getAdmissionBadgeVariant, getGenderBadgeProps, getPatientFolderNumber, getPlannedStayDetails } from '@/utils/patientUtils';

export default function Patient360Client({ params }) {
    const unwrappedParams = use(params);
    const patientId = unwrappedParams.patientId;
    const router = useRouter();
    const { user } = useAuth();
    const isPharmacist = String(user?.role || '').trim().toUpperCase() === 'PHARMACIST';

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);
    const [discharging, setDischarging] = useState(false);

    useEffect(() => {
        let active = true;
        api.get(`/patients/${patientId}/summary`)
            .then((res) => {
                if (!active) return;
                const payload = res?.data?.data ?? res?.data ?? {};
                setSummary(payload);
            })
            .catch((err) => {
                if (active) toast.error(err.message || 'Failed to fetch Patient 360 summary.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [patientId]);

    if (loading) {
        return <div className="py-24 text-center text-xs text-slate-400">Loading Patient 360 profile...</div>;
    }

    const patient = summary?.patient || summary || {};
    const genderProps = getGenderBadgeProps(patient.gender);
    const admissionStatus = patient.admissionStatus || patient.admission_status || 'OUTPATIENT';
    const plannedStay = getPlannedStayDetails(patient);
    const summaryEntries = summary?.entries || summary?.clinicalEntries || summary?.clinical_entries || [];
    const dailyCheckEntries = Array.isArray(summaryEntries) ? summaryEntries.filter((entry) => String(entry.entryType || entry.entry_type || entry.type || '').toUpperCase() === 'DAILY_NURSING_CHECK') : [];
    const dailyCheckDates = new Set(dailyCheckEntries.map((entry) => {
        const dateValue = entry.createdAt || entry.created_at || entry.recordedAt || entry.recorded_at || entry.date;
        const fromContent = String(entry.content || '').match(/Recorded:\s*(\d{4}-\d{2}-\d{2})/i)?.[1];
        const date = dateValue ? new Date(dateValue) : fromContent ? new Date(`${fromContent}T12:00:00`) : null;
        return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-CA') : null;
    }).filter(Boolean));
    const stayComplete = plannedStay.days !== null && dailyCheckDates.size >= plannedStay.days;
    const nextCheckDay = plannedStay.days ? Math.min(dailyCheckDates.size + 1, plannedStay.days) : null;

    const dischargePatient = async () => {
        setDischarging(true);
        try {
            const response = await patientService.updateAdmissionStatus(patientId, { admissionStatus: 'DISCHARGED' });
            const payload = response?.data?.patient || response?.patient || response?.data || response;
            setSummary((current) => {
                if (!current) return current;
                const currentPatient = current.patient || current;
                const updatedPatient = {
                    ...currentPatient,
                    ...(payload?.patient || payload),
                    admissionStatus: 'DISCHARGED',
                    admission_status: 'DISCHARGED',
                };
                return current.patient ? { ...current, patient: updatedPatient } : updatedPatient;
            });
            setShowDischargeConfirm(false);
            toast.success('Patient discharged and added to the archive.');
        } catch (error) {
            toast.error(error?.message || 'Could not discharge this patient.');
        } finally {
            setDischarging(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Navigation & Actions */}
            <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/records')}>
                    <ArrowLeft size={16} />
                    <span>Back to Registry</span>
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                        Folder ID: {getPatientFolderNumber(patient)}
                    </span>
                </div>
            </div>

            {/* Patient Profile Card Header */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-extrabold text-slate-900">{formatPatientName(patient)}</h1>
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-lg border ${genderProps.className}`}>
                                {genderProps.label}
                            </span>
                            <Badge variant={getAdmissionBadgeVariant(admissionStatus)}>
                                {admissionStatus}
                            </Badge>
                            {!isPharmacist && String(admissionStatus).toUpperCase() !== 'DISCHARGED' && (
                                <Button size="sm" variant="outline" onClick={() => setShowDischargeConfirm(true)}>
                                    <LogOut size={14} />
                                    <span>Discharge</span>
                                </Button>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                            <span className="flex items-center gap-1"><Phone size={13} /> {patient.phone || patient.phone_number || 'N/A'}</span>
                            <span className="flex items-center gap-1"><MapPin size={13} /> {patient.address || 'No address provided'}</span>
                            <span>DOB: {formatPatientDateOfBirth(patient.dateOfBirth || patient.date_of_birth)}</span>
                        </div>
                        {String(admissionStatus).toUpperCase() === 'ADMITTED' && (
                            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs">
                                <span className="font-semibold text-slate-700">Planned stay: {plannedStay.label}</span>
                                {plannedStay.duration && (
                                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stayComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {stayComplete ? 'Completed' : 'In progress'}
                                    </span>
                                )}
                                <span className="text-slate-500">
                                    {plannedStay.admissionDay && plannedStay.days
                                        ? `Day ${plannedStay.admissionDay} of ${plannedStay.days} days`
                                        : plannedStay.days && !stayComplete
                                            ? `Next check: Day ${nextCheckDay} of ${plannedStay.days} days`
                                            : plannedStay.days
                                                ? `All ${plannedStay.days} daily checks completed`
                                                : `${dailyCheckDates.size} daily checks recorded`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={!isPharmacist && showDischargeConfirm}
                title="Discharge patient"
                message={`Discharge ${formatPatientName(patient)}? Their record will move to the patient archive.`}
                confirmText="Yes, Discharge"
                variant="danger"
                isLoading={discharging}
                onClose={() => setShowDischargeConfirm(false)}
                onConfirm={dischargePatient}
            />

            {/* Cross-Departmental Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Entries & Notes</span>
                        <FileText size={18} className="text-sky-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{Array.isArray(summaryEntries) ? summaryEntries.length : summary?.recordsCount || 0}</p>
                    <p className="text-[11px] text-slate-400">Clinical file attachments</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Appointments</span>
                        <Activity size={18} className="text-emerald-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{summary?.appointments?.length || 0}</p>
                    <p className="text-[11px] text-slate-400">Encounter history</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Active Prescriptions</span>
                        <Stethoscope size={18} className="text-indigo-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{summary?.prescriptions?.length || 0}</p>
                    <p className="text-[11px] text-slate-400">Dispensing logs</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">Invoices & Billing</span>
                        <CreditCard size={18} className="text-teal-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{summary?.invoices?.length || 0}</p>
                    <p className="text-[11px] text-slate-400">Itemized financial ledgers</p>
                </div>
            </div>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-sky-600" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Clinical Record Entries</h2>
                </div>
                {!Array.isArray(summaryEntries) || summaryEntries.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No clinical entries are available.</p>
                ) : (
                    <ul className="max-h-96 space-y-3 overflow-y-auto">
                        {summaryEntries.map((entry, index) => {
                            const createdAt = entry.createdAt || entry.created_at || entry.recordedAt || entry.recorded_at;
                            const createdDate = createdAt ? new Date(createdAt) : null;
                            const dateLabel = createdDate && !Number.isNaN(createdDate.getTime())
                                ? createdDate.toLocaleString()
                                : '';
                            return (
                                <li key={entry.id || entry._id || index} className="rounded-xl border border-slate-100 p-4">
                                    <div className="flex flex-wrap justify-between gap-2">
                                        <span className="text-xs font-bold text-slate-700">
                                            {entry.entryType || entry.entry_type || entry.type || 'Clinical entry'}
                                        </span>
                                        {dateLabel && <span className="text-[10px] text-slate-400">{dateLabel}</span>}
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-xs text-slate-600">
                                        {entry.content || entry.notes || entry.description || 'No entry details.'}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
