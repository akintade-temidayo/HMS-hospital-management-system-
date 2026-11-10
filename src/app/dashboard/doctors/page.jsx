import DoctorWorkspaceClient from './DoctorWorkspaceClient';

// The authenticated dashboard shell may block while session state is restored.
export const instant = false;

export default function DoctorWorkspacePage() {
    return <DoctorWorkspaceClient />;
}
