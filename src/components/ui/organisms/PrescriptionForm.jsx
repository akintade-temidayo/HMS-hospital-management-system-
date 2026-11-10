'use client';

import React, { useState } from 'react';
import { inventoryService } from '../../../services/inventory.service';
import { TextInput } from '../atoms/TextInput';
import { NumberInput } from '../atoms/NumberInput';
import { Button } from '../atoms/Button';
import { Pill, Plus, Trash2, ShieldCheck } from 'lucide-react';

export const PrescriptionForm = ({ encounterId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdPrescriptionId, setCreatedPrescriptionId] = useState('');
  const [prescriptionCreated, setPrescriptionCreated] = useState(false);
  
  // List of prescription items
  const [items, setItems] = useState([
    { inventory_item_name: '', dosage: '', frequency: '', duration_days: '', quantity_prescribed: '' }
  ]);

  const addItemRow = () => {
    setItems([...items, { inventory_item_name: '', dosage: '', frequency: '', duration_days: '', quantity_prescribed: '' }]);
  };

  const removeItemRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCreatedPrescriptionId('');
    setPrescriptionCreated(false);

    try {
      const payload = {
        encounterId,
        items: items.map(item => ({
          inventoryItemName: item.inventory_item_name.trim(),
          dosage: item.dosage,
          frequency: item.frequency,
          durationDays: Number(item.duration_days),
          quantityPrescribed: Number(item.quantity_prescribed),
        })),
      };

      const response = await inventoryService.issuePrescription(payload);
      const result = response?.data?.data ?? response?.data ?? response;
      const createdPrescription = result?.prescription || result?.data?.prescription || result;
      setCreatedPrescriptionId(
        createdPrescription?.prescriptionId
          || createdPrescription?.prescription_id
          || createdPrescription?.id
          || createdPrescription?._id
          || '',
      );
      setPrescriptionCreated(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to issue prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
          <Pill size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Issue Medication Prescription</h3>
          <p className="text-xs text-slate-500">Attach prescriptions and dosages to active encounter[cite: 13]</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <ShieldCheck size={16} className="text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      {prescriptionCreated && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          Prescription created by the API.
          {createdPrescriptionId && (
            <> Generated ID: <span className="font-mono font-bold">{createdPrescriptionId}</span></>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase">Medication Item #{index + 1}</span>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItemRow(index)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextInput
                label="Medication Name"
                value={item.inventory_item_name}
                onChange={(e) => updateItem(index, 'inventory_item_name', e.target.value)}
                placeholder="e.g., Amoxicillin 500mg"
                required 
              />
              <TextInput 
                label="Dosage" 
                value={item.dosage} 
                onChange={(e) => updateItem(index, 'dosage', e.target.value)} 
                placeholder="500mg" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TextInput 
                label="Frequency" 
                value={item.frequency} 
                onChange={(e) => updateItem(index, 'frequency', e.target.value)} 
                placeholder="8-hourly" 
                required 
              />
              <NumberInput 
                label="Duration (Days)" 
                value={item.duration_days} 
                onChange={(e) => updateItem(index, 'duration_days', e.target.value)} 
                required 
              />
              <NumberInput 
                label="Quantity Prescribed" 
                value={item.quantity_prescribed} 
                onChange={(e) => updateItem(index, 'quantity_prescribed', e.target.value)} 
                required 
              />
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-2">
          <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
            <Plus size={16} />
            <span>Add Another Medication</span>
          </Button>

          <Button type="submit" isLoading={loading} className="py-2.5 px-6">
            Submit Prescription
          </Button>
        </div>
      </form>
    </div>
  );
};