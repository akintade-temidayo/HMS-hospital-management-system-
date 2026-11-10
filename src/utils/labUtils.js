/**
 * Safe extractor for patient entries or lab lists from backend response envelopes.
 */
export const getLabEntriesList = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    return payload.entries || payload.items || payload.results || [];
};

/**
 * Formats structured lab test content for POST /patients/{patientId}/entries.
 */
export const formatLabResultContent = ({ testName, parameters, remarks, attachmentName }) => {
    const sections = [
        testName?.trim() ? `LAB TEST RESULTS: ${testName.trim()}` : '',
        parameters?.trim() ? `FINDINGS / PARAMETERS:\n${parameters.trim()}` : '',
        remarks?.trim() ? `LAB TECHNICIAN REMARKS:\n${remarks.trim()}` : '',
        attachmentName ? `Attached file: ${attachmentName}` : '',
    ].filter(Boolean);

    return sections.length ? sections.join('\n\n') : 'Laboratory result recorded without additional details.';
};

/**
 * Normalizes patient search response envelope.
 */
export const getPatientSearchResults = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    return payload.patients || payload.items || [];
};