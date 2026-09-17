import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Search as SearchIcon, ScrollText, UserCog } from 'lucide-react';

interface RegulationResult {
    id: number;
    title: string;
    year: number;
    document_number: string | null;
    category: string;
}

interface AdminResult {
    id: number;
    name: string;
    position: string | null;
    organization: string | null;
    expertise: string[];
}

export default function Index() {
    const { term, regulations, admins, counts } = usePage<{
        term: string;
        regulations: RegulationResult[];
        admins: AdminResult[];
        counts: { regulations: number; admins: number };
    }>().props;

    const [q, setQ] = useState(term ?? '');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('search'), { q }, { preserveState: true });
    };

    const hasResults = regulations.length > 0 || admins.length > 0;

    return (
        <PublicLayout>
            <Head title={term ? `Cari: ${term}` : 'Pencarian'} />

            <div className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Pencarian</h1>

                <form onSubmit={submit} className="mt-4 flex gap-2">
                    <div className="relative flex-1">
                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                        <Input
                            className="pl-9"
                            placeholder="Cari peraturan, nomor, topik, atau kata kunci..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <Button type="submit">Cari</Button>
                </form>

                {term === '' ? (
                    <p className="mt-10 text-center text-sm text-[var(--color-muted-foreground)]">
                        Masukkan kata kunci untuk mulai mencari.
                    </p>
                ) : !hasResults ? (
                    <p className="mt-10 text-center text-sm text-[var(--color-muted-foreground)]">
                        Tidak ada hasil untuk "{term}".
                    </p>
                ) : (
                    <div className="mt-8 space-y-8">
                        {regulations.length > 0 && (
                            <section>
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-navy-700)]">
                                    <ScrollText className="h-5 w-5" /> Peraturan
                                    <span className="text-sm font-normal text-[var(--color-muted-foreground)]">
                                        {counts.regulations} hasil
                                    </span>
                                </h2>
                                <div className="mt-3 space-y-2">
                                    {regulations.map((r) => (
                                        <Card key={r.id}>
                                            <CardContent className="p-4">
                                                <Link href={route('regulations.show', r.id)} className="font-medium text-[var(--color-primary)] hover:underline">
                                                    {r.title}
                                                </Link>
                                                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                                                    <Badge variant="outline" className="mr-2">{r.category}</Badge>
                                                    {r.document_number ? `No. ${r.document_number} · ` : ''}{r.year}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                {counts.regulations > regulations.length && (
                                    <Button variant="link" className="mt-2 px-0" asChild>
                                        <Link href={route('regulations.index', { search: term })}>
                                            Lihat semua {counts.regulations} peraturan →
                                        </Link>
                                    </Button>
                                )}
                            </section>
                        )}

                        {admins.length > 0 && (
                            <section>
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-navy-700)]">
                                    <UserCog className="h-5 w-5" /> Admin
                                    <span className="text-sm font-normal text-[var(--color-muted-foreground)]">
                                        {counts.admins} hasil
                                    </span>
                                </h2>
                                <div className="mt-3 space-y-2">
                                    {admins.map((a) => (
                                        <Card key={a.id}>
                                            <CardContent className="p-4">
                                                <Link href={route('admins.show', a.id)} className="font-medium text-[var(--color-primary)] hover:underline">
                                                    {a.name}
                                                </Link>
                                                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                                                    {a.position} · {a.organization}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {a.expertise.map((e) => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
