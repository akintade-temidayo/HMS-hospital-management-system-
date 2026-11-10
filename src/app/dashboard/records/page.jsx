import PatientsRegistryPageClient from './PatientsRegistryPageClient';

// The authenticated patient list loads in the browser after navigation.
export const instant = false;

export default function PatientsRegistryPage() {
  return <PatientsRegistryPageClient />;
}
