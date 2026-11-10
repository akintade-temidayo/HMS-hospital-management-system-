'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { ShiftCalendar } from '@/components/ui/organisms/schedules/ShiftCalendar';
import { Button } from '@/components/ui/atoms/Button';
import { SelectDropdown } from '@/components/ui/atoms/SelectDropdown';
import { DateTimePicker } from '@/components/ui/atoms/DateTimePicker';
import { TextAreaInput } from '@/components/ui/atoms/TextAreaInput';
import { SearchInput } from '@/components/ui/atoms/SearchInput';
import { Modal } from '@/components/ui/atoms/Modal';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { requestNotificationsRefresh } from '@/utils/notificationEvents';
import { useAuth } from '@/context/AuthContext';
import { belongsToDepartment, getDepartmentScope } from '@/utils/departmentUtils';

export const ShiftsTab = ({ departmentScoped = false }) => {
const { user } = useAuth();
const [shifts, setShifts] = useState([]);
const [staffList, setStaffList] = useState([]);
const [departments, setDepartments] = useState([]);
const [loading, setLoading] = useState(true);

// Modal state
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingShift, setEditingShift] = useState(null);
const [searchStaff, setSearchStaff] = useState('');
const [form, setForm] = useState({
    userId: '',
    departmentName: '',
    shiftType: 'MORNING',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    notes: '',
});
const [submitting, setSubmitting] = useState(false);
const departmentScope = getDepartmentScope(user, departments);
const visibleStaff = departmentScoped ? staffList.filter((staff) => belongsToDepartment(staff, departmentScope)) : staffList;
const visibleShifts = departmentScoped ? shifts.filter((shift) => belongsToDepartment(shift, departmentScope)) : shifts;

const emptyForm = () => ({
    userId: '', departmentName: '', shiftType: 'MORNING',
    startDate: '', startTime: '', endDate: '', endTime: '', notes: '',
});

const toLocalDateTimeParts = (value) => {
    if (!value) return { date: '', time: '' };
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return { date: '', time: '' };
    const pad = (part) => String(part).padStart(2, '0');
    return {
        date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
        time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
    };
};

const getShiftId = (shift) => shift?.id || shift?._id || shift?.scheduleId || shift?.schedule_id;
const toDateInputValue = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const todayDate = toDateInputValue(new Date());

const openCreateModal = () => {
    if (departmentScoped && (!departmentScope.id && !departmentScope.name)) {
        toast.error('Your account is not linked to a department. Ask an administrator to update your staff profile.');
        return;
    }
    setEditingShift(null);
    setForm({ ...emptyForm(), departmentName: departmentScoped ? departmentScope.name : '' });
    setSearchStaff('');
    setIsModalOpen(true);
};

const openEditModal = (shift) => {
    if (departmentScoped && !belongsToDepartment(shift, departmentScope)) {
        toast.error('You can only edit shifts in your department.');
        return;
    }
    const id = getShiftId(shift);
    if (!id) {
        toast.error('This shift cannot be edited because it has no schedule ID.');
        return;
    }
    const start = toLocalDateTimeParts(shift.startTime || shift.start_time);
    const end = toLocalDateTimeParts(shift.endTime || shift.end_time);
    const departmentValue = shift.departmentName || shift.department_name || shift.department?.name || shift.departmentId || shift.department_id;
    const department = departments.find((item) => {
        const name = item.name || item.departmentName || item.department_name;
        const departmentId = item.id || item._id || item.departmentId || item.department_id;
        return String(name || '') === String(departmentValue || '') || String(departmentId || '') === String(departmentValue || '');
    });
    const departmentName = departmentScoped
        ? departmentScope.name
        : department?.name || department?.departmentName || department?.department_name || departmentValue || '';
    const userId = shift.userId || shift.user_id || shift.user?.id || shift.user?._id || shift.staff?.id || shift.staff?._id || '';

    setEditingShift({ ...shift, id });
    setForm({
        userId: String(userId),
        departmentName: String(departmentName),
        shiftType: shift.shiftType || shift.shift_type || 'MORNING',
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
        notes: shift.notes || '',
    });
    setSearchStaff('');
    setIsModalOpen(true);
};

const closeModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
    setForm(emptyForm());
    setSearchStaff('');
};

const fetchData = async () => {
    try {
    setLoading(true);
    const [shiftRes, staffRes, deptRes] = await Promise.all([
        api.get('/tasks/schedules'),
        api.get('/cmd/staff'),
        api.get('/cmd/departments'),
    ]);
    setShifts(shiftRes.data.data || shiftRes.data || []);
    setStaffList(staffRes.data.data || staffRes.data || []);
    setDepartments(deptRes.data.data || deptRes.data || []);
    } catch (err) {
    toast.error(err.message || 'Failed to fetch schedules data.');
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    let active = true;
    Promise.all([
    api.get('/tasks/schedules'),
    api.get('/cmd/staff'),
    api.get('/cmd/departments'),
    ]).then(([shiftRes, staffRes, deptRes]) => {
    if (!active) return;
    setShifts(shiftRes.data.data || shiftRes.data || []);
    setStaffList(staffRes.data.data || staffRes.data || []);
    setDepartments(deptRes.data.data || deptRes.data || []);
    }).catch((err) => {
    if (active) toast.error(err.message || 'Failed to fetch schedules data.');
    }).finally(() => {
    if (active) setLoading(false);
    });
    return () => { active = false; };
}, []);

const handleScheduleShift = async (e) => {
    e.preventDefault();
    if (!form.userId) {
    toast.error('Please select a staff member.');
    return;
    }
    if (!form.departmentName || !form.startDate || !form.startTime || !form.endDate || !form.endTime || !form.notes.trim()) {
    toast.error('Complete all required fields, including shift notes.');
    return;
    }
    const selectedStaff = visibleStaff.find((staff) => String(staff.id || staff.user_id) === String(form.userId));
    if (!selectedStaff) {
        toast.error(departmentScoped ? 'Select a staff member from your department.' : 'Select a valid staff member.');
        return;
    }
    const selectedStaffName = selectedStaff.fullName || selectedStaff.full_name;
    if (!selectedStaffName) {
        toast.error('The selected staff member has no name to send to the schedule service.');
        return;
    }
    if (form.startDate < todayDate || form.endDate < todayDate) {
        toast.error('Shifts can only be scheduled for today or a future date.');
        return;
    }
    const startDateTime = new Date(`${form.startDate}T${form.startTime}`);
    const endDateTime = new Date(`${form.endDate}T${form.endTime}`);
    if (startDateTime <= new Date()) {
        toast.error('Shift start time must be in the future.');
        return;
    }
    if (endDateTime <= startDateTime) {
    toast.error('End time must be after the start time.');
    return;
    }
    setSubmitting(true);
    try {
    const payload = {
        userNames: [selectedStaffName],
        departmentName: departmentScoped ? departmentScope.name : form.departmentName,
        shiftType: form.shiftType,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: form.notes.trim(),
    };
    if (editingShift) {
        await api.patch(`/tasks/schedules/${encodeURIComponent(editingShift.id)}`, payload);
    } else {
        await api.post('/tasks/schedules', payload);
    }
    requestNotificationsRefresh();
    toast.success(editingShift ? 'Staff shift successfully updated.' : 'Staff shift successfully scheduled.');
    closeModal();
    await fetchData();
    } catch (err) {
    toast.error(err.message || 'Failed to schedule shift.');
    } finally {
    setSubmitting(false);
    }
};

const filteredStaff = visibleStaff.filter((s) =>
    (s.fullName || s.full_name)?.toLowerCase().includes(searchStaff.toLowerCase())
);

return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
        <div>
        <h3 className="text-base font-bold text-slate-900">Weekly Duty Roster & Shifts</h3>
        <p className="text-xs text-slate-500 mt-1">Manage hospital staff shift rotations and operational assignments[cite: 13].</p>
        </div>
        <Button onClick={openCreateModal} disabled={departmentScoped && !departmentScope.name}>
        <Plus size={16} />
        <span>Schedule Shift</span>
        </Button>
    </div>

    {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading duty roster...</div>
    ) : (
        <ShiftCalendar shifts={visibleShifts} onOpenScheduleModal={openCreateModal} onEditShift={openEditModal} />
    )}

    {/* Schedule Shift Modal */}
    <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingShift ? 'Edit Staff Shift' : 'Schedule Staff Shift'}
        description={editingShift ? 'Update the assigned staff member, department, and shift hours.' : 'Assign duty rosters and shift hours to hospital personnel.'}
    >
        <form onSubmit={handleScheduleShift} className="space-y-4">
        {/* Staff Search Input */}
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Select Staff Member</label>
            <SearchInput
            value={searchStaff}
            onChange={(e) => setSearchStaff(e.target.value)}
            placeholder="Search staff name..."
            onClear={() => setSearchStaff('')}
            />
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 mt-1 bg-white">
            {filteredStaff.length === 0 ? (
                <p className="p-3 text-xs text-slate-400 text-center">No staff found.</p>
            ) : (
                filteredStaff.map((s) => {
                const sId = s.id || s.user_id;
                const isSelected = String(form.userId) === String(sId);
                return (
                    <div
                    key={sId}
                    onClick={() => setForm({ ...form, userId: sId })}
                    className={`p-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-(--primary-color)/10 text-(--primary-color) font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                    >
                    <span>{s.fullName || s.full_name} ({s.role})</span>
                    {isSelected && <span className="text-[10px] font-bold">Selected</span>}
                    </div>
                );
                })
            )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departmentScoped ? (
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Department</label>
                    <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">{departmentScope.name || 'Department not set'}</p>
                </div>
            ) : (
                <SelectDropdown
                    label="Department"
                    value={form.departmentName}
                    onChange={(departmentName) => setForm((current) => ({ ...current, departmentName }))}
                    placeholder="Select Department..."
                    required
                    options={departments.map((department) => {
                        const name = department.name || department.departmentName || department.department_name;
                        return { value: name, label: name };
                    }).filter((department) => department.value)}
                />
            )}
            <SelectDropdown
            label="Shift Type"
            value={form.shiftType}
            onChange={(shiftType) => setForm((current) => ({ ...current, shiftType }))}
            options={[
                { value: 'MORNING', label: 'Morning' },
                { value: 'AFTERNOON', label: 'Afternoon' },
                { value: 'NIGHT', label: 'Night' },
                { value: 'ON_CALL', label: 'On call' },
            ]}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePicker
            label="Start date & time"
            dateValue={form.startDate}
            timeValue={form.startTime}
            minDate={todayDate}
            onDateChange={(startDate) => setForm((current) => ({ ...current, startDate, endDate: current.endDate && current.endDate < startDate ? '' : current.endDate }))}
            onTimeChange={(startTime) => setForm((current) => ({ ...current, startTime }))}
            required
            />
            <DateTimePicker
            label="End date & time"
            dateValue={form.endDate}
            timeValue={form.endTime}
            minDate={form.startDate && form.startDate > todayDate ? form.startDate : todayDate}
            onDateChange={(endDate) => setForm((current) => ({ ...current, endDate }))}
            onTimeChange={(endTime) => setForm((current) => ({ ...current, endTime }))}
            required
            />
        </div>

        <TextAreaInput
            label="Shift Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            placeholder="Enter shift instructions..."
            required
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>{editingShift ? 'Update Shift' : 'Schedule Shift'}</Button>
        </div>
        </form>
    </Modal>
    </div>
);
};
