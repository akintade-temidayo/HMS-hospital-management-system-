'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { TextAreaInput } from '@/components/ui/atoms/TextAreaInput';
import { Modal } from '@/components/ui/atoms/Modal';
import { ConfirmModal } from '@/components/ui/molecules/ConfirmModal';
import { FileText, Plus, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = { title: '', content: '' };
const extractPolicies = (response) => {
const payload = response?.data?.data ?? response?.data ?? response;
return Array.isArray(payload) ? payload : payload?.policies || [];
};

export const PoliciesTab = () => {
const [policies, setPolicies] = useState([]);
const [loading, setLoading] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingPolicy, setEditingPolicy] = useState(null);
const [policyToDelete, setPolicyToDelete] = useState(null);
const [form, setForm] = useState(emptyForm);
const [submitting, setSubmitting] = useState(false);
const [deleting, setDeleting] = useState(false);

const fetchPolicies = async () => {
    try {
    setPolicies(extractPolicies(await api.get('/governance/policies')));
    } catch (error) {
    toast.error(error.message || 'Failed to fetch hospital policies.');
    }
};

useEffect(() => {
    let active = true;
    api.get('/governance/policies')
    .then((response) => { if (active) setPolicies(extractPolicies(response)); })
    .catch((error) => { if (active) toast.error(error.message || 'Failed to fetch hospital policies.'); })
    .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
}, []);

const openCreateModal = () => {
    setEditingPolicy(null);
    setForm(emptyForm);
    setIsModalOpen(true);
};

const openEditModal = (policy) => {
    setEditingPolicy(policy);
    setForm({ title: policy.title || '', content: policy.content || '' });
    setIsModalOpen(true);
};

const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
    if (editingPolicy) {
        const id = editingPolicy.id || editingPolicy._id;
        await api.patch(`/governance/policies/${encodeURIComponent(id)}`, form);
        toast.success('Hospital policy updated.');
    } else {
        await api.post('/governance/policies', form);
        toast.success('Hospital policy published.');
    }
    setIsModalOpen(false);
    setEditingPolicy(null);
    setForm(emptyForm);
    await fetchPolicies();
    } catch (error) {
    toast.error(error.message || 'Failed to save hospital policy.');
    } finally {
    setSubmitting(false);
    }
};

const handleDelete = async () => {
    if (!policyToDelete) return;
    setDeleting(true);
    try {
    const id = policyToDelete.id || policyToDelete._id;
    await api.delete(`/governance/policies/${encodeURIComponent(id)}`);
    setPolicies((current) => current.filter((policy) => (policy.id || policy._id) !== id));
    toast.success('Hospital policy deleted.');
    setPolicyToDelete(null);
    } catch (error) {
    toast.error(error.message || 'Failed to delete hospital policy.');
    } finally {
    setDeleting(false);
    }
};

return (
    <div className="space-y-6">
    <div className="flex items-center justify-between gap-4">
        <div>
        <h3 className="text-base font-bold text-slate-900">Hospital Policies</h3>
        <p className="mt-1 text-xs text-slate-500">Publish and maintain policies for hospital staff.</p>
        </div>
        <Button onClick={openCreateModal}>
        <Plus size={16} />
        <span>Publish Policy</span>
        </Button>
    </div>

    {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading hospital policies...</div>
    ) : policies.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-xs text-slate-400">No hospital policies have been published yet.</div>
    ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {policies.map((policy) => {
            const id = policy.id || policy._id;
            return (
            <article key={id} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600"><FileText size={20} /></div>
                <div className="flex items-center gap-1">
                    <button type="button" aria-label={`Edit ${policy.title}`} onClick={() => openEditModal(policy)} className="rounded-lg p-2 text-slate-400 transition-colors hover:text-(--primary-color)">
                    <Edit3 size={16} />
                    </button>
                    <button type="button" aria-label={`Delete ${policy.title}`} onClick={() => setPolicyToDelete(policy)} className="rounded-lg p-2 text-slate-400 transition-colors hover:text-rose-600">
                    <Trash2 size={16} />
                    </button>
                </div>
                </div>
                <h4 className="text-base font-bold text-slate-900">{policy.title}</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{policy.content}</p>
            </article>
            );
        })}
        </div>
    )}

    <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPolicy ? 'Edit Hospital Policy' : 'Publish Hospital Policy'}
        description="Write a policy for staff across your hospital."
    >
        <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput label="Policy Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required placeholder="e.g. Patient privacy policy" />
        <TextAreaInput label="Policy Content" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows={6} required placeholder="Enter the policy details" />
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>{editingPolicy ? 'Save Changes' : 'Publish Policy'}</Button>
        </div>
        </form>
    </Modal>

    <ConfirmModal
        isOpen={!!policyToDelete}
        title="Delete Hospital Policy"
        message={`Delete "${policyToDelete?.title || 'this policy'}"? This cannot be undone.`}
        confirmText="Delete Policy"
        isLoading={deleting}
        onClose={() => setPolicyToDelete(null)}
        onConfirm={handleDelete}
    />
    </div>
);
};
