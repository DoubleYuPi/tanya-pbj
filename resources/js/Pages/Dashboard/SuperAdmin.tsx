import { Head, Link, usePage } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { PageProps } from '@/types';

interface Stats {
    totalRegulations: number;
    activeConversations: number;
    resolvedConversations: number;
    totalQuestions: number;
}

export default function SuperAdminDashboard() {
    const { auth, stats } = usePage<PageProps<{ stats: Stats }>>().props;

    const cards: [string, number | string][] = [
        ['Total Users', '—'],
        ['Total Admins', '—'],
        ['Konsultasi Aktif', stats.activeConversations],
        ['Konsultasi Selesai', stats.resolvedConversations],
        ['Total Peraturan', stats.totalRegulations],
        ['Total Pertanyaan', stats.totalQuestions],
    ];

    return (
        <SuperAdminLayout>
            <Head title="Dashboard Super Admin" />

            <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">
                Selamat datang, {auth.user?.name}
            </h1>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map(([label, value]) => (
                    <Card key={label}>
                        <CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">{label}</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{value}</p></CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mt-8">
                <CardHeader><CardTitle>Manajemen Peraturan</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                        Kelola peraturan, kategori, dan berkas PDF yang diterbitkan.
                    </p>
                    <Button className="mt-3" asChild>
                        <Link href={route('admin.regulations.index')}>Buka Manajemen Peraturan</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card className="mt-4">
                <CardHeader><CardTitle>Manajemen Pengguna & Statistik</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                        Manajemen pengguna/admin, audit log, dan grafik statistik hadir di Phase 7.
                    </p>
                </CardContent>
            </Card>
        </SuperAdminLayout>
    );
}
