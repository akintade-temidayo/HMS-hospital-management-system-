'use client';

import React, { useState } from 'react';
import { api } from '@/services/api';
import { SearchInput } from '@/components/ui/atoms/SearchInput';
import { Button } from '@/components/ui/atoms/Button';
import { RecordLabResultModal } from '@/components/ui/organisms/lab/RecordLabResultModal';
import { ViewPatientLabSummaryModal } from '@/components/ui/organisms/lab/ViewPatientLabSummaryModal';
import { FlaskConical, Search, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getPatientSearchResults } from '@/utils/labUtils';

export default function MedicalLabPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Modals
    const [recordPatient, setRecordPatient] = useState(null);
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    const searchPatients = async (query) => {
        if (!query.trim()) return;
        try {
            setSearching(true);
            setHasSearched(true);
            const res = await api.get(`/patients/search?query=${encodeURIComponent(query.trim())}`);
            setSearchResults(getPatientSearchResults(res));
        } catch (err) {
            toast.error(err.message || 'Failed to search patients.');
        } finally {
            setSearching(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        void searchPatients(searchQuery);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <FlaskConical className="text-(--primary-color)" size={28} />
                        <span>Medical Laboratory & Diagnostics</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Search patient folder IDs (`PAT-XXXXX`), log diagnostic test results, and review medical histories[cite: 8].
                    </p>
                </div>
            </div>

            {/* Patient Search Section */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient Lookup for Testing</h2>
                <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
                    <div className="flex-1">
                        <SearchInput
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, phone, or folder ID (e.g. PAT-00001)..."
                        />
                    </div>
                    <Button type="submit" isLoading={searching} className="flex items-center gap-2">
                        <Search size={16} />
                        <span>Search</span>
                    </Button>
                </form>
            </div>

            {!hasSearched && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                    <FlaskConical className="mx-auto mb-3 text-slate-400" size={28} />
                    <h2 className="text-sm font-bold text-slate-700">Find a patient to get started</h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Search by name, phone number, or folder ID to view patient records and lab history.
                    </p>
                </div>
            )}

            {/* Search Results Table */}
            {hasSearched && (
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-900">
                        Search Results ({searchResults.length})
                    </div>
                    {searchResults.length === 0 ? (
                        <div className="p-12 text-center text-xs text-slate-400">
                            No matching patient records found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-3">Patient Name</th>
                                        <th className="px-6 py-3">Folder ID</th>
                                        <th className="px-6 py-3">Phone</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {searchResults.map((p, index) => {
                                        const pId = p.id || p.patientId || p.patient_id || p._id;
                                        const pName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient';
                                        const folderId = p.folderNumber || p.folder_number || 'PAT-XXXXX';

                                        return (
                                            <tr key={pId || index} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-900">{pName}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-600">{folderId}</td>
                                                <td className="px-6 py-4 text-xs text-slate-500">{p.phoneNumber || p.phone || 'N/A'}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedPatientId(pId)}
                                                    >
                                                        <FileText size={14} />
                                                        <span>History</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            if (!pId) {
                                                                toast.error('This patient record has no patient ID.');
                                                                return;
                                                            }
                                                            setRecordPatient(p);
                                                        }}
                                                    >
                                                        <Plus size={14} />
                                                        <span>Log Result</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <RecordLabResultModal
                isOpen={!!recordPatient}
                patient={recordPatient}
                patientId={recordPatient?.id || recordPatient?.patientId || recordPatient?.patient_id || recordPatient?._id}
                onClose={() => setRecordPatient(null)}
                onSuccess={() => {
                    void searchPatients(searchQuery);
                }}
            />

            <ViewPatientLabSummaryModal
                patientId={selectedPatientId}
                isOpen={!!selectedPatientId}
                onClose={() => setSelectedPatientId(null)}
            />
        </div>
    );
}