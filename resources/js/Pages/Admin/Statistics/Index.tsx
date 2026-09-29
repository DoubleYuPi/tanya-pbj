import { Head, usePage } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import BarChart from '@/Components/BarChart';

interface MonthPoint { month: string; total: number }

interface Totals {
    users: number;
    admins: number;
    regulations: number;
    conversations: number;
    activeConversations: number;
    resolvedConversations: number;
}

const STATUS_LABEL: Record<string, string> = {
    open: 'Terbuka',
    waiting_for_admin: 'Menunggu Admin',
    waiting_for_user: 'Menunggu User',
    resolved: 'Selesai',
    closed: 'Ditutup',
};

export default function Index() {
    const { totals, conversationsPerMonth, usersPerMonth, regulationsPerMonth, statusBreakdown } = usePage<{
        totals: Totals;
        conversationsPerMonth: MonthPoint[];
        usersPerMonth: MonthPoint[];
        regulationsPerMonth: MonthPoint[];
        statusBreakdown: Record<string, number>;
    }>().props;

    const cards: [string, number][] = [
        ['Total Pengguna', totals.users],
        ['Total Admin', totals.admins],
        ['Total Peraturan', totals.regulations],
        ['Total Konsultasi', totals.conversations],
        ['Konsultasi Aktif', totals.activeConversations],
        ['Konsultasi Selesai', totals.resolvedConversations],
    ];

    return (
        <SuperAdminLayout>
            <Head title="Statistik" />

            <h1 className="text-2xl font-bold text-[var(--color-green-700)]">Statistik</h1>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                {cards.map(([label, value]) => (
                    <Card key={label}>
                        <CardHeader><CardTitle className="text-sm text-[var(--color-muted-foreground)]">{label}</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{value}</p></CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Konsultasi per Bulan</CardTitle></CardHeader>
                    <CardContent><BarChart data={conversationsPerMonth} /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Pengguna Baru per Bulan</CardTitle></CardHeader>
                    <CardContent><BarChart data={usersPerMonth} color="var(--color-secondary)" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Peraturan Diunggah per Bulan</CardTitle></CardHeader>
                    <CardContent><BarChart data={regulationsPerMonth} color="var(--color-green-500)" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Status Konsultasi</CardTitle></CardHeader>
                    <CardContent>
                        {Object.keys(statusBreakdown).length === 0 ? (
                            <p className="text-sm text-[var(--color-muted-foreground)]">Belum ada data konsultasi.</p>
                        ) : (
                            <ul className="space-y-2">
                                {Object.entries(statusBreakdown).map(([status, total]) => (
                                    <li key={status} className="flex items-center justify-between text-sm">
                                        <span className="text-[var(--color-muted-foreground)]">{STATUS_LABEL[status] ?? status}</span>
                                        <span className="font-semibold">{total}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
