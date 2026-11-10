'use client';

import React from 'react';
import { Label } from '../atoms/Label';

export const FormField = ({ label, error, required = false, htmlFor, children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <Label required={required} htmlFor={htmlFor}>
          {label}
        </Label>
      )}
      {children}
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};