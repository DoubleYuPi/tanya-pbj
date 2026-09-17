import { Head, Link, usePage } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { PageProps } from '@/types';
import { MessageCircleQuestion, ScrollText, History, Bookmark } from 'lucide-react';

interface AvailableAdmin {
    id: number;
    name: string;
    position: string | null;
    organization: string | null;
}

interface Stats {
    savedRegulations: number;
    activeConversations: number;
    resolvedConversations: number;
}

export default function UserDashboard() {
    const { auth, stats, availableAdmins } = usePage<PageProps<{
        stats: Stats;
        availableAdmins: AvailableAdmin[];
    }>>().props;

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
                    <CardContent><p className="text-3xl font-bold">{stats.activeConversations}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Konsultasi Selesai</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{stats.resolvedConversations}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Peraturan Tersimpan</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{stats.savedRegulations}</p></CardContent>
                </Card>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                    <Link href={route('admins.index')}><MessageCircleQuestion className="h-4 w-4" /> Tanya Admin</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={route('regulations.index')}><ScrollText className="h-4 w-4" /> Cari Peraturan</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={route('chat.index')}><History className="h-4 w-4" /> Riwayat Konsultasi</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={route('regulations.bookmarks')}><Bookmark className="h-4 w-4" /> Peraturan Tersimpan</Link>
                </Button>
            </div>

            <Card className="mt-8">
                <CardHeader><CardTitle>Admin yang tersedia</CardTitle></CardHeader>
                <CardContent>
                    {availableAdmins.length === 0 ? (
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                            Saat ini tidak ada admin yang tersedia. Silakan cek kembali nanti.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {availableAdmins.map((admin) => (
                                <li key={admin.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{admin.name}</p>
                                        <p className="text-xs text-[var(--color-muted-foreground)]">{admin.position} · {admin.organization}</p>
                                    </div>
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href={route('admins.show', admin.id)}>Lihat Profil</Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Button className="mt-4" variant="link" asChild>
                        <Link href={route('admins.index')}>Lihat Semua Admin →</Link>
                    </Button>
                </CardContent>
            </Card>
        </UserLayout>
    );
}
