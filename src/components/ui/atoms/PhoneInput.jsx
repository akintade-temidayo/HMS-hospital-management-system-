'use client';

import React, { useState } from 'react';

export const PhoneInput = ({ label, value, onChange, error, placeholder, required = false }) => {
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value;
    // Allow digits only up to 11 characters
    if (val === '' || (/^\d*$/.test(val) && val.length <= 11)) {
      onChange(e);
    }
  };

  const isInvalid = touched && value.length !== 11;

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
        onBlur={() => setTouched(true)}
        placeholder={placeholder || 'e.g., 08012345678'}
        maxLength={11}
        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg transition-all outline-none 
          text-slate-900 placeholder:text-slate-400
          focus:bg-white focus:ring-2 focus:ring-(--primary-color) focus:border-transparent
          ${error || isInvalid ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'}`}
      />
      {(error || isInvalid) && (
        <span className="text-xs text-rose-500 font-medium">
          {error || 'Phone number must be exactly 11 digits.'}
        </span>
      )}
    </div>
  );
};