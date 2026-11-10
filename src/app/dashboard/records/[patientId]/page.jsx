import { Suspense } from 'react';
import Patient360Client from './Patient360Client';

// The profile depends on a client-side API request and is allowed to block.
export const instant = false;

export default function Patient360Page({ params }) {
    return (
        <Suspense fallback={<div className="py-24 text-center text-xs text-slate-400">Loading Patient 360 profile...</div>}>
            <Patient360Client params={params} />
        </Suspense>
    );
}
