'use client';

import React from 'react';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { getQueueStatusBadgeVariant } from '@/utils/nurseUtils';
import { formatPatientName, getPatientFolderNumber } from '@/utils/patientUtils';
import { ArrowRightLeft, FilePlus, CheckCircle2, SkipForward } from 'lucide-react';

export const NurseQueueTable = ({ queue, onUpdateStatus, onTransition, onAddTriage }) => {
    if (queue.length === 0) {
        return (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center text-slate-400 text-xs">
                No patients currently in today&apos;s active queue.
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Patient Name</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Queue Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {queue.map((item, index) => {
                            const qId = item.id || item._id || `queue-${index}`;
                            const patient = item.patient || {};
                            const pName = formatPatientName(patient);
                            const status = item.status || 'WAITING';

                            return (
                                <tr key={qId} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900">{pName}</p>
                                        <p className="text-xs text-slate-400 font-mono">{getPatientFolderNumber(patient)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-600 uppercase">
                                        {item.type || 'CONSULTATION'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getQueueStatusBadgeVariant(status)}>
                                            {status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => onAddTriage(patient.id || patient.patient_id || patient._id || item.patientId || item.patient_id)}>
                                            <FilePlus size={14} />
                                            <span>Triage Note</span>
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => onTransition(item)}>
                                            <ArrowRightLeft size={14} />
                                            <span>Transfer</span>
                                        </Button>
                                        {status === 'WAITING' && (
                                            <>
                                                <Button size="sm" onClick={() => onUpdateStatus(qId, 'IN_CONSULTATION')}>
                                                    <CheckCircle2 size={14} />
                                                    <span>Call In</span>
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => onUpdateStatus(qId, 'SKIPPED')}>
                                                    <SkipForward size={14} />
                                                    <span>Skip</span>
                                                </Button>
                                            </>
                                        )}
                                        {status === 'IN_CONSULTATION' && (
                                            <Button size="sm" variant="success" onClick={() => onUpdateStatus(qId, 'COMPLETED')}>
                                                <CheckCircle2 size={14} />
                                                <span>Complete</span>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
