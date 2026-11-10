import DoctorOpdClient from './DoctorOpdClient';

// The dashboard layout waits for the signed-in user before rendering its children.
// OPD therefore isn't guaranteed to have a prefetched UI during instant-navigation validation.
export const instant = false;

export default function DoctorOpdPage() {
    return <DoctorOpdClient />;
}
