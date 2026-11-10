'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationBadge = ({ count = 0, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors outline-none"
    >
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};