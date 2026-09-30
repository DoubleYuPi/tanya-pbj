import { ShieldCheck } from 'lucide-react';

// Original mark for Tanya PBJ — shield-and-check motif for trust/
// verification, deliberately distinct from any reference site's branding
// (spec Part 4: no copied logo/colors/assets).
type Props = {
    className?: string;
    /** Use in fixed-width containers (e.g. sidebar) to hide parts when narrow */
    responsive?: boolean;
};

export default function ApplicationLogo({ className = '', responsive = false }: Props) {
    const root = responsive ? '@container w-full min-w-0' : '';
    const text = responsive ? 'hidden @[16rem]:inline' : 'inline';
    const divider = responsive ? 'hidden @[12rem]:block' : 'block';
    const partners = responsive ? 'hidden @[12rem]:flex' : 'flex';

    return (
        <div className={`${root} ${className}`}>
            <div className="flex items-center gap-3">
                {/* SAPA PBJ mark + text */}
                <div className="flex shrink-0 items-center gap-2">
                    <img
                        src="/images/sapapbj-logopng.png"
                        alt="Logo SAPA PBJ"
                        className="h-9 w-9 shrink-0 object-contain"
                    />
                    <span className={`${text} whitespace-nowrap text-lg font-bold tracking-tight text-[var(--color-navy-700)]`}>
                        SAPA PBJ
                    </span>
                </div>

                {/* Divider */}
                <div className={`${divider} h-8 w-px shrink-0 bg-gray-300`} aria-hidden="true" />

                {/* Partner logos */}
                <div className={`${partners} min-w-0 items-center gap-2`}>
                    <img
                        src="/images/logo-pemkotptk.png"
                        alt="Logo Pemerintah Kota Pontianak"
                        className="h-9 w-9 shrink-0 object-contain"
                    />
                    <img
                        src="/images/logo-bpbj.png"
                        alt="Logo UKPBJ Kota Pontianak"
                        className="h-22 w-22 shrink-0 object-contain"
                    />
                </div>
            </div>
        </div>
    );
}