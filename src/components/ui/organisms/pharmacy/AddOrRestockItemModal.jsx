'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { SelectDropdown } from '@/components/ui/atoms/SelectDropdown';
import { DatePicker } from '@/components/ui/atoms/DatePicker';
import { inventoryService } from '@/services/inventory.service';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
    { value: 'Antibiotics', label: 'Antibiotics & Antimicrobials' },
    { value: 'Analgesics', label: 'Analgesics & Pain Relief' },
    { value: 'Antimalarials', label: 'Antimalarials' },
    { value: 'Cardiovascular', label: 'Cardiovascular & Blood Pressure' },
    { value: 'Supplements', label: 'Vitamins & Supplements' },
    { value: 'Injectables', label: 'Injectables & IV Fluids' },
    { value: 'General', label: 'General Meds & Consumables' },
];

export const AddOrRestockItemModal = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        name: '',
        category: 'General',
        quantity: '',
        unitPrice: '',
        expiryDate: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [expiryDateError, setExpiryDateError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.expiryDate) {
            setExpiryDateError('Select an expiry date.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                itemName: form.name.trim(),
                category: form.category,
                stockQuantity: Number(form.quantity) || 0,
                unitPrice: Number(form.unitPrice) || 0,
                expiryDate: form.expiryDate,
            };

            await inventoryService.createItem(payload);
            toast.success('Medication successfully added to inventory.');
            setForm({ name: '', category: 'General', quantity: '', unitPrice: '', expiryDate: '' });
            setExpiryDateError('');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to save medication inventory.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Medication"
            description="Add a new medication and its starting stock to the pharmacy inventory."
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                    label="Medication Name & Strength"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Artemether-Lumefantrine 80/480mg"
                    required
                />

                <SelectDropdown
                    label="Category"
                    value={form.category}
                    onChange={(val) => setForm({ ...form, category: val })}
                    options={CATEGORY_OPTIONS}
                    required
                />

                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        type="number"
                        min="1"
                        label="Quantity in Stock"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        placeholder="0"
                        required
                    />
                    <TextInput
                        type="number"
                        min="0"
                        step="0.01"
                        label="Unit Price (₦)"
                        value={form.unitPrice}
                        onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                        placeholder="0.00"
                        required
                    />
                </div>

                <DatePicker
                    label="Expiry Date"
                    value={form.expiryDate}
                    onChange={(value) => {
                        setForm({ ...form, expiryDate: value });
                        setExpiryDateError('');
                    }}
                    required
                    error={expiryDateError}
                />

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Save Medication</Button>
                </div>
            </form>
        </Modal>
    );
};