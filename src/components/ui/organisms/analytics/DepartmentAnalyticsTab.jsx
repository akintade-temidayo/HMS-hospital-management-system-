'use client';

import React from 'react';
import { formatNumber } from '@/utils/analyticsUtils';
import { SelectDropdown } from '@/components/ui/atoms/SelectDropdown';

export const DepartmentAnalyticsTab = ({ departments, selectedDeptData, onSelectDepartment, selectedDeptId }) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Departmental Telemetry</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Audit throughput and operational output per functional hospital unit.</p>
                </div>
                <div className="w-full shrink-0 md:w-80">
                <SelectDropdown
                    value={selectedDeptId}
                    onChange={onSelectDepartment}
                    placeholder="Select Department for Deep-Dive..."
                    options={departments.map((department) => {
                        const id = department.id || department.department_id;
                        return { value: id, label: department.name || department.departmentName || department.department_name || 'Department' };
                    }).filter((option) => option.value)}
                />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Staff</span>
                    <p className="text-2xl font-extrabold text-slate-900">{formatNumber(selectedDeptData?.staffCount ?? selectedDeptData?.totalStaff ?? 0)}</p>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Throughput</span>
                    <p className="text-2xl font-extrabold text-slate-900">{formatNumber(selectedDeptData?.patientThroughput ?? selectedDeptData?.appointmentsCount ?? 0)}</p>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Status</span>
                    <p className="text-lg font-bold text-emerald-600">{selectedDeptData?.status || 'Operational'}</p>
                </div>
            </div>
        </div>
    );
};
