'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/atoms/Badge';
import { formatPatientName, getAdmissionBadgeVariant, getGenderBadgeProps, getPatientFolderNumber } from '@/utils/patientUtils';
import { ChevronRight, FolderKanban } from 'lucide-react';

export const PatientCard = ({ patient }) => {
    const router = useRouter();
    const patientId = patient.id || patient.patient_id || patient._id;
    const folderNumber = getPatientFolderNumber(patient);
    const genderProps = getGenderBadgeProps(patient.gender);
    const admissionStatus = patient.admissionStatus || patient.admission_status || 'OUTPATIENT';

    return (
        <div
            onClick={() => router.push(`/dashboard/records/${patientId}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/dashboard/records/${patientId}`);
                }
            }}
            className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-(--primary-color) transition-all cursor-pointer flex flex-col justify-between gap-4"
        >
            {/* Header & Edge Gender Badge */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-400">
                        <FolderKanban size={13} /> {folderNumber}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-(--primary-color) transition-colors">
                        {formatPatientName(patient)}
                    </h3>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${genderProps.className} shrink-0 shadow-2xs`}>
                    {genderProps.label}
                </span>
            </div>

            {/* Footer / Status & Action */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Badge variant={getAdmissionBadgeVariant(admissionStatus)}>
                    {admissionStatus}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-(--primary-color) opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Patient 360</span>
                    <ChevronRight size={14} />
                </span>
            </div>
        </div>
    );
};
