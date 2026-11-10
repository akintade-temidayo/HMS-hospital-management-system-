export const getPatientList = (response) => {
    const queue = [response?.data?.data, response?.data, response];
    const visited = new Set();

    while (queue.length > 0) {
        const payload = queue.shift();
        if (!payload || typeof payload !== 'object' || visited.has(payload)) continue;
        if (Array.isArray(payload)) return payload;
        visited.add(payload);
        for (const key of ['patients', 'patientRecords', 'patient_records', 'items', 'results', 'records', 'data']) {
            if (payload[key]) queue.push(payload[key]);
        }
    }

    return [];
};

export const formatPatientName = (patient) => {
    if (!patient) return 'Unknown Patient';
    const first = patient.firstName || patient.first_name || '';
    const last = patient.lastName || patient.last_name || '';
    const full = `${first} ${last}`.trim();
    return full || patient.fullName || patient.full_name || 'Unnamed Patient';
};

export const getPatientFolderNumber = (patient) => {
    const existingNumber = patient?.folderNumber || patient?.folder_number ||
        patient?.patientIdNumber || patient?.patient_id_number || patient?.medicalRecordNumber ||
        patient?.medical_record_number;
    if (existingNumber) return String(existingNumber).replace(/^PAT\s*-?\s*/i, 'PAT - ');

    // Keep a stable five-digit display ID when the API omits its folder number.
    const sourceId = String(patient?.id || patient?.patientId || patient?.patient_id || patient?._id || '');
    if (!sourceId) return 'PAT - 00000';
    let hash = 0;
    for (let index = 0; index < sourceId.length; index += 1) {
        hash = (hash * 31 + sourceId.charCodeAt(index)) >>> 0;
    }
    return `PAT - ${String((hash % 90000) + 10000)}`;
};

export const getPatientRecordId = (patient) => patient?.id || patient?.patientId || patient?.patient_id || patient?._id;

export const formatPatientDateOfBirth = (value) => {
    if (!value) return 'N/A';
    const datePart = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (!datePart) return String(value);
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
};

export const getAdmissionBadgeVariant = (status = '') => {
    const upper = String(status).toUpperCase();
    if (upper === 'ADMITTED') return 'warning';
    if (upper === 'DISCHARGED') return 'success';
    return 'info'; // OUTPATIENT
};

export const getPlannedStayDetails = (patient) => {
    const duration = Number(patient?.plannedStayDuration ?? patient?.planned_stay_duration);
    const rawUnit = String(patient?.plannedStayUnit || patient?.planned_stay_unit || 'DAYS').toUpperCase();
    const unit = ['DAYS', 'WEEKS', 'MONTHS'].includes(rawUnit) ? rawUnit : 'DAYS';
    if (!Number.isInteger(duration) || duration < 1) {
        return { duration: null, unit, label: 'Not set', days: null, admissionDay: null };
    }

    const unitLabel = unit === 'WEEKS' ? 'week' : unit === 'MONTHS' ? 'month' : 'day';
    const label = `${duration} ${unitLabel}${duration === 1 ? '' : 's'}`;
    let days = unit === 'DAYS' ? duration : unit === 'WEEKS' ? duration * 7 : null;
    const rawStartDate = patient?.admittedAt || patient?.admitted_at || patient?.admissionDate || patient?.admission_date || patient?.admissionStartDate || patient?.admission_start_date;
    const startDate = rawStartDate ? new Date(rawStartDate) : null;

    if (unit === 'MONTHS' && startDate && !Number.isNaN(startDate.getTime())) {
        const targetDay = startDate.getDate();
        const endDate = new Date(startDate);
        endDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + duration);
        const lastDayOfTargetMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
        endDate.setDate(Math.min(targetDay, lastDayOfTargetMonth));
        days = Math.round((Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - Date.UTC(startDate.getFullYear(), startDate.getMonth(), targetDay)) / 86400000);
    }

    let admissionDay = null;
    if (startDate && !Number.isNaN(startDate.getTime()) && days) {
        const today = new Date();
        const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        admissionDay = Math.min(days, Math.max(1, Math.floor((todayUtc - startUtc) / 86400000) + 1));
    }

    return { duration, unit, label, days, admissionDay };
};

export const getGenderBadgeProps = (gender = '') => {
    const upper = String(gender).toUpperCase();
    if (upper === 'FEMALE') {
        return { label: 'Female', className: 'bg-pink-50 text-pink-700 border-pink-200' };
    }
    return { label: 'Male', className: 'bg-sky-50 text-sky-700 border-sky-200' };
};
