import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { PageProps } from '@/types';
import { Circle } from 'lucide-react';

type Status = 'online' | 'away' | 'offline';

const STATUS_OPTIONS: { value: Status; label: string; color: string }[] = [
    { value: 'online', label: 'Online', color: 'text-emerald-500' },
    { value: 'away', label: 'Away', color: 'text-amber-500' },
    { value: 'offline', label: 'Offline', color: 'text-gray-400' },
];

export default function AdminDashboard() {
    const { auth, currentStatus } = usePage<PageProps<{ currentStatus: Status }>>().props;

    const setStatus = (status: Status) => {
        router.patch(route('admin.availability.update'), { status }, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">
                    Selamat datang, {auth.user?.name}
                </h1>
                <div className="flex gap-1 rounded-lg border border-[var(--color-border)] bg-white p-1">
                    {STATUS_OPTIONS.map((opt) => (
                        <Button
                            key={opt.value}
                            size="sm"
                            variant={currentStatus === opt.value ? 'default' : 'ghost'}
                            onClick={() => setStatus(opt.value)}
                        >
                            <Circle className={`h-2.5 w-2.5 fill-current ${opt.color}`} />
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </div>

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
