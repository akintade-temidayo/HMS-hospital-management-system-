'use client';

import React from 'react';
import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/analyticsUtils';

export const CmdOverviewTab = ({ data }) => {
    const revenue = data?.revenue ?? data?.totalRevenue ?? 0;
    const expenses = data?.expenses ?? data?.operatingExpenses ?? 0;
    const netIncome = data?.netOperatingIncome ?? data?.net_operating_income ?? data?.netIncome ?? data?.net_income ?? (revenue - expenses);
    const totalPatients = data?.totalPatients ?? data?.total_patients ?? data?.patientVolume ?? data?.patient_volume ?? data?.patientCount ?? data?.patient_count ?? 0;
    const activeAppointments = data?.activeAppointments ?? data?.appointmentCount ?? 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(revenue)}</p>
                    <p className="text-xs text-emerald-600 font-medium">Realized hospital earnings</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Expenses</span>
                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(expenses)}</p>
                    <p className="text-xs text-rose-600 font-medium">Overhead and maintenance</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Operating Income</span>
                        <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
                            <Activity size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(netIncome)}</p>
                    <p className="text-xs text-slate-500 font-medium">Revenue minus expenses</p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Volume</span>
                        <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
                            <Users size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{formatNumber(totalPatients)}</p>
                    <p className="text-xs text-sky-600 font-medium">{formatNumber(activeAppointments)} active appointments</p>
                </div>
            </div>
        </div>
    );
};
