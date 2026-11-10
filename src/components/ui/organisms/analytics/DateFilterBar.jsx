'use client';

import React from 'react';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { Button } from '@/components/ui/atoms/Button';
import { Calendar, RotateCcw } from 'lucide-react';

export const DateFilterBar = ({ startDate, endDate, onStartDateChange, onEndDateChange, onApply, onReset }) => {
    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                />
                <TextInput
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onReset}>
                    <RotateCcw size={14} />
                    <span>Reset</span>
                </Button>
                <Button onClick={onApply}>
                    <Calendar size={14} />
                    <span>Apply Filters</span>
                </Button>
            </div>
        </div>
    );
};