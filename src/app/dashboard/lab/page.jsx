import LabDashboardClient from './LabDashboardClient';

// Lab access depends on the browser-restored authenticated session.
export const instant = false;

export default function MedicalLabPage() {
    return <LabDashboardClient />;
}
