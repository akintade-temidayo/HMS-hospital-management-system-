'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, description, children, maxWidth = 'max-w-lg' }) => {
useEffect(() => {
    const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isOpen) {
        onClose();
    }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onClose]);

if (!isOpen) return null;

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div className={`w-full ${maxWidth} bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)]`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Close modal"
        >
            <X size={18} />
        </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto hide-scrollbar flex-1 min-h-0">
        {children}
        </div>
    </div>
    </div>
);
};
