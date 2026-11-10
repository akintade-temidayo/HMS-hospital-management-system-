'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { ClinicalConsultationModal } from '@/components/ui/organisms/doctors/ClinicalConsultationModal';
import { ScheduleAppointmentModal } from '@/components/ui/organisms/doctors/ScheduleAppointmentModal';
import { DoctorPatientActionsModal } from '@/components/ui/organisms/doctors/DoctorPatientActionsModal';
import { PatientScanDetailsModal } from '@/components/ui/organisms/doctors/PatientScanDetailsModal';
import { Stethoscope, CheckCircle2, FileText, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { getDoctorQueueList, getDoctorQueueStatusBadge } from '@/utils/doctorUtils';
import { getPatientRecordId } from '@/utils/patientUtils';

export default function DoctorOpdPage() {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    // Active Patient Modals
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isPatientActionsOpen, setIsPatientActionsOpen] = useState(false);
    const [isSoapOpen, setIsSoapOpen] = useState(false);
    const [isScanOpen, setIsScanOpen] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    const openPatientActions = (patient, fallbackId) => {
        const patientId = getPatientRecordId(patient) || fallbackId;
        setSelectedPatient(patientId ? { ...patient, id: patientId } : patient);
        setSelectedPatientId(patientId);
        setIsPatientActionsOpen(true);
    };

    const openPatientModal = (modal) => {
        setIsPatientActionsOpen(false);
        if (modal === 'soap') setIsSoapOpen(true);
        if (modal === 'scan') setIsScanOpen(true);
        if (modal === 'appointment') setIsScheduleOpen(true);
    };

    const fetchQueue = async () => {
        try {
            const res = await api.get('/appointments/queue/today');
            setQueue(getDoctorQueueList(res));
        } catch (err) {
            toast.error(err.message || 'Failed to fetch doctor OPD queue.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(fetchQueue);
    }, []);

    const handleUpdateStatus = async (queueId, status) => {
        try {
            await api.patch(`/appointments/queue/${encodeURIComponent(queueId)}/status`, { status });
            toast.success(`Queue status updated to ${status}.`);
            fetchQueue();
        } catch (err) {
            toast.error(err.message || 'Failed to update queue status.');
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div id="consultations">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Stethoscope className="text-(--primary-color)" size={28} />
                    <span>OPD Consultations & Patient Queue</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Manage active clinical consultations, record SOAP notes, and schedule patient follow-ups.
                </p>
            </div>

            {loading ? (
                <div id="queue" className="py-20 text-center text-xs text-slate-400">Loading OPD queue...</div>
            ) : queue.length === 0 ? (
                <div id="queue" className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center text-slate-400 text-xs">
                    No active patients waiting in the OPD queue.
                </div>
            ) : (
                <div id="queue" className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-3">Patient Name</th>
                                    <th className="px-6 py-3">Folder ID</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {queue.map((item, index) => {
                                    const qId = item.id || item._id || `queue-${index}`;
                                    const patient = item.patient || {};
                                    const pId = getPatientRecordId(patient) || item.patientId || item.patient_id;
                                    const pName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown';
                                    const status = String(item.status || 'WAITING').toUpperCase();

                                    return (
                                        <tr key={qId} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                <button type="button" onClick={() => openPatientActions(patient, pId)} className="text-left hover:text-(--primary-color) hover:underline">{pName}</button>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                {patient.folderNumber || patient.folder_number || 'PAT-XXXXX'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getDoctorQueueStatusBadge(status)}>
                                                    {status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {status === 'WAITING' && (
                                                    <>
                                                        <Button size="sm" onClick={() => handleUpdateStatus(qId, 'IN_CONSULTATION')}>
                                                            <CheckCircle2 size={14} />
                                                            <span>Call In</span>
                                                        </Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(qId, 'SKIPPED')}>
                                                            <span>Skip</span>
                                                        </Button>
                                                    </>
                                                )}
                                                {status === 'IN_CONSULTATION' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => { setSelectedPatientId(pId); setIsSoapOpen(true); }}
                                                        >
                                                            <FileText size={14} />
                                                            <span>SOAP Note</span>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => { setSelectedPatientId(pId); setIsScheduleOpen(true); }}
                                                        >
                                                            <CalendarPlus size={14} />
                                                            <span>Follow-up</span>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() => handleUpdateStatus(qId, 'COMPLETED')}
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            <span>Complete</span>
                                                        </Button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ClinicalConsultationModal
                patientId={selectedPatientId}
                isOpen={isSoapOpen}
                onClose={() => setIsSoapOpen(false)}
                onSuccess={fetchQueue}
            />

            <DoctorPatientActionsModal
                patient={selectedPatient}
                isOpen={isPatientActionsOpen}
                onClose={() => setIsPatientActionsOpen(false)}
                onSoap={() => openPatientModal('soap')}
                onScan={() => openPatientModal('scan')}
                onAppointment={() => openPatientModal('appointment')}
            />

            <PatientScanDetailsModal
                patient={selectedPatient}
                isOpen={isScanOpen}
                onClose={() => setIsScanOpen(false)}
            />

            <ScheduleAppointmentModal
                patientId={selectedPatientId}
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onSuccess={fetchQueue}
            />
        </div>
    );
}
