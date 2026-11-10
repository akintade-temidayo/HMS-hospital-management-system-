'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { NumberInput } from '@/components/ui/atoms/NumberInput';
import { DatePicker } from '@/components/ui/atoms/DatePicker';
import { api } from '@/services/api';
import { patientService } from '@/services/patient.service';
import { formatPatientName, getPatientFolderNumber, getPatientList, getPatientRecordId } from '@/utils/patientUtils';
import { toast } from 'sonner';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/utils/billingUtils';

export const CreateInvoiceModal = ({ isOpen, onClose, onSuccess }) => {
    const [patientQuery, setPatientQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientResults, setPatientResults] = useState([]);
    const [searchingPatients, setSearchingPatients] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: '' }]);
    const [submitting, setSubmitting] = useState(false);

    const searchForPatients = async (event) => {
        event.preventDefault();
        const query = patientQuery.trim();
        if (query.length < 2) {
            toast.error('Enter at least 2 characters to search patients.');
            return;
        }
        try {
            setSearchingPatients(true);
            const response = await patientService.searchPatients(query, 10);
            setPatientResults(getPatientList(response));
        } catch (error) {
            setPatientResults([]);
            toast.error(error.message || 'Unable to search patients.');
        } finally {
            setSearchingPatients(false);
        }
    };

    const clearPatient = () => {
        setSelectedPatient(null);
        setPatientQuery('');
        setPatientResults([]);
    };

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: '' }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const calculatedTotal = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice) || 0;
        return sum + qty * price;
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const patientId = getPatientRecordId(selectedPatient);
        if (!patientId) {
            toast.error('Search for and select a registered patient first.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                patientId,
                ...(dueDate ? { dueDate } : {}),
                items: items.map(it => ({
                    description: it.description,
                    quantity: Number(it.quantity) || 1,
                    unitPrice: Number(it.unitPrice) || 0,
                })),
            };

            await api.post('/billings/invoices', payload);
            toast.success('Patient invoice successfully created.');
            setItems([{ description: '', quantity: 1, unitPrice: '' }]);
            clearPatient();
            setDueDate('');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to create invoice.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Patient Invoice"
            description="Add billable services and generate an invoice."
            maxWidth="max-w-xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                        <div className="flex items-end gap-2">
                            <TextInput
                                label="Find Patient"
                                value={patientQuery}
                                onChange={(event) => {
                                    setPatientQuery(event.target.value);
                                    setSelectedPatient(null);
                                    setPatientResults([]);
                                }}
                                placeholder="Search by name, patient ID, or phone"
                            />
                            <Button type="button" variant="outline" isLoading={searchingPatients} onClick={searchForPatients} aria-label="Search patients">
                                <Search size={16} />
                            </Button>
                        </div>
                        {patientResults.length > 0 && (
                            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                                {patientResults.map((patient, index) => {
                                    const id = getPatientRecordId(patient);
                                    return (
                                        <button
                                            key={id || index}
                                            type="button"
                                            disabled={!id}
                                            onClick={() => {
                                                setSelectedPatient(patient);
                                                setPatientQuery('');
                                                setPatientResults([]);
                                            }}
                                            className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            <span className="text-sm font-semibold text-slate-800">{formatPatientName(patient)}</span>
                                            <span className="shrink-0 text-xs text-slate-500">{getPatientFolderNumber(patient)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {selectedPatient && (
                            <div className="flex items-center gap-2">
                                <TextInput label="Selected Patient" value={formatPatientName(selectedPatient)} disabled />
                                <button type="button" onClick={clearPatient} aria-label="Clear selected patient" className="mb-0.5 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                    <DatePicker
                        label="Due Date (Optional)"
                        value={dueDate}
                        onChange={setDueDate}
                        placeholder="Select due date"
                    />
                </div>

                {/* Dynamic Line Items */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">Invoice Line Items</label>
                        <button type="button" onClick={handleAddItem} className="text-xs font-bold text-(--primary-color) flex items-center gap-1 hover:underline">
                            <Plus size={14} /> Add Item
                        </button>
                    </div>

                    {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <TextInput
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                placeholder="Description (e.g. Consultation)"
                                required
                            />
                            <div className="w-20 shrink-0">
                                <NumberInput
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    placeholder="Qty"
                                    min="1"
                                    required
                                />
                            </div>
                            <input
                                type="number"
                                min="0"
                                placeholder="Unit Price (₦)"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                className="w-28 rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono text-slate-900 placeholder:text-slate-500 outline-none focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)"
                                required
                            />
                            {items.length > 1 && (
                                <button type="button" onClick={() => handleRemoveItem(index)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
                    <span className="text-xs font-bold text-slate-600 uppercase">Grand Total:</span>
                    <span className="font-mono text-base font-extrabold text-slate-900">{formatCurrency(calculatedTotal)}</span>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Generate Invoice</Button>
                </div>
            </form>
        </Modal>
    );
};
