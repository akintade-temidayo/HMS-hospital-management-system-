'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = ({ label, value, onChange, error, placeholder, required = false, helperText }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  // Keep the minimum aligned with the shared password schema.
  const isValidLength = value.length >= 8 && value.length <= 15;
  const hasLetter = /[a-zA-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[^a-zA-Z0-9]/.test(value);
  
  const isInvalid = touched && (!isValidLength || !hasLetter || !hasNumber || !hasSpecial);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={() => setTouched(true)}
          placeholder={placeholder || '8-15 chars (letters, digits, symbols)'}
          minLength={8}
          maxLength={15}
          className={`w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border rounded-lg transition-all outline-none 
            text-slate-900 placeholder:text-slate-400
            focus:bg-white focus:ring-2 focus:ring-(--primary-color) focus:border-transparent
            ${error || isInvalid ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {(error || isInvalid) && (
        <span className="text-xs text-rose-500 font-medium">
          {error || 'Must be 8–15 characters with letters, numbers, and a special character.'}
        </span>
      )}
      {helperText && !error && !isInvalid && (
        <span className="text-xs text-slate-600">{helperText}</span>
      )}
    </div>
  );
};
