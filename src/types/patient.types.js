/** @typedef {"OUTPATIENT" | "ADMITTED" | "DISCHARGED" | "EMERGENCY"} AdmissionStatus */
/** @typedef {{ id: string, patientId: string, firstName: string, lastName: string, dateOfBirth?: string, phone?: string, admissionStatus: AdmissionStatus }} Patient */
export const ADMISSION_STATUSES = ["OUTPATIENT", "ADMITTED", "DISCHARGED", "EMERGENCY"];
