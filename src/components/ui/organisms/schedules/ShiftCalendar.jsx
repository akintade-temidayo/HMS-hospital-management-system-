'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Modal } from '@/components/ui/atoms/Modal';
import { Clock, User, Plus, Pencil } from 'lucide-react';

export const ShiftCalendar = ({ shifts = [], onOpenScheduleModal, onEditShift }) => {
const [selectedDayShifts, setSelectedDayShifts] = useState(null);
const [selectedDateStr, setSelectedDateStr] = useState('');

const getDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const selectedDate = selectedDateStr ? new Date(`${selectedDateStr}T00:00:00`) : null;
const isSelectedDayPast = selectedDate
    ? selectedDate < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    : false;
const formatShiftTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Time unavailable' : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

// Generate current week dates (Monday to Sunday or next 7 days)
const getWeekDays = () => {
    const start = new Date();
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Start from Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
    }
    return days;
};

const weekDays = getWeekDays();

const getShiftBadgeVariant = (type) => {
    switch (type) {
    case 'MORNING': return 'info';
    case 'AFTERNOON': return 'warning';
    case 'NIGHT': return 'danger';
    default: return 'success';
    }
};

return (
    <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((dateObj, idx) => {
        const dateString = getDateKey(dateObj);
        const dayShifts = shifts.filter((shift) => {
            const startTime = shift.startTime || shift.start_time || shift.date;
            const parsed = new Date(startTime);
            return !Number.isNaN(parsed.getTime()) && getDateKey(parsed) === dateString;
        });
        const isToday = getDateKey(new Date()) === dateString;

        return (
            <div
            key={idx}
            onClick={() => { setSelectedDayShifts(dayShifts); setSelectedDateStr(getDateKey(dateObj)); }}
            className={`bg-white border rounded-2xl p-4 flex flex-col justify-between min-h-45 cursor-pointer transition-all hover:border-(--primary-color) hover:shadow-md ${
                isToday ? 'border-(--primary-color) ring-1 ring-(--primary-color)/20 shadow-sm' : 'border-slate-200/80'
            }`}
            >
            <div>
                <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${isToday ? 'bg-(--primary-color) text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {dateObj.getDate()}
                </span>
                </div>
                <div className="space-y-1.5 mt-3">
                {dayShifts.slice(0, 3).map((s, i) => (
                    <div key={i} className="text-[11px] bg-slate-50 border border-slate-100 rounded-lg p-1.5 truncate">
                    <p className="font-bold text-slate-800 truncate">{s.userName || s.staffName || 'Staff Member'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{s.shiftType}</p>
                    </div>
                ))}
                {dayShifts.length > 3 && (
                    <p className="text-[10px] font-semibold text-slate-400 text-center">+ {dayShifts.length - 3} more</p>
                )}
                {dayShifts.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic text-center py-6">No shifts scheduled</p>
                )}
                </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[10px] font-bold text-(--primary-color) text-right">
                {dayShifts.length} Assigned →
            </div>
            </div>
        );
        })}
    </div>

    {/* Day Details Modal */}
    <Modal
        isOpen={!!selectedDayShifts}
        onClose={() => setSelectedDayShifts(null)}
        title={`Duty Roster: ${selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''}`}
        description="Review all personnel scheduled for this date."
    >
        <div className="space-y-4">
        {!isSelectedDayPast && <div className="flex justify-end">
            <Button size="sm" onClick={() => { setSelectedDayShifts(null); onOpenScheduleModal(); }}>
            <Plus size={14} />
            <span>Schedule New Shift</span>
            </Button>
        </div>}

        {selectedDayShifts?.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No shifts scheduled for this day.</p>
        ) : (
            <div className="space-y-2">
            {selectedDayShifts?.map((s, idx) => (
                <div key={s.id || s._id || s.scheduleId || idx} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between gap-3 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                    <User size={16} />
                    </div>
                    <div>
                    <p className="text-xs font-bold text-slate-900">{s.userName || s.staffName || 'Staff Member'}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {formatShiftTime(s.startTime || s.start_time)} – {formatShiftTime(s.endTime || s.end_time)}
                    </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={getShiftBadgeVariant(s.shiftType || s.shift_type)}>
                        {(s.shiftType || s.shift_type || '').replace('_', ' ')}
                    </Badge>
                    {onEditShift && (
                        <Button type="button" size="sm" variant="outline" onClick={() => { setSelectedDayShifts(null); onEditShift(s); }}>
                            <Pencil size={14} />
                            <span>Edit</span>
                        </Button>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    </Modal>
    </div>
);
};
