import { Head, Link, router, usePage } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import Pagination from '@/Components/Pagination';
import { Paginated } from '@/types/pagination';
import { Eye, BookmarkX } from 'lucide-react';

interface BookmarkedRegulation {
    id: number;
    title: string;
    year: number;
    document_number: string | null;
    category: { id: number; name: string };
}

export default function Bookmarks() {
    const { regulations } = usePage<{ regulations: Paginated<BookmarkedRegulation> }>().props;

    const removeBookmark = (id: number) => {
        router.delete(route('regulations.unbookmark', id), { preserveScroll: true });
    };

    return (
        <UserLayout>
            <Head title="Peraturan Tersimpan" />

            <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Peraturan Tersimpan</h1>

            {regulations.data.length === 0 ? (
                <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">
                    Belum ada peraturan yang tersedia dalam daftar tersimpan Anda.
                </p>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {regulations.data.map((r) => (
                        <Card key={r.id}>
                            <CardHeader>
                                <Badge>{r.category.name}</Badge>
                                <CardTitle className="mt-2 line-clamp-2 text-base">{r.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-[var(--color-muted-foreground)]">
                                    {r.document_number ? `No. ${r.document_number} · ` : ''}{r.year}
                                </p>
                                <div className="mt-4 flex gap-2">
                                    <Button size="sm" asChild>
                                        <Link href={route('regulations.show', r.id)}><Eye className="h-4 w-4" /> Lihat</Link>
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => removeBookmark(r.id)}>
                                        <BookmarkX className="h-4 w-4" /> Hapus
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Pagination links={regulations.links} />
        </UserLayout>
    );
}
