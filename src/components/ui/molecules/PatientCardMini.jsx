'use client';

import React from 'react';
import { User, Phone } from 'lucide-react';
import { Badge } from '../atoms/Badge';

export const PatientCardMini = ({ patient, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-slate-200/80 hover:border-(--primary-color) rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-(--primary-color)/10 text-slate-600 group-hover:text-(--primary-color) flex items-center justify-center transition-colors">
          <User size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-(--primary-color) transition-colors">
            {patient.fullName || `${patient.firstName} ${patient.lastName}`}
          </h4>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
            <span className="font-mono font-medium text-slate-600">{patient.patNumber || patient.patientId}</span>
            {patient.gender && <span>• {patient.gender}</span>}
            {patient.phoneNumber && (
              <span className="flex items-center gap-1">
                <Phone size={12} /> {patient.phoneNumber}
              </span>
            )}
          </div>
        </div>
      </div>
      <div>
        <Badge variant={patient.isEmergency ? 'danger' : 'success'}>
          {patient.isEmergency ? 'Emergency' : patient.admissionStatus || 'Active'}
        </Badge>
      </div>
    </div>
  );
};