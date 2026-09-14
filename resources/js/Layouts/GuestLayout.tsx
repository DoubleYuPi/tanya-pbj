import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

// Container for the auth screens (login/register/reset etc). Distinct from
// PublicLayout, which carries the full marketing nav+footer — auth forms
// just need a centered card. Not one of the 4 named layouts in spec Part 42
// but a standard, low-risk addition alongside them for these screens.
export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-navy-900)] px-4 py-10 sm:px-6">
            <Link href={route('landing')} className="mb-8">
                <ApplicationLogo className="[&_span:last-child]:text-white" />
            </Link>

            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                {children}
            </div>

            <p className="mt-8 text-xs text-white/60">
                Konsultasi dan Informasi Pengadaan Barang/Jasa Pemerintah
            </p>
        </div>
    );
}
