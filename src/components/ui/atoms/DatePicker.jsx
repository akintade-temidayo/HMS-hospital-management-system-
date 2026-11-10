'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const toDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const sameDay = (first, second) => first && second
  && first.getFullYear() === second.getFullYear()
  && first.getMonth() === second.getMonth()
  && first.getDate() === second.getDate();

export const DatePicker = ({
  label,
  value,
  onChange,
  minDate,
  required = false,
  placeholder = 'Select a date',
  error,
}) => {
  const triggerRef = useRef(null);
  const calendarRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [position, setPosition] = useState(null);
  const today = useMemo(() => startOfDay(new Date()), []);
  const requestedMinDate = parseDateValue(minDate);
  const earliestDate = requestedMinDate && requestedMinDate > today ? requestedMinDate : today;
  const selectedDate = parseDateValue(value);
  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const firstCalendarDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1 - visibleMonth.getDay());
  const calendarDays = Array.from({ length: 42 }, (_, index) => (
    new Date(firstCalendarDay.getFullYear(), firstCalendarDay.getMonth(), firstCalendarDay.getDate() + index)
  ));
  const minimumMonth = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
  const canGoToPreviousMonth = visibleMonth > minimumMonth;

  const openCalendar = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const popupWidth = 320;
    const popupHeight = 360;
    const top = rect.bottom + popupHeight <= window.innerHeight
      ? rect.bottom + 8
      : Math.max(8, rect.top - popupHeight - 8);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - popupWidth - 8));
    const selectedMonth = selectedDate && selectedDate >= earliestDate ? selectedDate : earliestDate;
    setVisibleMonth(startOfMonth(selectedMonth));
    setPosition({ top, left });
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!triggerRef.current?.contains(event.target) && !calendarRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const closeCalendar = () => setIsOpen(false);
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('resize', closeCalendar);
    window.addEventListener('scroll', closeCalendar, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('resize', closeCalendar);
      window.removeEventListener('scroll', closeCalendar, true);
    };
  }, [isOpen]);

  const selectDate = (date) => {
    onChange(toDateValue(date));
    setIsOpen(false);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={openCalendar}
        className={`flex w-full items-center justify-between rounded-lg border bg-slate-50 px-3.5 py-2.5 text-left text-sm outline-none transition-all hover:border-slate-300 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-(--primary-color) ${error ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200'}`}
      >
        <span className={selectedDate ? 'font-medium text-slate-900' : 'text-slate-400'}>
          {selectedDate ? selectedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : placeholder}
        </span>
        <CalendarDays size={17} className="text-slate-500" />
      </button>
      {error && <span className="text-xs font-medium text-rose-500">{error}</span>}

      {isOpen && position && typeof document !== 'undefined' && createPortal(
        <div
          ref={calendarRef}
          role="dialog"
          aria-label={`${label || 'Date'} calendar`}
          style={{ top: position.top, left: position.left, width: 320 }}
          className="fixed z-100 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canGoToPreviousMonth}
              onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-sm font-bold text-slate-900">{monthLabel}</h3>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <span key={day} className="py-2 text-[11px] font-semibold text-slate-400">{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {calendarDays.map((date) => {
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isDisabled = !isCurrentMonth || date < earliestDate;
              const isSelected = sameDay(date, selectedDate);
              const isToday = sameDay(date, today);
              return (
                <button
                  key={toDateValue(date)}
                  type="button"
                  disabled={isDisabled}
                  aria-label={date.toLocaleDateString()}
                  aria-pressed={Boolean(isSelected)}
                  onClick={() => selectDate(date)}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-xs transition-colors ${
                    isSelected ? 'bg-(--primary-color) font-bold text-white'
                      : isDisabled ? 'cursor-not-allowed text-slate-300'
                        : 'text-slate-700 hover:bg-slate-100'
                  } ${isToday && !isSelected ? 'ring-1 ring-(--primary-color)' : ''}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
