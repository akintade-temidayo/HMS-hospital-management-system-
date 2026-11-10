import DashboardPageClient from './DashboardPageClient';

// This dashboard depends on a browser-authenticated session and loads its data
// after navigation, so it does not participate in instant-navigation validation.
export const instant = false;

export default function DashboardPage() {
  return <DashboardPageClient />;
}
