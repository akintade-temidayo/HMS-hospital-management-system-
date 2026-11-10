'use client';

import React from 'react';

export const Label = ({ children, required = false, htmlFor, className = '' }) => {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`text-xs font-semibold text-slate-700 tracking-wide uppercase ${className}`}
    >
      {children} {required && <span className="text-rose-500">*</span>}
    </label>
  );
};