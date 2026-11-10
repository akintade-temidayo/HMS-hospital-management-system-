'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/atoms/Button';
import { TaskTable } from '@/components/ui/organisms/schedules/TaskTable';
import { TaskDetailModal } from '@/components/ui/organisms/schedules/TaskDetailModal';
import { CreateTaskModal } from '@/components/ui/organisms/schedules/CreateTaskModal';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getTaskList } from '@/utils/taskUtils';
import { requestNotificationsRefresh, requestTasksRefresh, subscribeToTasksRefresh } from '@/utils/notificationEvents';
import { useAuth } from '@/context/AuthContext';
import { belongsToDepartment, getDepartmentScope } from '@/utils/departmentUtils';

export const TasksTab = ({ departmentScoped = false }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const departmentScope = getDepartmentScope(user, departments);
    const assignableStaff = departmentScoped
        ? staffList.filter((staff) => belongsToDepartment(staff, departmentScope))
        : staffList;

    useEffect(() => {
        let active = true;
        Promise.all([
            api.get('/tasks'),
            api.get('/cmd/staff'),
            api.get('/cmd/departments'),
        ]).then(([taskRes, staffRes, deptRes]) => {
            if (!active) return;
            setTasks(getTaskList(taskRes));
            setStaffList(staffRes.data.data || staffRes.data || []);
            setDepartments(deptRes.data.data || deptRes.data || []);
        }).catch((err) => {
            if (active) toast.error(err.message || 'Failed to fetch tasks data.');
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => setCurrentTime(Date.now()), 60_000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        const refreshTasks = () => {
            api.get('/tasks')
                .then((response) => setTasks(getTaskList(response)))
                .catch(() => {});
        };
        const unsubscribe = subscribeToTasksRefresh(refreshTasks);
        const timer = window.setInterval(refreshTasks, 30_000);
        return () => {
            unsubscribe();
            window.clearInterval(timer);
        };
    }, []);

    const handleCreateTaskSubmit = async (formData, { resetForm }) => {
        const { assignmentType, selectedStaffIds, title, description, priority, departmentName, dueDate, dueTime } = formData;

        if (departmentScoped && !departmentScope.name) {
            toast.error('Your account is not linked to a department. Ask an administrator to update your staff profile.');
            return;
        }
        if (departmentScoped && assignmentType !== 'STAFF') {
            toast.error('Department admins can assign tasks only to staff in their own department.');
            return;
        }

        if (assignmentType === 'STAFF' && selectedStaffIds.length === 0) {
            toast.error('Please select at least one staff member.');
            return;
        }
        if (assignmentType === 'DEPARTMENT' && !departmentName) {
            toast.error('Please select a department.');
            return;
        }
        if (assignmentType === 'STAFF' && selectedStaffIds.some((id) => {
            const staff = assignableStaff.find((member) => String(member.id || member.user_id) === String(id));
            return !(staff?.fullName || staff?.full_name);
        })) {
            toast.error('Each selected staff member must have a name before assignment.');
            return;
        }
        if (!title.trim() || !dueDate || !dueTime) {
            toast.error('Enter a task title, due date, and due time.');
            return;
        }

        const dueDateTime = new Date(`${dueDate}T${dueTime}`);

        setSubmitting(true);
        try {
            const payloadBase = {
                title,
                description,
                priority,
                dueDate: dueDateTime.toISOString(),
            };

            const selectedStaffNames = selectedStaffIds
                .map((id) => assignableStaff.find((staff) => String(staff.id || staff.user_id) === String(id)))
                .map((staff) => staff?.fullName || staff?.full_name)
                .filter(Boolean);

            const assignment = assignmentType === 'DEPARTMENT'
                ? { departmentNames: [departmentName] }
                : { assigneeNames: selectedStaffNames };

            const response = await api.post('/tasks', { ...payloadBase, ...assignment });
            requestNotificationsRefresh();
            requestTasksRefresh();

            const createdPayload = response?.data?.data ?? response?.data;
            const returnedTasks = Array.isArray(createdPayload)
                ? createdPayload
                : createdPayload?.tasks || (createdPayload?.task ? [createdPayload.task] : null)
                    || (createdPayload && (createdPayload.id || createdPayload._id) ? [createdPayload] : []);

            const assignmentDetails = assignmentType === 'DEPARTMENT'
                ? { departmentName, departmentNames: [departmentName] }
                : { assignedName: selectedStaffNames.join(', '), assigneeNames: selectedStaffNames };

            const visibleCreatedTasks = returnedTasks.length
                ? returnedTasks.map((task) => ({ ...assignmentDetails, ...task }))
                : [{
                    id: `local-${Date.now()}`,
                    ...payloadBase,
                    ...assignmentDetails,
                    status: 'PENDING',
                }];

            toast.success('Task(s) successfully created and assigned.');
            setTasks((current) => {
                const existingIds = new Set(current.map((task) => task.id || task._id).filter(Boolean));
                return [...visibleCreatedTasks.filter((task) => !existingIds.has(task.id || task._id)), ...current];
            });

            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            toast.error(err.message || 'Failed to create task.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Operational Tasks & Duty Assignments</h3>
                    <p className="text-xs text-slate-500 mt-1">Assign hospital duties and monitor task status and due dates.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} />
                        <span>Create Task</span>
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-xs">
                    No active tasks assigned.
                </div>
            ) : (
                <TaskTable tasks={tasks} currentTime={currentTime} onSelectTask={setSelectedTask} />
            )}

            <TaskDetailModal
                task={selectedTask}
                currentTime={currentTime}
                onClose={() => setSelectedTask(null)}
            />

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                staffList={assignableStaff}
                departments={departments}
                departmentScoped={departmentScoped}
                scopedDepartmentName={departmentScope.name}
                onSubmit={handleCreateTaskSubmit}
                submitting={submitting}
            />
        </div>
    );
};
