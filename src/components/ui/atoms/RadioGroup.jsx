'use client';

import React from 'react';

export const RadioGroup = ({ label, options, value, onChange, name, required = false, error }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-6">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label 
              key={option.value}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all
                peer-checked:border-(--primary-color) peer-checked:bg-(--primary-color)
                group-hover:border-slate-400 ${error ? 'border-rose-500' : 'border-slate-300'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full bg-white transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`} />
              </div>
              <span className={`text-sm font-medium ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-800'}`}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};