import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/button';
import { ShieldAlert, FileQuestion, ServerCrash } from 'lucide-react';

// Rendered by bootstrap/app.php's exception handler for 403/404/419/429/
// 500/503 (spec Part 37) — never shows stack traces or SQL details, just
// a plain-language message per status code.
const MESSAGES: Record<number, { title: string; description: string; icon: typeof FileQuestion }> = {
    403: {
        title: 'Anda tidak memiliki akses ke halaman ini.',
        description: 'Halaman ini dibatasi untuk peran pengguna tertentu.',
        icon: ShieldAlert,
    },
    404: {
        title: 'Halaman tidak ditemukan.',
        description: 'Halaman yang Anda cari mungkin telah dipindahkan atau tidak ada.',
        icon: FileQuestion,
    },
    419: {
        title: 'Sesi Anda telah berakhir.',
        description: 'Silakan muat ulang halaman dan coba lagi.',
        icon: ShieldAlert,
    },
    429: {
        title: 'Terlalu banyak permintaan.',
        description: 'Silakan tunggu sebentar sebelum mencoba lagi.',
        icon: ShieldAlert,
    },
    500: {
        title: 'Terjadi kesalahan pada sistem.',
        description: 'Tim kami telah diberi tahu. Silakan coba lagi nanti.',
        icon: ServerCrash,
    },
    503: {
        title: 'Layanan sedang tidak tersedia.',
        description: 'Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti.',
        icon: ServerCrash,
    },
};

export default function ErrorPage({ status }: { status: number }) {
    const info = MESSAGES[status] ?? MESSAGES[500];
    const Icon = info.icon;

    return (
        <PublicLayout>
            <Head title={`Error ${status}`} />

            <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-muted)] text-[var(--color-navy-600)]">
                    <Icon className="h-8 w-8" />
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Error {status}
                </p>
                <h1 className="mt-2 text-xl font-bold text-[var(--color-navy-700)]">{info.title}</h1>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{info.description}</p>
                <Button className="mt-6" asChild>
                    <Link href={route('landing')}>Kembali ke Beranda</Link>
                </Button>
            </div>
        </PublicLayout>
    );
}
