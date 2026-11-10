'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { inventoryService } from '@/services/inventory.service';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { SearchInput } from '@/components/ui/atoms/SearchInput';
import { AddOrRestockItemModal } from '@/components/ui/organisms/pharmacy/AddOrRestockItemModal';
import { DispensePrescriptionModal } from '@/components/ui/organisms/pharmacy/DispensePrescriptionModal';
import { CreatePrescriptionModal } from '@/components/ui/organisms/pharmacy/CreatePrescriptionModal';
import { Pill, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, getPharmacyList, getStockStatusBadge } from '@/utils/pharmacyUtils';

export default function PharmacyDashboardClient() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
    const [isCreatePrescriptionOpen, setIsCreatePrescriptionOpen] = useState(false);

    const fetchInventory = useCallback(async () => {
        const res = await inventoryService.getItems();
        return getPharmacyList(res);
    }, []);

    const refreshInventory = useCallback(async () => {
        try {
            setInventory(await fetchInventory());
        } catch (err) {
            toast.error(err.message || 'Failed to fetch pharmacy inventory.');
        } finally {
            setLoading(false);
        }
    }, [fetchInventory]);

    useEffect(() => {
        let isActive = true;

        fetchInventory()
            .then(items => {
                if (isActive) setInventory(items);
            })
            .catch(err => {
                if (isActive) toast.error(err.message || 'Failed to fetch pharmacy inventory.');
            })
            .finally(() => {
                if (isActive) setLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [fetchInventory]);

    const filteredInventory = inventory.filter(item => {
        const name = item.name || item.medicationName || '';
        const category = item.category || '';
        const query = searchQuery.toLowerCase();
        return name.toLowerCase().includes(query) || category.toLowerCase().includes(query);
    });

    const lowStockCount = inventory.filter(i => (Number(i.quantity) || 0) <= 10).length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Pill className="text-(--primary-color)" size={28} />
                        <span>Pharmacy & Stock Management</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Monitor drug inventory levels, manage stock pricing in Naira (₦), and fulfill patient prescriptions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setIsCreatePrescriptionOpen(true)}>
                        Create Prescription
                    </Button>
                    <Button variant="outline" onClick={() => setIsDispenseModalOpen(true)}>
                        Dispense Rx
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                        <Plus size={16} />
                        <span>Add Medication</span>
                    </Button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Total Catalog Items</p>
                        <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{inventory.length}</p>
                    </div>
                    <div className="p-3 bg-teal-50 text-(--primary-color) rounded-xl">
                        <Pill size={22} />
                    </div>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Low Stock / Out of Stock</p>
                        <p className="text-xl font-extrabold text-rose-600 font-mono mt-0.5">{lowStockCount}</p>
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                        <AlertTriangle size={22} />
                    </div>
                </div>
            </div>

            {/* Search Filter */}
            <div className="max-w-md">
                <SearchInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medications by name or category..."
                />
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs text-slate-400">Loading pharmacy catalog...</div>
            ) : filteredInventory.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center text-slate-400 text-xs">
                    No medications found in inventory.
                </div>
            ) : (
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-3">Medication Name</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Quantity</th>
                                    <th className="px-6 py-3">Unit Price</th>
                                    <th className="px-6 py-3">Expiry Date</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredInventory.map((item, index) => {
                                    const itemId = item.id || item._id || `med-${index}`;
                                    const qty = Number(item.quantity) || 0;
                                    const statusObj = getStockStatusBadge(qty);

                                    return (
                                        <tr key={itemId} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">{item.name || item.medicationName}</td>
                                            <td className="px-6 py-4 font-medium text-slate-600">{item.category || 'General'}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-900">{qty}</td>
                                            <td className="px-6 py-4 font-mono text-slate-700">{formatCurrency(item.unitPrice || item.price)}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-NG') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={statusObj.variant}>{statusObj.label}</Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AddOrRestockItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={refreshInventory}
            />

            <DispensePrescriptionModal
                isOpen={isDispenseModalOpen}
                onClose={() => setIsDispenseModalOpen(false)}
                onSuccess={refreshInventory}
            />

            <CreatePrescriptionModal
                isOpen={isCreatePrescriptionOpen}
                onClose={() => setIsCreatePrescriptionOpen(false)}
            />
        </div>
    );
}