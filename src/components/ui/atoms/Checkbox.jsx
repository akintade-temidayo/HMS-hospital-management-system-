'use client';

import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = ({ label, checked, onChange, disabled = false, error }) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
        />
        <div className={`w-5 h-5 bg-slate-50 border rounded-md transition-all flex items-center justify-center
          peer-checked:bg-(--primary-color) peer-checked:border-(--primary-color)
          peer-focus:ring-2 peer-focus:ring-(--primary-color)/20
          ${error ? 'border-rose-500' : 'border-slate-300 hover:border-slate-400'}`}
        >
          <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    </label>
  );
};