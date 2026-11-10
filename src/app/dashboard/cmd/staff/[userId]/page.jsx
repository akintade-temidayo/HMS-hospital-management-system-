import { Suspense } from 'react';
import StaffDetailsPageClient from './StaffDetailsPageClient';

export const instant = false;

export default function StaffDetailPage({ params }) {
    return (
        <Suspense fallback={<div className="py-16 text-center text-sm text-slate-500">Loading staff member profile...</div>}>
            <StaffDetailsPageClient params={params} />
        </Suspense>
    );
}
