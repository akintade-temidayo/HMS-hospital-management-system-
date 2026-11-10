export const getTaskList = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    return payload.tasks || payload.items || payload.results || [];
};

export const getAssignmentNames = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => (typeof item === 'string' ? item : item?.fullName || item?.full_name || item?.name))
            .filter(Boolean)
            .join(', ');
    }
    if (typeof value === 'string') return value;
    return value?.fullName || value?.full_name || value?.name || '';
};

export const getAssignedToLabel = (task) => {
    const department = task.departmentName
        || task.department_name
        || task.department?.name
        || getAssignmentNames(task.departmentNames || task.department_names || task.departments || task.department);
    const staff = task.assignedName
        || task.assigned_name
        || task.assigneeName
        || task.assignee_name
        || task.assignedToName
        || task.assigned_to_name
        || getAssignmentNames(task.assigneeNames || task.assignee_names || task.assignees || task.assignedTo || task.assigned_to);

    return department || staff || 'Unassigned';
};

export const isTaskOverdue = (task, now) => {
    const status = String(task.status || '').toUpperCase();
    if (['COMPLETED', 'DONE', 'CANCELLED', 'CANCELED'].includes(status)) return false;

    const dueDate = task.dueDate || task.due_date;
    if (!dueDate) return false;

    if (typeof dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        const today = new Date(now);
        const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return dueDate < todayValue;
    }

    const dueTimestamp = new Date(dueDate).getTime();
    return Number.isFinite(dueTimestamp) && dueTimestamp < now;
};

export const getPriorityBadgeVariant = (p) => {
    switch (p) {
        case 'URGENT': return 'danger';
        case 'HIGH': return 'warning';
        case 'MEDIUM': return 'info';
        default: return 'success';
    }
};

export const priorityLabels = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };

export const priorityOptions = [
    { value: 'LOW', label: priorityLabels.LOW },
    { value: 'MEDIUM', label: priorityLabels.MEDIUM },
    { value: 'HIGH', label: priorityLabels.HIGH },
    { value: 'URGENT', label: priorityLabels.URGENT },
];
