'use client';

import React from 'react';

export const TimePicker = ({ label, value, onChange, required = false, error, disabled = false, min }) => (
  <div className="flex w-full flex-col gap-1.5">
    {label && (
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    <div className={`flex items-center rounded-lg border bg-slate-50 px-3.5 transition-all focus-within:border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-(--primary-color) ${error ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        min={min}
        required={required}
        disabled={disabled}
        aria-label={label || 'Time'}
        className="w-full bg-transparent py-2.5 text-sm text-slate-900 outline-none disabled:cursor-not-allowed"
      />
    </div>
    {error && <span className="text-xs font-medium text-rose-500">{error}</span>}
  </div>
);
