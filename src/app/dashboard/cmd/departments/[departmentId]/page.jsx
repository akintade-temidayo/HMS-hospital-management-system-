import { Suspense } from 'react';
import DepartmentDetailsPageClient from './DepartmentDetailsPageClient';

export const instant = false;

export default function DepartmentDetailsPage({ params }) {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-slate-500">Loading department details...</div>}>
      <DepartmentDetailsPageClient params={params} />
    </Suspense>
  );
}
