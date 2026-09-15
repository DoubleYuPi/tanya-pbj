import { Head, Link, usePage } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { PageProps } from '@/types';
import { MessageCircleQuestion, ScrollText, History, Bookmark } from 'lucide-react';

export default function UserDashboard() {
    const { auth, stats } = usePage<PageProps<{ stats: { savedRegulations: number } }>>().props;

    return (
        <UserLayout>
            <Head title="Dashboard" />

            <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">
                Selamat datang, {auth.user?.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Konsultasikan pertanyaan Anda mengenai Pengadaan Barang/Jasa Pemerintah.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Konsultasi Aktif</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">0</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Konsultasi Selesai</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">0</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Peraturan Tersimpan</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{stats.savedRegulations}</p></CardContent>
                </Card>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <Button><MessageCircleQuestion className="h-4 w-4" /> Tanya Admin</Button>
                <Button variant="outline" asChild>
                    <Link href={route('regulations.index')}><ScrollText className="h-4 w-4" /> Cari Peraturan</Link>
                </Button>
                <Button variant="outline"><History className="h-4 w-4" /> Riwayat Konsultasi</Button>
                <Button variant="outline" asChild>
                    <Link href={route('regulations.bookmarks')}><Bookmark className="h-4 w-4" /> Peraturan Tersimpan</Link>
                </Button>
            </div>

            <Card className="mt-8">
                <CardHeader><CardTitle>Admin yang tersedia</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                        Direktori admin dan alur mulai-konsultasi hadir di Phase 4 (Admin System) dari rencana pengembangan.
                    </p>
                </CardContent>
            </Card>
        </UserLayout>
    );
}
