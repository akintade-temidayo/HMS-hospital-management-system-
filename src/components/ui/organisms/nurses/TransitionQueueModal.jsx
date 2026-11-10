'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { SelectDropdown } from '@/components/ui/atoms/SelectDropdown';
import { api } from '@/services/api';
import { toast } from 'sonner';

export const TransitionQueueModal = ({ queueItem, isOpen, onClose, onSuccess }) => {
    const [departments, setDepartments] = useState([]);
    const [targetDepartmentId, setTargetDepartmentId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            api.get('/cmd/departments')
                .then((res) => {
                    const list = res?.data?.data ?? res?.data ?? [];
                    const activeDepts = (Array.isArray(list) ? list : list.departments || []).filter(d => d.isActive !== false);
                    setDepartments(activeDepts.map(d => ({ value: d.id || d._id, label: d.name })));
                })
                .catch(() => toast.error('Failed to load active departments.'));
        }
    }, [isOpen]);

    const handleTransition = async (e) => {
        e.preventDefault();
        if (!targetDepartmentId) {
            toast.error('Please select a destination department.');
            return;
        }

        try {
            setSubmitting(true);
            const queueId = queueItem.id || queueItem._id;
            await api.patch(`/encounters/${queueId}/transition-status`, { targetDepartmentId });
            toast.success('Patient successfully transitioned to the target department queue.');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to transition patient encounter.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!queueItem) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Transition Patient Queue"
            description="Transfer active patient encounter to another hospital department queue."
            maxWidth="max-w-md"
        >
            <form onSubmit={handleTransition} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Patient</p>
                    <p className="text-sm font-extrabold text-slate-900">
                        {queueItem.patient?.firstName || ''} {queueItem.patient?.lastName || ''}
                    </p>
                </div>

                <SelectDropdown
                    label="Destination Department"
                    value={targetDepartmentId}
                    onChange={setTargetDepartmentId}
                    options={departments}
                    placeholder="Select department..."
                    required
                />

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Confirm Transfer</Button>
                </div>
            </form>
        </Modal>
    );
};