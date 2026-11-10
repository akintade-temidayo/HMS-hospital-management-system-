'use client';

import React, { useState } from 'react';
import { encounterService } from '../../../services/encounter.service';
import { NumberInput } from '../atoms/NumberInput';
import { Button } from '../atoms/Button';
import { Activity, ShieldCheck } from 'lucide-react';

export const VitalsInputForm = ({ encounterId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vitals, setVitals] = useState({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    temperature: '',
    pulse_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await encounterService.logVitals(encounterId, {
        blood_pressure_systolic: Number(vitals.blood_pressure_systolic),
        blood_pressure_diastolic: Number(vitals.blood_pressure_diastolic),
        temperature: Number(vitals.temperature),
        pulse_rate: Number(vitals.pulse_rate),
        respiratory_rate: Number(vitals.respiratory_rate),
        oxygen_saturation: Number(vitals.oxygen_saturation),
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to log patient vitals.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
          <Activity size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Log Patient Vitals</h3>
          <p className="text-xs text-slate-500">Record vitals and check against threshold alert rules</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <ShieldCheck size={16} className="text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput label="BP Systolic (mmHg)" value={vitals.blood_pressure_systolic} onChange={(e) => setVitals({ ...vitals, blood_pressure_systolic: e.target.value })} required />
          <NumberInput label="BP Diastolic (mmHg)" value={vitals.blood_pressure_diastolic} onChange={(e) => setVitals({ ...vitals, blood_pressure_diastolic: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumberInput label="Temperature (°C)" value={vitals.temperature} onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })} required />
          <NumberInput label="Pulse Rate (bpm)" value={vitals.pulse_rate} onChange={(e) => setVitals({ ...vitals, pulse_rate: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumberInput label="Respiratory Rate" value={vitals.respiratory_rate} onChange={(e) => setVitals({ ...vitals, respiratory_rate: e.target.value })} required />
          <NumberInput label="Oxygen Saturation (%)" value={vitals.oxygen_saturation} onChange={(e) => setVitals({ ...vitals, oxygen_saturation: e.target.value })} required />
        </div>

        <Button type="submit" isLoading={loading} className="w-full py-3 mt-2">
          Save Vitals Record
        </Button>
      </form>
    </div>
  );
};