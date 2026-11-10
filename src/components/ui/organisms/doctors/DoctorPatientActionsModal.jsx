'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { CalendarPlus, FileText, ScanLine } from 'lucide-react';
import { formatPatientName, getPatientFolderNumber } from '@/utils/patientUtils';

export const DoctorPatientActionsModal = ({ patient, isOpen, onClose, onSoap, onScan, onAppointment }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Patient Clinical Actions"
        description="Choose what you want to do for this patient."
        maxWidth="max-w-xl"
    >
        {patient && (
            <div className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-bold text-slate-900">{formatPatientName(patient)}</h3>
                    <p className="mt-1 font-mono text-xs text-slate-500">{getPatientFolderNumber(patient)}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Button variant="outline" className="min-h-20 flex-col" onClick={onSoap}>
                        <FileText size={18} />
                        <span>SOAP note</span>
                    </Button>
                    <Button variant="outline" className="min-h-20 flex-col" onClick={onScan}>
                        <ScanLine size={18} />
                        <span>Scan details</span>
                    </Button>
                    <Button variant="outline" className="min-h-20 flex-col" onClick={onAppointment}>
                        <CalendarPlus size={18} />
                        <span>Book appointment</span>
                    </Button>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <Link
                        href={`/dashboard/records/${encodeURIComponent(patient.id || patient.patientId || patient.patient_id || patient._id)}`}
                        className="text-sm font-semibold text-(--primary-color) hover:underline"
                        onClick={onClose}
                    >
                        Open full patient record
                    </Link>
                </div>
            </div>
        )}
    </Modal>
);
