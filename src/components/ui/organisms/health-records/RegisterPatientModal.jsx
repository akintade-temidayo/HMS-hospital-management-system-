'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/atoms/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { TextInput } from '@/components/ui/atoms/TextInput';
import { NumberInput } from '@/components/ui/atoms/NumberInput';
import { SelectDropdown } from '@/components/ui/atoms/SelectDropdown';

export const RegisterPatientModal = ({ isOpen, onClose, onSubmit, submitting }) => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE',
        phone: '',
        address: '',
        admissionStatus: 'OUTPATIENT',
        wardRoomNumber: '',
        nextOfKinName: '',
        nextOfKinContact: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            firstName: form.firstName,
            lastName: form.lastName,
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            phone: form.phone,
            address: form.address,
            admissionStatus: form.admissionStatus,
            wardRoomNumber: form.wardRoomNumber || null,
            nextOfKinName: form.nextOfKinName,
            nextOfKinContact: form.nextOfKinContact,
            emergencyContact: {
                name: form.emergencyContactName,
                relationship: form.emergencyContactRelationship,
                phone: form.emergencyContactPhone,
            },
        };
        onSubmit(payload, {
            resetForm: () => setForm({
                firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE', phone: '', address: '',
                admissionStatus: 'OUTPATIENT', wardRoomNumber: '', nextOfKinName: '', nextOfKinContact: '',
                emergencyContactName: '', emergencyContactRelationship: '', emergencyContactPhone: '',
            })
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Register New Patient"
            description="Create a permanent lifetime electronic health record (EHR)."
            maxWidth="max-w-4xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <section className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Patient Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                        label="First Name"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="e.g., Ada"
                        required
                    />
                    <TextInput
                        label="Last Name"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="e.g., Okafor"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                        type="date"
                        label="Date of Birth"
                        value={form.dateOfBirth}
                        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                        required
                    />
                    <SelectDropdown
                        label="Gender"
                        value={form.gender}
                        onChange={(gender) => setForm({ ...form, gender })}
                        options={[
                            { value: 'MALE', label: 'Male' },
                            { value: 'FEMALE', label: 'Female' },
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                        label="Phone Number"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+2348012345678"
                        required
                    />
                    <SelectDropdown
                        label="Admission Status"
                        value={form.admissionStatus}
                        onChange={(admissionStatus) => setForm({ ...form, admissionStatus })}
                        options={[
                            { value: 'OUTPATIENT', label: 'Outpatient' },
                            { value: 'ADMITTED', label: 'Admitted' },
                            { value: 'DISCHARGED', label: 'Discharged' },
                        ]}
                    />
                </div>

                <TextInput
                    label="Residential Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="12 Hospital Road, Lagos"
                    required
                />

                {form.admissionStatus === 'ADMITTED' && (
                    <TextInput
                        label="Ward / Room Number"
                        value={form.wardRoomNumber}
                        onChange={(e) => setForm({ ...form, wardRoomNumber: e.target.value })}
                        placeholder="Ward 4B - Bed 12"
                    />
                )}
                </section>

                <section className="space-y-4 border-t border-slate-200 pt-5">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Next of Kin Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TextInput
                            label="Next of Kin Name"
                            value={form.nextOfKinName}
                            onChange={(e) => setForm({ ...form, nextOfKinName: e.target.value })}
                            placeholder="Chidi Okafor"
                            required
                        />
                        <NumberInput
                            label="Next of Kin Contact"
                            value={form.nextOfKinContact}
                            onChange={(e) => setForm({ ...form, nextOfKinContact: e.target.value })}
                            placeholder="08098765432"
                            minLength={11}
                            maxLength={11}
                            pattern="[0-9]{11}"
                            required
                        />
                    </div>
                </section>

                <section className="space-y-4 border-t border-slate-200 pt-5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Emergency Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <TextInput
                        label="Emergency Contact Name"
                        value={form.emergencyContactName}
                        onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                        placeholder="Chidi Okafor"
                        required
                    />
                    <TextInput
                        label="Relationship"
                        value={form.emergencyContactRelationship}
                        onChange={(e) => setForm({ ...form, emergencyContactRelationship: e.target.value })}
                        placeholder="Brother"
                        required
                    />
                    <NumberInput
                        label="Emergency Phone"
                        value={form.emergencyContactPhone}
                        onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                        placeholder="08098765432"
                        minLength={11}
                        maxLength={11}
                        pattern="[0-9]{11}"
                        required
                    />
                </div>
                </section>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={submitting}>Register Patient</Button>
                </div>
            </form>
        </Modal>
    );
};
