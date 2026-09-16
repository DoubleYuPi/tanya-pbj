import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import { Paginated } from '@/types/pagination';
import { Search, Circle } from 'lucide-react';

interface AdminCard {
    id: number;
    name: string;
    position: string | null;
    organization: string | null;
    bio: string | null;
    expertise: string[];
    status: 'online' | 'away' | 'offline';
}

const STATUS_LABEL: Record<string, string> = {
    online: 'Tersedia',
    away: 'Sedang Sibuk',
    offline: 'Tidak Tersedia',
};

const STATUS_COLOR: Record<string, string> = {
    online: 'text-emerald-500',
    away: 'text-amber-500',
    offline: 'text-gray-400',
};

export default function Index() {
    const { admins, expertiseFilters, filters } = usePage<{
        admins: Paginated<AdminCard>;
        expertiseFilters: string[];
        filters: { search?: string; expertise?: string };
    }>().props;

    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('admins.index'), { ...filters, search }, { preserveState: true });
    };

    const setExpertise = (value: string | null) => {
        router.get(route('admins.index'), { ...filters, expertise: value ?? undefined }, { preserveState: true });
    };

    return (
        <PublicLayout>
            <Head title="Pilih Admin" />

            <div className="mx-auto max-w-6xl px-4 py-12">
                <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Siapa yang ingin Anda hubungi?</h1>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    Pilih admin berdasarkan bidang keahlian yang sesuai dengan pertanyaan Anda.
                </p>

                <form onSubmit={submitSearch} className="mt-6 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                        <Input className="pl-9" placeholder="Cari admin..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Button type="submit">Cari</Button>
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant={!filters.expertise ? 'default' : 'outline'} onClick={() => setExpertise(null)}>
                        Semua
                    </Button>
                    {expertiseFilters.map((f) => (
                        <Button key={f} size="sm" variant={filters.expertise === f ? 'default' : 'outline'} onClick={() => setExpertise(f)}>
                            {f}
                        </Button>
                    ))}
                </div>

                {admins.data.length === 0 ? (
                    <p className="mt-12 text-center text-sm text-[var(--color-muted-foreground)]">
                        Saat ini belum ada admin yang tersedia.
                    </p>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {admins.data.map((admin) => (
                            <Card key={admin.id}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-navy-100)] text-lg font-semibold text-[var(--color-navy-600)]">
                                            {admin.name.charAt(0)}
                                        </span>
                                        <div>
                                            <CardTitle className="text-base">{admin.name}</CardTitle>
                                            <p className="text-xs text-[var(--color-muted-foreground)]">{admin.position}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-[var(--color-muted-foreground)]">{admin.organization}</p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {admin.expertise.slice(0, 3).map((e) => <Badge key={e} variant="outline">{e}</Badge>)}
                                    </div>
                                    <div className="mt-3 flex items-center gap-1.5 text-xs">
                                        <Circle className={`h-2.5 w-2.5 fill-current ${STATUS_COLOR[admin.status]}`} />
                                        <span className="text-[var(--color-muted-foreground)]">{STATUS_LABEL[admin.status]}</span>
                                    </div>
                                    <Button className="mt-4 w-full" size="sm" asChild>
                                        <Link href={route('admins.show', admin.id)}>Lihat Profil</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Pagination links={admins.links} />
            </div>
        </PublicLayout>
    );
}
