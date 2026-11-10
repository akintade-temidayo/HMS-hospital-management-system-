'use client';

import React from 'react';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Users, Clock, ArrowRight } from 'lucide-react';

export const DepartmentQueueTable = ({ queueItems = [], onTransition }) => {
  if (!queueItems || queueItems.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <Users size={40} className="mx-auto text-slate-300 mb-3" />
        <h4 className="text-sm font-bold text-slate-700">Queue is currently empty</h4>
        <p className="text-xs text-slate-400 mt-1">Patient encounters will appear here in real-time[cite: 10, 11]</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock size={16} className="text-(--primary-color)" />
          Active Department Queue
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
          {queueItems.length} Patients Waiting
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Patient Name</th>
              <th className="px-6 py-3">Visit Type</th>
              <th className="px-6 py-3">Chief Complaint</th>
              <th className="px-6 py-3">Queue Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {queueItems.map((item) => (
              <tr key={item.id || item.encounter_id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">
                  {item.patient_name || item.fullName}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="font-mono text-xs font-medium">{item.visit_type || 'OUTPATIENT'}</span>
                </td>
                <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                  {item.chief_complaint || 'General Consultation'}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="warning">
                    {item.status || item.current_status || 'WAITING'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  {onTransition && (
                    <Button size="sm" variant="outline" onClick={() => onTransition(item)}>
                      <span>Transition</span>
                      <ArrowRight size={14} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};