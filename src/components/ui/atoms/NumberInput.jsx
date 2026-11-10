'use client';

import React from 'react';

export const NumberInput = ({ label, value, onChange, error, placeholder, min, max, minLength, maxLength, pattern, required = false }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    // Allow only digits or empty string
    if (val === '' || /^\d+$/.test(val)) {
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        title={minLength === maxLength ? `Enter exactly ${maxLength} digits` : undefined}
        required={required}
        placeholder={placeholder || 'Enter numbers only'}
        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg transition-all outline-none 
          text-slate-900 placeholder:text-slate-400
          focus:bg-white focus:ring-2 focus:ring-(--primary-color) focus:border-transparent
          ${error ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'}`}
      />
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};
