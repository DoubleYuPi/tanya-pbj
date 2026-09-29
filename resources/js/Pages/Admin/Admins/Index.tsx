import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import { Paginated } from '@/types/pagination';
import { Plus, Pencil } from 'lucide-react';

interface AdminRow {
    id: number;
    name: string;
    email: string;
    position: string | null;
    organization: string | null;
    expertise: string[];
    status: string;
    is_active: boolean;
}

export default function Index() {
    const { admins, filters } = usePage<{ admins: Paginated<AdminRow>; filters: { search?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('admin.admins.index'), { search }, { preserveState: true });
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen Admin" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-[var(--color-green-700)]">Manajemen Admin</h1>
                <Button asChild>
                    <Link href={route('admin.admins.create')}><Plus className="h-4 w-4" /> Tambah Admin</Link>
                </Button>
            </div>

            <form onSubmit={submitSearch} className="mt-4 flex max-w-md gap-2">
                <Input placeholder="Cari nama atau email admin..." aria-label="Cari nama atau email admin" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Button type="submit" variant="outline">Cari</Button>
            </form>

            <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)] text-xs uppercase text-[var(--color-muted-foreground)]">
                        <tr>
                            <th className="px-4 py-3">Nama</th>
                            <th className="px-4 py-3">Jabatan</th>
                            <th className="px-4 py-3">Organisasi</th>
                            <th className="px-4 py-3">Keahlian</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.data.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted-foreground)]">Belum ada admin.</td></tr>
                        )}
                        {admins.data.map((a) => (
                            <tr key={a.id} className="border-b border-[var(--color-border)] last:border-0">
                                <td className="px-4 py-3">
                                    <p className="font-medium">{a.name}</p>
                                    <p className="text-xs text-[var(--color-muted-foreground)]">{a.email}</p>
                                </td>
                                <td className="px-4 py-3 text-xs">{a.position ?? '—'}</td>
                                <td className="px-4 py-3 text-xs">{a.organization ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {a.expertise.slice(0, 2).map((e) => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={a.is_active ? 'secondary' : 'destructive'}>
                                        {a.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end">
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={route('admin.admins.edit', a.id)} aria-label={`Edit ${a.name}`}><Pencil className="h-4 w-4" /></Link>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={admins.links} />
        </SuperAdminLayout>
    );
}
