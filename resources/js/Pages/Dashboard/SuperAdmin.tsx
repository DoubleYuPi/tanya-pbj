import { Head, usePage } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { PageProps } from '@/types';

export default function SuperAdminDashboard() {
    const { auth } = usePage<PageProps>().props;

    const cards = ['Total Users', 'Total Admins', 'Konsultasi Aktif', 'Konsultasi Selesai', 'Total Peraturan', 'Total Pertanyaan'];

    return (
        <SuperAdminLayout>
            <Head title="Dashboard Super Admin" />

            <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">
                Selamat datang, {auth.user?.name}
            </h1>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((label) => (
                    <Card key={label}>
                        <CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">{label}</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">0</p></CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mt-8">
                <CardHeader><CardTitle>Manajemen & Statistik</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                        Manajemen pengguna/admin dan CMS peraturan datang di Phase 3 & 7. Grafik statistik menyusul
                        di Phase 7 setelah ada data nyata untuk ditampilkan.
                    </p>
                </CardContent>
            </Card>
        </SuperAdminLayout>
    );
}
