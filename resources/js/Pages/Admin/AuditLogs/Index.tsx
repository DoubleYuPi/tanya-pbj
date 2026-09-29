import { Head, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import { Paginated } from '@/types/pagination';

interface LogRow {
    id: number;
    actor_name: string;
    action: string;
    description: string | null;
    ip_address: string | null;
    created_at: string;
}

export default function Index() {
    const { logs, availableActions, filters } = usePage<{
        logs: Paginated<LogRow>;
        availableActions: string[];
        filters: { search?: string; action?: string };
    }>().props;

    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('admin.audit-logs.index'), { ...filters, search }, { preserveState: true });
    };

    const setAction = (action: string | null) => {
        router.get(route('admin.audit-logs.index'), { ...filters, action: action ?? undefined }, { preserveState: true });
    };

    return (
        <SuperAdminLayout>
            <Head title="Audit Log" />

            <h1 className="text-2xl font-bold text-[var(--color-green-700)]">Audit Log</h1>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Catatan tindakan penting yang dilakukan admin dan super admin.
            </p>

            <form onSubmit={submitSearch} className="mt-4 flex max-w-md gap-2">
                <Input placeholder="Cari deskripsi atau pelaku..." aria-label="Cari deskripsi atau pelaku" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Button type="submit" variant="outline">Cari</Button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant={!filters.action ? 'default' : 'outline'} onClick={() => setAction(null)}>Semua</Button>
                {availableActions.map((a) => (
                    <Button key={a} size="sm" variant={filters.action === a ? 'default' : 'outline'} onClick={() => setAction(a)}>
                        {a}
                    </Button>
                ))}
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)] text-xs uppercase text-[var(--color-muted-foreground)]">
                        <tr>
                            <th className="px-4 py-3">Waktu</th>
                            <th className="px-4 py-3">Pelaku</th>
                            <th className="px-4 py-3">Aksi</th>
                            <th className="px-4 py-3">Deskripsi</th>
                            <th className="px-4 py-3">IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.data.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--color-muted-foreground)]">Belum ada catatan audit.</td></tr>
                        )}
                        {logs.data.map((l) => (
                            <tr key={l.id} className="border-b border-[var(--color-border)] last:border-0">
                                <td className="whitespace-nowrap px-4 py-3 text-xs">{l.created_at}</td>
                                <td className="px-4 py-3 font-medium">{l.actor_name}</td>
                                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{l.action}</Badge></td>
                                <td className="px-4 py-3 text-xs">{l.description ?? '—'}</td>
                                <td className="px-4 py-3 text-xs text-[var(--color-muted-foreground)]">{l.ip_address ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={logs.links} />
        </SuperAdminLayout>
    );
}
