/**
 * Safely extracts the array of queue items from various API envelope shapes.
 * Handles single arrays, object wrappers ({ queue: [] }, { items: [] }), or nested payload data.
 */
export const getDoctorQueueList = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    return payload.queue || payload.items || payload.results || [];
};

/**
 * Returns badge variants for doctor queue statuses.
 */
export const getDoctorQueueStatusBadge = (status = '') => {
    const upper = String(status).toUpperCase();
    switch (upper) {
        case 'COMPLETED':
            return 'success';
        case 'IN_CONSULTATION':
            return 'warning';
        case 'SKIPPED':
        case 'CANCELLED':
            return 'danger';
        case 'WAITING':
        default:
            return 'info';
    }
};

/**
 * Formats a structured SOAP object into a clean, human-readable clinical note string
 * suitable for saving into the patient's record entries.
 */
export const formatSoapNoteContent = ({ subjective = '', objective = '', assessment = '', plan = '' }) => {
    return [
        '=== CLINICAL CONSULTATION (SOAP) ===',
        `SUBJECTIVE:\n${subjective.trim() || 'N/A'}`,
        `OBJECTIVE:\n${objective.trim() || 'N/A'}`,
        `ASSESSMENT:\n${assessment.trim() || 'N/A'}`,
        `PLAN:\n${plan.trim() || 'N/A'}`,
    ].join('\n\n');
};

/**
 * Formats ISO date strings into local readable date-time for appointment scheduling view.
 */
export const formatAppointmentDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-NG', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    } catch {
        return isoString;
    }
};