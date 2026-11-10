'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { TextAreaInput } from '@/components/ui/atoms/TextAreaInput';
import { SelectDropdown } from '@/components/ui/atoms/SelectDropdown';
import { DateTimePicker } from '@/components/ui/atoms/DateTimePicker';
import { SearchInput } from '@/components/ui/atoms/SearchInput';
import { Users, Building2 } from 'lucide-react';
import { priorityOptions } from '@/utils/taskUtils';

export const CreateTaskModal = ({ isOpen, onClose, staffList, departments, onSubmit, submitting, departmentScoped = false, scopedDepartmentName = '' }) => {
    const [assignmentType, setAssignmentType] = useState('STAFF'); // 'STAFF' or 'DEPARTMENT'
    const [searchStaff, setSearchStaff] = useState('');
    const [selectedStaffIds, setSelectedStaffIds] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        departmentName: '',
        dueDate: '',
        dueTime: '17:00',
    });

    const toggleStaffSelection = (sId) => {
        if (selectedStaffIds.includes(sId)) {
            setSelectedStaffIds(selectedStaffIds.filter((id) => id !== sId));
        } else {
            setSelectedStaffIds([...selectedStaffIds, sId]);
        }
    };

    const filteredStaff = staffList.filter((s) =>
        (s.fullName || s.full_name)?.toLowerCase().includes(searchStaff.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            assignmentType,
            selectedStaffIds,
        }, {
            resetForm: () => {
                setForm({ title: '', description: '', priority: 'MEDIUM', departmentName: '', dueDate: '', dueTime: '17:00' });
                setSelectedStaffIds([]);
            }
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create & Assign Task"
            description="Assign duties to individual staff members or entire departments."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                    label="Task Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Conduct weekly pharmacy audit"
                    required
                />

                <TextAreaInput
                    label="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Detailed task instructions..."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectDropdown
                        label="Priority Level"
                        value={form.priority}
                        onChange={(priority) => setForm((current) => ({ ...current, priority }))}
                        options={priorityOptions}
                    />
                    <DateTimePicker
                        label="Due date & time"
                        dateValue={form.dueDate}
                        timeValue={form.dueTime}
                        onDateChange={(dueDate) => setForm((current) => ({ ...current, dueDate }))}
                        onTimeChange={(dueTime) => setForm((current) => ({ ...current, dueTime }))}
                        required
                    />
                </div>

                {/* Assignment Type Toggle */}
                {!departmentScoped && <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700">Assign Target Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setAssignmentType('STAFF')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                assignmentType === 'STAFF' ? 'border-(--primary-color)] bg-(--primary-color)/10 text-(--primary-color)' : 'border-slate-200 bg-white text-slate-600'
                            }`}
                        >
                            <Users size={16} />
                            <span>Staff Members</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setAssignmentType('DEPARTMENT')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                assignmentType === 'DEPARTMENT' ? 'border-(--primary-color) bg-(--primary-color)/10 text-(--primary-color)' : 'border-slate-200 bg-white text-slate-600'
                            }`}
                        >
                            <Building2 size={16} />
                            <span>Department</span>
                        </button>
                    </div>
                </div>}

                {departmentScoped && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Department</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{scopedDepartmentName || 'Department not set'}</p>
                    </div>
                )}

                {/* Conditional Rendering based on Assignment Type */}
                {assignmentType === 'DEPARTMENT' ? (
                    <SelectDropdown
                        label="Select Department"
                        value={form.departmentName}
                        onChange={(departmentName) => setForm((current) => ({ ...current, departmentName }))}
                        placeholder="Choose department..."
                        required={assignmentType === 'DEPARTMENT'}
                        options={departments.map((department) => {
                            const name = department.name || department.departmentName || department.department_name;
                            return { value: name, label: name };
                        }).filter((department) => department.value)}
                    />
                ) : (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Search & Select Staff (Multiple)</label>
                        <SearchInput
                            value={searchStaff}
                            onChange={(e) => setSearchStaff(e.target.value)}
                            placeholder="Search staff names to assign..."
                            onClear={() => setSearchStaff('')}
                        />
                        {selectedStaffIds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {selectedStaffIds.map((id) => {
                                    const st = staffList.find((s) => (s.id || s.user_id) === id);
                                    return (
                                        <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-(--primary-color) text-white text-[10px] font-bold rounded-lg">
                                            <span>{st?.fullName || st?.full_name || id}</span>
                                            <button type="button" onClick={() => toggleStaffSelection(id)} className="hover:opacity-75">×</button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 mt-1 bg-white">
                            {filteredStaff.map((s) => {
                                const sId = s.id || s.user_id;
                                const isChecked = selectedStaffIds.includes(sId);
                                return (
                                    <div
                                        key={sId}
                                        onClick={() => toggleStaffSelection(sId)}
                                        className={`p-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                            isChecked ? 'bg-(--primary-color)]/10 text-(--primary-color) font-bold' : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        <span>{s.fullName || s.full_name} ({s.role})</span>
                                        <input type="checkbox" checked={isChecked} readOnly className="rounded border-slate-300" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Assign Task</Button>
                </div>
            </form>
        </Modal>
    );
};
