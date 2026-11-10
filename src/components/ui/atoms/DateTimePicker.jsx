'use client';

import React from 'react';
import { DatePicker } from '@/components/ui/atoms/DatePicker';
import { TimePicker } from '@/components/ui/atoms/TimePicker';

const toLocalDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNextAvailableTime = () => {
  const nextMinute = new Date();
  nextMinute.setMinutes(nextMinute.getMinutes() + 1, 0, 0);
  return `${String(nextMinute.getHours()).padStart(2, '0')}:${String(nextMinute.getMinutes()).padStart(2, '0')}`;
};

export const DateTimePicker = ({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  minDate,
  disallowPast = false,
  required = false,
  error,
}) => (
  <div className="flex w-full flex-col gap-1.5">
    {label && (
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(7rem,0.68fr)] gap-2">
      <DatePicker
        value={dateValue}
        onChange={onDateChange}
        minDate={disallowPast ? (minDate || toLocalDateValue(new Date())) : minDate}
        placeholder="Select date"
      />
      <TimePicker
        value={timeValue}
        onChange={onTimeChange}
        required={required}
        min={disallowPast && dateValue === toLocalDateValue(new Date()) ? getNextAvailableTime() : undefined}
      />
    </div>
    {error && <span className="text-xs font-medium text-rose-500">{error}</span>}
  </div>
);
