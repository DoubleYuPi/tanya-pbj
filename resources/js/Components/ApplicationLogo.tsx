import { ShieldCheck } from 'lucide-react';

// Original mark for Tanya PBJ — shield-and-check motif for trust/
// verification, deliberately distinct from any reference site's branding
// (spec Part 4: no copied logo/colors/assets).
export default function ApplicationLogo({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <img
                src="/images/sapapbj-logopng.png"
                alt="Logo SAPA PBJ"
                className="h-9 w-9 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-[var(--color-navy-700)]">
                SAPA PBJ
            </span>
        </div>
    );
}
