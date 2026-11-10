'use client';

import React, { useState } from 'react';
import { ShiftsTab } from '@/components/ui/organisms/schedules/ShiftsTab';
import { TasksTab } from '@/components/ui/organisms/schedules/TasksTab';
import { CalendarClock, CheckSquare } from 'lucide-react';

export default function CMDSchedulesPage() {
const [activeTab, setActiveTab] = useState('shifts'); // 'shifts' | 'tasks'

return (
    <div className="space-y-6 max-w-7xl mx-auto">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Schedules & Task Management</h1>
        <p className="text-xs text-slate-500 mt-1">
            Organize staff duty rosters, shift schedules, and operational task assignments[cite: 13, 14].
        </p>
        </div>
    </div>

    {/* Tabs Navigation */}
    <div className="flex items-center gap-2 border-b border-slate-200">
        <button
        onClick={() => setActiveTab('shifts')}
        className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'shifts'
            ? 'border-(--primary-color) text-(--primary-color)'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
        >
        <CalendarClock size={16} />
        <span>Duty Roster & Shifts</span>
        </button>
        <button
        onClick={() => setActiveTab('tasks')}
        className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'tasks'
            ? 'border-(--primary-color) text-(--primary-color)'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
        >
        <CheckSquare size={16} />
        <span>Operational Tasks</span>
        </button>
    </div>

    {/* Active Tab Content */}
    <div className="pt-2">
        {activeTab === 'shifts' && <ShiftsTab />}
        {activeTab === 'tasks' && <TasksTab />}
    </div>
    </div>
);
}
