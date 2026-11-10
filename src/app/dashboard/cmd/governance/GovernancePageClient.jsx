'use client';

import React, { useState } from 'react';
import { PoliciesTab } from '@/components/ui/organisms/governance/PoliciesTab';
import { BudgetsTab } from '@/components/ui/organisms/governance/BudgetsTab';
import { ReportsTab } from '@/components/ui/organisms/governance/ReportsTab';
import { ShieldAlert, FileText } from 'lucide-react';
import { TbCurrencyNaira } from "react-icons/tb";

export default function CMDGovernancePage() {
  const [activeTab, setActiveTab] = useState('policies'); // 'policies' | 'budgets' | 'reports'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Governance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage hospital-wide policies, financial budgets, and departmental operational reports.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'policies'
              ? 'border-(--primary-color) text-(--primary-color)'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert size={16} />
          <span>Hospital Policies</span>
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'budgets'
              ? 'border-(--primary-color) text-(--primary-color)'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TbCurrencyNaira  size={16} />
          <span>Financial Budgets</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-(--primary-color) text-(--primary-color)'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} />
          <span>Department Reports</span>
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === 'policies' && <PoliciesTab />}
        {activeTab === 'budgets' && <BudgetsTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
}
