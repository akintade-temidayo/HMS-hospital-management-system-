'use client';

import React from 'react';
import { Users, FileText, UserCheck } from 'lucide-react';
import { formatNumber } from '@/utils/analyticsUtils';

export const PatientAnalyticsTab = ({ data }) => {
    const totalPatients = data?.totalPatients ?? data?.activePatients ?? 0;
    const newPatients = data?.newPatients ?? data?.newSignups ?? 0;
    const clinicalRecords = data?.clinicalRecords ?? data?.recordsCount ?? 0;
    const admissionStatus = data?.admissionStatus || data?.statusDistribution || {};
    const genderDistribution = data?.genderDistribution || {};

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Patients</span>
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Users size={18} /></div>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{formatNumber(totalPatients)}</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Patient Growth</span>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><UserCheck size={18} /></div>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{formatNumber(newPatients)}</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Records</span>
                        <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600"><FileText size={18} /></div>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{formatNumber(clinicalRecords)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Admission Status Breakdown</h4>
                    <div className="space-y-3">
                        {Object.keys(admissionStatus).length === 0 ? (
                            <p className="text-xs text-slate-400">No admission status breakdown available.</p>
                        ) : (
                            Object.entries(admissionStatus).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                                    <span className="font-semibold text-slate-700 uppercase">{key}</span>
                                    <span className="font-bold text-slate-900">{formatNumber(val)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Gender Distribution</h4>
                    <div className="space-y-3">
                        {Object.keys(genderDistribution).length === 0 ? (
                            <p className="text-xs text-slate-400">No gender distribution data available.</p>
                        ) : (
                            Object.entries(genderDistribution).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                                    <span className="font-semibold text-slate-700 uppercase">{key}</span>
                                    <span className="font-bold text-slate-900">{formatNumber(val)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};