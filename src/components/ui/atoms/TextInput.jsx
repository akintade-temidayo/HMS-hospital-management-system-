'use client';

import React from 'react';

export const TextInput = ({ label, value, onChange, onFocus, error, placeholder, type = 'text', required = false, disabled = false, min, max, step }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder || 'Enter value...'}
        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg transition-all outline-none 
          text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed
          focus:bg-white focus:ring-2 focus:ring-(--primary-color) focus:border-transparent
          ${error ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'}`}
      />
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};
