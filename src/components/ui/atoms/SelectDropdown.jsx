'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const SelectDropdown = ({ label, options = [], value, onChange, placeholder = 'Select option...', required = false, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState({ side: 'bottom', maxHeight: 320 });
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const updateMenuPlacement = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const bounds = trigger.getBoundingClientRect();
    const gap = 12;
    const maxMenuHeight = 320;
    const desiredHeight = Math.min(options.length * 42 + 8, maxMenuHeight);
    const spaceBelow = Math.max(0, window.innerHeight - bounds.bottom - gap);
    const spaceAbove = Math.max(0, bounds.top - gap);
    const side = spaceBelow < desiredHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';
    const availableSpace = side === 'top' ? spaceAbove : spaceBelow;

    setMenuPlacement({
      side,
      maxHeight: Math.max(80, Math.min(maxMenuHeight, availableSpace)),
    });
  }, [options.length]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleViewportChange = () => updateMenuPlacement();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, updateMenuPlacement]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative flex flex-col gap-1.5 w-full" ref={dropdownRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          if (!isOpen) updateMenuPlacement();
          setIsOpen((open) => !open);
        }}
        className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg transition-all outline-none flex items-center justify-between text-left
          focus:bg-white focus:ring-2 focus:ring-(--primary-color) focus:border-transparent
          ${error ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'}`}
      >
        <span className={selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-150 ${menuPlacement.side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}
          style={{ maxHeight: `${menuPlacement.maxHeight}px` }}
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 text-center">No options available</div>
          ) : (
            options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className="group px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span className={`font-medium ${isSelected ? 'text-(--primary-color)' : 'group-hover:text-slate-900'}`}>
                    {opt.label}
                  </span>
                  {/* Checkmark appears on hover or when selected */}
                  <Check 
                    size={16} 
                    className={`text-(--primary-color) transition-opacity duration-150 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    }`} 
                  />
                </div>
              );
            })
          )}
        </div>
      )}

      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};
