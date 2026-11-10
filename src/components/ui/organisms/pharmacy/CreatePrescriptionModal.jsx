'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { inventoryService } from '@/services/inventory.service';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const createEmptyItem = () => ({
    inventoryItemName: '',
    dosage: '',
    frequency: '',
    durationDays: '',
    quantityPrescribed: '',
});

const getCreatedPrescriptionId = (response) => {
    const result = response?.data?.data ?? response?.data ?? response;
    const prescription = result?.prescription || result?.data?.prescription || result;
    return prescription?.prescriptionId
        || prescription?.prescription_id
        || prescription?.id
        || prescription?._id
        || '';
};

export const CreatePrescriptionModal = ({ isOpen, onClose, onSuccess }) => {
    const [patientName, setPatientName] = useState('');
    const [items, setItems] = useState([createEmptyItem()]);
    const [submitting, setSubmitting] = useState(false);

    const updateItem = (index, field, value) => {
        setItems((current) => current.map((item, itemIndex) => (
            itemIndex === index ? { ...item, [field]: value } : item
        )));
    };

    const addItem = () => setItems((current) => [...current, createEmptyItem()]);

    const removeItem = (index) => {
        setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
    };

    const closeModal = () => {
        setPatientName('');
        setItems([createEmptyItem()]);
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = {
            patientName: patientName.trim(),
            items: items.map((item) => ({
                inventoryItemName: item.inventoryItemName.trim(),
                dosage: item.dosage.trim(),
                frequency: item.frequency.trim(),
                durationDays: Number(item.durationDays),
                quantityPrescribed: Number(item.quantityPrescribed),
            })),
        };

        try {
            setSubmitting(true);
            const response = await inventoryService.issuePrescription(payload);
            const prescriptionId = getCreatedPrescriptionId(response);
            toast.success(
                prescriptionId
                    ? `Prescription created. ID: ${prescriptionId}`
                    : 'Prescription created successfully.',
            );
            onSuccess?.();
            closeModal();
        } catch (error) {
            toast.error(error?.message || 'Failed to create prescription.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            title="Create Prescription"
            description="Enter the patient’s name and one or more medication items."
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                    label="Patient Name"
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    placeholder="Enter the patient’s full name"
                    required
                />

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <section key={index} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase text-slate-700">Medication {index + 1}</h3>
                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        aria-label={`Remove medication ${index + 1}`}
                                        onClick={() => removeItem(index)}
                                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <TextInput
                                label="Inventory Item Name"
                                value={item.inventoryItemName}
                                onChange={(event) => updateItem(index, 'inventoryItemName', event.target.value)}
                                placeholder="e.g., Amoxicillin 500mg"
                                required
                            />
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <TextInput
                                    label="Dosage"
                                    value={item.dosage}
                                    onChange={(event) => updateItem(index, 'dosage', event.target.value)}
                                    placeholder="e.g., 500mg"
                                    required
                                />
                                <TextInput
                                    label="Frequency"
                                    value={item.frequency}
                                    onChange={(event) => updateItem(index, 'frequency', event.target.value)}
                                    placeholder="e.g., 8-hourly"
                                    required
                                />
                                <TextInput
                                    type="number"
                                    min="1"
                                    step="1"
                                    label="Duration (Days)"
                                    value={item.durationDays}
                                    onChange={(event) => updateItem(index, 'durationDays', event.target.value)}
                                    placeholder="5"
                                    required
                                />
                                <TextInput
                                    type="number"
                                    min="1"
                                    step="1"
                                    label="Quantity Prescribed"
                                    value={item.quantityPrescribed}
                                    onChange={(event) => updateItem(index, 'quantityPrescribed', event.target.value)}
                                    placeholder="15"
                                    required
                                />
                            </div>
                        </section>
                    ))}
                </div>

                <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-3 sm:flex-row">
                    <Button type="button" variant="outline" onClick={addItem}>
                        <Plus size={16} />
                        <span>Add Medication</span>
                    </Button>
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" isLoading={submitting}>Create Prescription</Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};
