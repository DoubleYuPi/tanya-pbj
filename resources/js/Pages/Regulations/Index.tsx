import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import { Paginated } from '@/types/pagination';
import { Search, Download, Eye } from 'lucide-react';

interface RegulationRow {
    id: number;
    title: string;
    document_number: string | null;
    year: number;
    issuing_institution: string | null;
    is_sample_data: boolean;
    category: { id: number; name: string; slug: string };
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function Index() {
    const { regulations, categories, filters } = usePage<{
        regulations: Paginated<RegulationRow>;
        categories: Category[];
        filters: { search?: string; category?: string; year?: string };
    }>().props;

    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('regulations.index'), { ...filters, search }, { preserveState: true });
    };

    const setCategory = (slug: string | null) => {
        router.get(route('regulations.index'), { ...filters, category: slug ?? undefined }, { preserveState: true });
    };

    return (
        <PublicLayout>
            <Head title="Peraturan Pengadaan Barang/Jasa" />

            <div className="mx-auto max-w-6xl px-4 py-12">
                <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Peraturan Pengadaan Barang/Jasa</h1>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    Temukan peraturan dan regulasi terkait Pengadaan Barang/Jasa Pemerintah.
                </p>

                <form onSubmit={submitSearch} className="mt-6 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                        <Input
                            className="pl-9"
                            placeholder="Cari peraturan, nomor, topik, atau kata kunci..."
                            aria-label="Cari peraturan, nomor, topik, atau kata kunci"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button type="submit">Cari</Button>
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant={!filters.category ? 'default' : 'outline'} onClick={() => setCategory(null)}>
                        Semua
                    </Button>
                    {categories.map((c) => (
                        <Button
                            key={c.id}
                            size="sm"
                            variant={filters.category === c.slug ? 'default' : 'outline'}
                            onClick={() => setCategory(c.slug)}
                        >
                            {c.name}
                        </Button>
                    ))}
                </div>

                {regulations.data.length === 0 ? (
                    <p className="mt-12 text-center text-sm text-[var(--color-muted-foreground)]">
                        Belum ada peraturan yang tersedia.
                    </p>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {regulations.data.map((r) => (
                            <Card key={r.id}>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Badge>{r.category.name}</Badge>
                                        {r.is_sample_data && <Badge variant="outline">DATA CONTOH</Badge>}
                                    </div>
                                    <CardTitle className="mt-2 line-clamp-2 text-base">{r.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-[var(--color-muted-foreground)]">
                                        {r.document_number ? `No. ${r.document_number} · ` : ''}{r.year}
                                    </p>
                                    {r.issuing_institution && (
                                        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{r.issuing_institution}</p>
                                    )}
                                    <div className="mt-4 flex gap-2">
                                        <Button size="sm" asChild>
                                            <Link href={route('regulations.show', r.id)}><Eye className="h-4 w-4" /> Lihat</Link>
                                        </Button>
                                        <Button size="sm" variant="outline" asChild>
                                            <a href={route('regulations.download', r.id)}><Download className="h-4 w-4" /> Unduh</a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Pagination links={regulations.links} />
            </div>
        </PublicLayout>
    );
}
