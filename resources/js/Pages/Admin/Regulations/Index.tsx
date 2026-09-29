import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import { Paginated } from '@/types/pagination';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';

interface RegulationRow {
    id: number;
    title: string;
    document_number: string | null;
    year: number;
    status: 'draft' | 'published' | 'archived';
    issuing_institution: string | null;
    category: { id: number; name: string };
    uploader: { id: number; name: string };
    created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
    draft: 'Draft',
    published: 'Diterbitkan',
    archived: 'Diarsipkan',
};

export default function Index() {
    const { regulations, filters } = usePage<{
        regulations: Paginated<RegulationRow>;
        filters: { search?: string };
    }>().props;

    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('admin.regulations.index'), { search }, { preserveState: true });
    };

    const destroy = (id: number, title: string) => {
        if (confirm(`Hapus peraturan "${title}"? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(route('admin.regulations.destroy', id));
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen Peraturan" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-[var(--color-green-700)]">Manajemen Peraturan</h1>
                <Button asChild>
                    <Link href={route('admin.regulations.create')}><Plus className="h-4 w-4" /> Tambah Peraturan</Link>
                </Button>
            </div>

            <form onSubmit={submitSearch} className="mt-4 flex max-w-md gap-2">
                <Input placeholder="Cari judul peraturan..." aria-label="Cari judul peraturan" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Button type="submit" variant="outline">Cari</Button>
            </form>

            <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)] text-xs uppercase text-[var(--color-muted-foreground)]">
                        <tr>
                            <th className="px-4 py-3">Judul</th>
                            <th className="px-4 py-3">Jenis</th>
                            <th className="px-4 py-3">Tahun</th>
                            <th className="px-4 py-3">Instansi</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Diunggah Oleh</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {regulations.data.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--color-muted-foreground)]">Belum ada peraturan yang tersedia.</td></tr>
                        )}
                        {regulations.data.map((r) => (
                            <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0">
                                <td className="max-w-xs truncate px-4 py-3 font-medium">{r.title}</td>
                                <td className="px-4 py-3">{r.category.name}</td>
                                <td className="px-4 py-3">{r.year}</td>
                                <td className="px-4 py-3">{r.issuing_institution ?? '—'}</td>
                                <td className="px-4 py-3"><Badge variant={r.status === 'published' ? 'secondary' : 'outline'}>{STATUS_LABEL[r.status]}</Badge></td>
                                <td className="px-4 py-3">{r.uploader.name}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" asChild>
                                            <a href={route('admin.regulations.download', r.id)} aria-label={`Unduh ${r.title}`}><Download className="h-4 w-4" /></a>
                                        </Button>
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={route('admin.regulations.edit', r.id)} aria-label={`Edit ${r.title}`}><Pencil className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => destroy(r.id, r.title)} aria-label={`Hapus ${r.title}`}>
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={regulations.links} />
        </SuperAdminLayout>
    );
}
