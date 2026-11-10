'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { DateTimePicker } from '@/components/ui/atoms/DateTimePicker';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { toast } from 'sonner';

export const ScheduleAppointmentModal = ({ patientId, isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        scheduledDate: '',
        scheduledTime: '',
        reason: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [pendingConfirmation, setPendingConfirmation] = useState(null);

    // Robustly extract department ID whether it's a string, snake_case, or an object
    const getDoctorDepartmentId = () => {
        if (!user) return null;
        if (typeof user.department === 'object' && user.department !== null) {
            return user.department.id || user.department._id || user.department.departmentId;
        }
        return user.departmentId || user.department_id || user.department;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const departmentId = getDoctorDepartmentId();
        const scheduledAt = form.scheduledDate && form.scheduledTime
            ? new Date(`${form.scheduledDate}T${form.scheduledTime}`)
            : null;

        if (!departmentId) {
            toast.error('Doctor department ID not found in session context.');
            return;
        }
        if (!patientId) {
            toast.error('Select a patient before booking an appointment.');
            return;
        }
        if (!scheduledAt || Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
            toast.error('Choose a future date and time for the appointment.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                patientId,
                departmentId,
                doctorId: user?.id || user?._id || null,
                scheduledAt: scheduledAt.toISOString(),
                type: 'CONSULTATION',
                reason: form.reason,
                notes: form.notes || null,
            };

            let appointmentId = pendingConfirmation?.patientId === String(patientId) ? pendingConfirmation.id : null;
            if (!appointmentId) {
                const response = await api.post('/appointments', payload);
                const appointment = response?.data?.data?.appointment
                    ?? response?.data?.appointment
                    ?? response?.data?.data
                    ?? response?.data
                    ?? response;
                appointmentId = appointment?.id || appointment?._id || appointment?.appointmentId || appointment?.appointment_id;
            }

            if (appointmentId) {
                setPendingConfirmation({ id: appointmentId, patientId: String(patientId) });
                try {
                    await api.patch(`/appointments/${encodeURIComponent(appointmentId)}/status`, { status: 'CONFIRMED' });
                } catch (confirmationError) {
                    toast.error(confirmationError?.message || 'Appointment was created but could not be confirmed into the queue.');
                    return;
                }
                setPendingConfirmation(null);
                toast.success('Appointment confirmed and added to the patient queue.');
            } else {
                toast.success('Appointment scheduled. The server did not return an appointment ID to confirm queue placement.');
            }
            setForm({ scheduledDate: '', scheduledTime: '', reason: '', notes: '' });
            await onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to schedule appointment.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Schedule Follow-Up Appointment"
            description="Book next OPD visit or specialist review session."
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <DateTimePicker
                    label="Scheduled Date & Time"
                    dateValue={form.scheduledDate}
                    timeValue={form.scheduledTime}
                    onDateChange={(scheduledDate) => setForm((current) => ({ ...current, scheduledDate }))}
                    onTimeChange={(scheduledTime) => setForm((current) => ({ ...current, scheduledTime }))}
                    disallowPast
                    required
                />

                <TextInput
                    label="Reason for Visit"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="e.g., Post-treatment review"
                    required
                />

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">Clinical Notes</label>
                    <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Additional instructions..."
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-(--primary-color) transition-all"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Schedule Appointment</Button>
                </div>
            </form>
        </Modal>
    );
};
