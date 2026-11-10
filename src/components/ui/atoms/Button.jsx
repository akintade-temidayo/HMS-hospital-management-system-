'use client';

import React from 'react';

export const Button = ({ children, onClick, type = 'button', variant = 'primary', size = 'md', isLoading = false, disabled = false, className = '' }) => {
  const baseStyles = "font-medium rounded-lg transition-all flex items-center justify-center gap-2 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--primary-color)] text-white hover:opacity-90 shadow-sm",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    success: "bg-[var(--primary-color)] text-white hover:opacity-90 shadow-sm",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
