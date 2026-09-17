import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import { Paginated } from '@/types/pagination';
import { Eye, Power } from 'lucide-react';

interface UserRow {
    id: number;
    name: string;
    email: string;
    satuan_kerja: string | null;
    is_active: boolean;
    created_at: string;
}

export default function Index() {
    const { users, filters } = usePage<{ users: Paginated<UserRow>; filters: { search?: string } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search }, { preserveState: true });
    };

    const toggleActive = (u: UserRow) => {
        const verb = u.is_active ? 'menonaktifkan' : 'mengaktifkan';
        if (confirm(`Yakin ingin ${verb} akun "${u.name}"?`)) {
            router.patch(route('admin.users.toggleActive', u.id), {}, { preserveScroll: true });
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen Pengguna" />

            <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Manajemen Pengguna</h1>

            <form onSubmit={submitSearch} className="mt-4 flex max-w-md gap-2">
                <Input placeholder="Cari nama, email, atau satuan kerja..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <Button type="submit" variant="outline">Cari</Button>
            </form>

            <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)] text-xs uppercase text-[var(--color-muted-foreground)]">
                        <tr>
                            <th className="px-4 py-3">Nama</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Satuan Kerja</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Terdaftar</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted-foreground)]">Belum ada pengguna.</td></tr>
                        )}
                        {users.data.map((u) => (
                            <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0">
                                <td className="px-4 py-3 font-medium">{u.name}</td>
                                <td className="px-4 py-3">{u.email}</td>
                                <td className="max-w-xs truncate px-4 py-3 text-xs">{u.satuan_kerja ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={u.is_active ? 'secondary' : 'destructive'}>
                                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-xs">{u.created_at}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={route('admin.users.show', u.id)}><Eye className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => toggleActive(u)} aria-label={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                                            <Power className={`h-4 w-4 ${u.is_active ? 'text-red-600' : 'text-emerald-600'}`} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={users.links} />
        </SuperAdminLayout>
    );
}
