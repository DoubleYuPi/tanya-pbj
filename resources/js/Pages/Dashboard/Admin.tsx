import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { PageProps } from '@/types';
import { Circle } from 'lucide-react';

type Status = 'online' | 'away' | 'offline';

interface Stats {
    activeConversations: number;
    resolvedConversations: number;
    pendingQuestions: number;
}

interface PendingConversation {
    id: number;
    user_name: string;
    subject: string | null;
    last_message_at: string | null;
}

const STATUS_OPTIONS: { value: Status; label: string; color: string }[] = [
    { value: 'online', label: 'Online', color: 'text-emerald-500' },
    { value: 'away', label: 'Away', color: 'text-amber-500' },
    { value: 'offline', label: 'Offline', color: 'text-gray-400' },
];

export default function AdminDashboard() {
    const { auth, currentStatus, stats, pendingConversations } = usePage<PageProps<{
        currentStatus: Status;
        stats: Stats;
        pendingConversations: PendingConversation[];
    }>>().props;

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
                <Card><CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Konsultasi Aktif</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.activeConversations}</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Konsultasi Selesai</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.resolvedConversations}</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">Menunggu Jawaban</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.pendingQuestions}</p></CardContent></Card>
            </div>

            <Card className="mt-8">
                <CardHeader><CardTitle>Pertanyaan Menunggu Jawaban</CardTitle></CardHeader>
                <CardContent>
                    {pendingConversations.length === 0 ? (
                        <p className="text-sm text-[var(--color-muted-foreground)]">Belum ada konsultasi.</p>
                    ) : (
                        <ul className="divide-y divide-[var(--color-border)]">
                            {pendingConversations.map((c) => (
                                <li key={c.id} className="flex items-center justify-between py-3">
                                    <div className="min-w-0">
                                        <p className="font-medium">{c.user_name}</p>
                                        <p className="truncate text-xs text-[var(--color-muted-foreground)]">{c.subject}</p>
                                        <p className="text-xs text-[var(--color-muted-foreground)]">{c.last_message_at}</p>
                                    </div>
                                    <Button size="sm" asChild>
                                        <Link href={route('admin.chat.show', c.id)}>Jawab</Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
