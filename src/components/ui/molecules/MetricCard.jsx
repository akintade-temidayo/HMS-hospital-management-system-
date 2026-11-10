'use client';

import React from 'react';

export const MetricCard = ({ title, value, icon: Icon, trend, trendUp = true }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-50 text-(--primary-color) border border-slate-100">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {trend && (
          <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span>{trend}</span>
          </p>
        )}
      </div>
    </div>
  );
};