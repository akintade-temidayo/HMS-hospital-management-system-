'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({ value, onChange, placeholder = 'Search...', onClear, className = '' }) => {
return (
    <div className={`relative flex items-center w-full ${className}`}>
    <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent transition-all"
    />
    {value && onClear && (
        <button
        type="button"
        onClick={onClear}
        className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1"
        >
        <X size={14} />
        </button>
    )}
    </div>
);
};