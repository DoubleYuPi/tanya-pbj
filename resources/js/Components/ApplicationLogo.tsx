import { ShieldCheck } from 'lucide-react';

// Original mark for Tanya PBJ — shield-and-check motif for trust/
// verification, deliberately distinct from any reference site's branding
// (spec Part 4: no copied logo/colors/assets).
export default function ApplicationLogo({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
                <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-[var(--color-navy-700)]">
                Tanya PBJ
            </span>
        </div>
    );
}
