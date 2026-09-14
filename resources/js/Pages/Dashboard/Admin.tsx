import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { PageProps } from '@/types';

export default function AdminDashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />

            <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">
                Selamat datang, {auth.user?.name}
            </h1>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card><CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Konsultasi Aktif</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">0</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Konsultasi Selesai</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">0</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Rata-rata Waktu Respon</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">—</p></CardContent></Card>
            </div>

            <Card className="mt-8">
                <CardHeader><CardTitle>Pertanyaan Menunggu Jawaban</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                        Belum ada konsultasi. Antrean pertanyaan terhubung ke sistem chat di Phase 5.
                    </p>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
