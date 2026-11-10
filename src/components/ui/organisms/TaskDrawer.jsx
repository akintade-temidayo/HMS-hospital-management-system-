'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Check, CheckSquare, Clock3, X } from 'lucide-react';
import { toast } from 'sonner';
import { getTaskList, getAssignedToLabel, getPriorityBadgeVariant, isTaskOverdue, priorityLabels } from '@/utils/taskUtils';
import { requestTasksRefresh, subscribeToTasksRefresh } from '@/utils/notificationEvents';

const getTaskId = (task) => task.id || task._id || task.taskId || task.task_id;
const isTaskComplete = (task) => ['COMPLETED', 'DONE', 'CANCELLED', 'CANCELED'].includes(String(task.status || '').toUpperCase());
const dueDateOf = (task) => task.dueDate || task.due_date;

export const TaskDrawer = ({ isOpen, onClose }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [completingId, setCompletingId] = useState(null);

    const fetchTasks = useCallback(async ({ quiet = false } = {}) => {
        try {
            setLoading(true);
            const response = await api.get('/tasks');
            setTasks(getTaskList(response).filter((task) => !isTaskComplete(task)));
        } catch (error) {
            if (!quiet) toast.error(error?.message || 'Could not load your tasks.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return undefined;
        const timer = window.setTimeout(() => fetchTasks(), 0);
        const unsubscribe = subscribeToTasksRefresh(() => fetchTasks({ quiet: true }));
        const pollTimer = window.setInterval(() => fetchTasks({ quiet: true }), 30_000);
        return () => {
            window.clearTimeout(timer);
            window.clearInterval(pollTimer);
            unsubscribe();
        };
    }, [isOpen, fetchTasks]);

    const markTaskDone = async (task) => {
        const taskId = getTaskId(task);
        if (!taskId) {
            toast.error('This task is missing its ID and cannot be updated.');
            return;
        }

        setCompletingId(taskId);
        try {
            await api.patch(`/tasks/${encodeURIComponent(taskId)}/status`, { status: 'COMPLETED' });
            setTasks((current) => current.filter((item) => String(getTaskId(item)) !== String(taskId)));
            requestTasksRefresh();
            toast.success('Task marked as done.');
        } catch (error) {
            toast.error(error?.message || 'Could not mark this task as done.');
        } finally {
            setCompletingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
            <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl animate-in slide-in-from-right duration-300" aria-label="Your tasks">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-(--primary-color)/10 p-2 text-(--primary-color)"><CheckSquare size={18} /></div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">My tasks</h2>
                            <p className="text-xs text-slate-500">{tasks.length} open {tasks.length === 1 ? 'task' : 'tasks'}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close tasks" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {loading && tasks.length === 0 ? (
                        <p className="py-12 text-center text-xs text-slate-400">Loading your tasks...</p>
                    ) : tasks.length === 0 ? (
                        <div className="py-16 text-center">
                            <CheckSquare className="mx-auto mb-3 text-slate-300" size={28} />
                            <p className="text-sm font-semibold text-slate-700">You’re all caught up</p>
                            <p className="mt-1 text-xs text-slate-400">New assignments will appear here.</p>
                        </div>
                    ) : tasks.map((task, index) => {
                        const taskId = getTaskId(task) || `task-${index}`;
                        const dueDate = dueDateOf(task);
                        return (
                            <article key={taskId} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-sm font-bold text-slate-900">{task.title || 'Assigned task'}</h3>
                                    <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                                        <Badge variant="info">{task.status || 'PENDING'}</Badge>
                                        <Badge variant={getPriorityBadgeVariant(String(task.priority || '').toUpperCase())}>
                                            {priorityLabels[String(task.priority || '').toUpperCase()] || task.priority || 'Not set'}
                                        </Badge>
                                    </div>
                                </div>
                                <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{task.description || 'No description provided.'}</p>
                                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                                    <p><span className="font-semibold text-slate-500">Assigned to:</span> <span className="text-slate-700">{getAssignedToLabel(task)}</span></p>
                                    {dueDate && (
                                        <p className={`flex items-center gap-1.5 ${isTaskOverdue(task, Date.now()) ? 'text-rose-600' : 'text-slate-500'}`}>
                                            <Clock3 size={13} />
                                            <span>Due {new Date(dueDate).toLocaleString()}</span>
                                        </p>
                                    )}
                                    {(task.createdByName || task.created_by_name || task.creator?.fullName) && (
                                        <p><span className="font-semibold text-slate-500">Assigned by:</span> <span className="text-slate-700">{task.createdByName || task.created_by_name || task.creator?.fullName}</span></p>
                                    )}
                                </div>
                                {task.notes && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">{task.notes}</p>}
                                <div className="mt-4 flex justify-end">
                                    <Button size="sm" isLoading={completingId === taskId} disabled={completingId !== null} onClick={() => markTaskDone(task)}>
                                        <Check size={14} />
                                        <span>Mark as done</span>
                                    </Button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </aside>
        </div>
    );
};
