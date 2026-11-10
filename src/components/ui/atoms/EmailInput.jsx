'use client';

import React, { useState } from 'react';

export const EmailInput = ({ label, value, onChange, error, placeholder, required = false }) => {
  const [touched, setTouched] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isLengthValid = value.length >= 6 && value.length <= 30;
  const isEmailValid = emailRegex.test(value);
  const isInvalid = touched && (!isLengthValid || !isEmailValid);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        type="email"
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        placeholder={placeholder || 'name@hospital.com'}
        maxLength={30}
        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg transition-all outline-none 
          text-slate-900 placeholder:text-slate-400
          focus:bg-white focus:ring-2 focus:ring-(--primary-color) focus:border-transparent
          ${error || isInvalid ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'}`}
      />
      {(error || isInvalid) && (
        <span className="text-xs text-rose-500 font-medium">
          {error || 'Valid email required (6–30 characters).'}
        </span>
      )}
    </div>
  );
};