'use client';

import React from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { TriangleAlert, CheckCircle2, Clock3, UserRound, Building, FileText } from 'lucide-react';
import { getAssignedToLabel, isTaskOverdue, getPriorityBadgeVariant, priorityLabels } from '@/utils/taskUtils';

export const TaskDetailModal = ({ task, currentTime, onClose }) => {
    if (!task) return null;

    const overdue = isTaskOverdue(task, currentTime);

    return (
        <Modal
            isOpen={!!task}
            onClose={onClose}
            title="Task details"
            description="Review the assignment, due date, and task status."
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900">{task.title}</h4>
                        {overdue && (
                            <Badge variant="danger"><span className="inline-flex items-center gap-1"><TriangleAlert size={12} />Overdue</span></Badge>
                        )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {task.description || 'No description provided.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Building size={15} />Assigned to</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{getAssignedToLabel(task)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><CheckCircle2 size={15} />Status</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{task.status || 'PENDING'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><TriangleAlert size={15} />Priority</p>
                        <div className="mt-2"><Badge variant={getPriorityBadgeVariant(task.priority)}>{priorityLabels[task.priority] || task.priority || 'Not set'}</Badge></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Clock3 size={15} />Due date & time</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                            {(task.dueDate || task.due_date)
                                ? new Date(task.dueDate || task.due_date).toLocaleString()
                                : 'No due date'}
                        </p>
                    </div>
                    {(task.createdByName || task.created_by_name || task.creator?.fullName) && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><UserRound size={15} />Assigned by</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">{task.createdByName || task.created_by_name || task.creator?.fullName}</p>
                        </div>
                    )}
                </div>

                {task.notes && (
                    <div className="rounded-xl border border-slate-200 p-4">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><FileText size={15} />Notes</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{task.notes}</p>
                    </div>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
};