'use client';

import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export const FileUploadInput = ({ label, onChange, error, required = false, accept, value }) => {
  const [internalFile, setInternalFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [inputKey, setInputKey] = useState(0);
  const isControlled = value !== undefined;
  const file = isControlled ? value : internalFile;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Enforce 10MB maximum limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds the 10MB limit.');
      return;
    }

    setFileError(null);
    if (!isControlled) setInternalFile(selectedFile);
    if (onChange) onChange(selectedFile);
  };

  const removeFile = () => {
    if (!isControlled) setInternalFile(null);
    setInputKey((key) => key + 1);
    setFileError(null);
    if (onChange) onChange(null);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </span>
      )}
      {!file ? (
        <label className="border-2 border-dashed border-slate-200 hover:border-(--primary-color) rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 flex flex-col items-center justify-center gap-2">
          <Upload size={20} className="text-slate-400" />
          <span className="text-xs text-slate-600 font-medium">Click to upload or drag & drop (Max 10MB)</span>
          <input key={inputKey} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        </label>
      ) : (
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText size={16} className="text-(--primary-color) shrink-0" />
            <span className="text-xs font-medium text-slate-800 truncate">{file.name}</span>
          </div>
          <button type="button" onClick={removeFile} className="text-slate-400 hover:text-rose-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
      {(error || fileError) && <span className="text-xs text-rose-500 font-medium">{error || fileError}</span>}
    </div>
  );
};
