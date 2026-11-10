'use client';

import React, { useState } from 'react';
import { encounterService } from '../../../services/encounter.service';
import { TextAreaInput } from '../atoms/TextAreaInput';
import { TextInput } from '../atoms/TextInput';
import { Button } from '../atoms/Button';
import { FileText, ShieldCheck } from 'lucide-react';

export const SoapNotesForm = ({ encounterId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    icd10_codes: '',
    plan: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await encounterService.saveClinicalNotes(encounterId, {
        subjective: form.subjective,
        objective: form.objective,
        assessment: form.assessment,
        icd10_codes: form.icd10_codes ? form.icd10_codes.split(',').map((s) => s.trim()) : [],
        plan: form.plan,
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save clinical notes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
          <FileText size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Clinical SOAP Notes & ICD-10</h3>
          <p className="text-xs text-slate-500">Record subjective, objective, assessment, diagnostic codes, and plans</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <ShieldCheck size={16} className="text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextAreaInput label="Subjective" value={form.subjective} onChange={(e) => setForm({ ...form, subjective: e.target.value })} rows={3} required />
        <TextAreaInput label="Objective" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} rows={3} required />
        <TextAreaInput label="Assessment" value={form.assessment} onChange={(e) => setForm({ ...form, assessment: e.target.value })} rows={2} required />
        <TextInput label="ICD-10 Diagnostic Codes (comma separated)" value={form.icd10_codes} onChange={(e) => setForm({ ...form, icd10_codes: e.target.value })} placeholder="J03.90, R50.9" required />
        <TextAreaInput label="Treatment Plan" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} rows={3} required />

        <Button type="submit" isLoading={loading} className="w-full py-3 mt-2">
          Save Clinical Notes
        </Button>
      </form>
    </div>
  );
};