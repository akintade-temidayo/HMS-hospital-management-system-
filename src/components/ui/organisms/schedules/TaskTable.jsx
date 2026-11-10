'use client';

import React from 'react';
import { Badge } from '@/components/ui/atoms/Badge';
import { TriangleAlert } from 'lucide-react';
import { getAssignedToLabel, isTaskOverdue, getPriorityBadgeVariant, priorityLabels } from '@/utils/taskUtils';

export const TaskTable = ({ tasks, currentTime, onSelectTask }) => {
    const sortedTasks = [...tasks].sort((first, second) => (
        Number(isTaskOverdue(second, currentTime)) - Number(isTaskOverdue(first, currentTime))
    ));

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Task Title</th>
                            <th className="px-6 py-3">Priority</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Due Date</th>
                            <th className="px-6 py-3 text-right">Assigned To</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {sortedTasks.map((t, index) => {
                            const tId = t.id || t._id || `${t.title || 'task'}-${index}`;
                            const overdue = isTaskOverdue(t, currentTime);
                            const isComplete = ['COMPLETED', 'DONE'].includes(String(t.status || '').toUpperCase());
                            return (
                                <tr
                                    key={tId}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`View task details for ${t.title || 'task'}`}
                                    onClick={() => onSelectTask(t)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            onSelectTask(t);
                                        }
                                    }}
                                    className={`cursor-pointer transition-colors hover:bg-slate-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--primary-color) ${overdue ? 'bg-rose-50/30' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-bold text-slate-900">{t.title}</p>
                                            {overdue && (
                                                <Badge variant="danger">
                                                    <span className="inline-flex items-center gap-1"><TriangleAlert size={12} />Overdue</span>
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 truncate max-w-md">{t.description || 'No description provided.'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getPriorityBadgeVariant(t.priority)}>{priorityLabels[t.priority] || t.priority}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-md ${isComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {t.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                                        {(t.dueDate || t.due_date)?.split('T')[0] || 'No due date'}
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-slate-600 font-medium">
                                        {getAssignedToLabel(t)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
