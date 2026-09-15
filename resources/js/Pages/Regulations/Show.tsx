import { Head, Link, router, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { PageProps } from '@/types';
import { Download, Bookmark, BookmarkCheck, Maximize2 } from 'lucide-react';

interface RegulationDetail {
    id: number;
    title: string;
    document_number: string | null;
    year: number;
    issuing_institution: string | null;
    effective_date: string | null;
    description: string | null;
    is_sample_data: boolean;
    category: { id: number; name: string };
    tags: { id: number; name: string }[];
}

interface RelatedRegulation {
    id: number;
    title: string;
    year: number;
    document_number: string | null;
}

export default function Show() {
    const { regulation, related, isBookmarked, auth } = usePage<PageProps<{
        regulation: RegulationDetail;
        related: RelatedRegulation[];
        isBookmarked: boolean;
    }>>().props;

    const toggleBookmark = () => {
        if (isBookmarked) {
            router.delete(route('regulations.unbookmark', regulation.id), { preserveScroll: true });
        } else {
            router.post(route('regulations.bookmark', regulation.id), {}, { preserveScroll: true });
        }
    };

    return (
        <PublicLayout>
            <Head title={regulation.title} />

            <div className="mx-auto max-w-5xl px-4 py-12">
                <div className="flex items-center gap-2">
                    <Badge>{regulation.category.name}</Badge>
                    {regulation.is_sample_data && <Badge variant="outline">DATA CONTOH</Badge>}
                </div>

                <h1 className="mt-3 text-2xl font-bold text-[var(--color-navy-700)]">{regulation.title}</h1>

                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    <div>
                        <dt className="text-[var(--color-muted-foreground)]">Nomor</dt>
                        <dd className="font-medium">{regulation.document_number ?? '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-[var(--color-muted-foreground)]">Tahun</dt>
                        <dd className="font-medium">{regulation.year}</dd>
                    </div>
                    <div>
                        <dt className="text-[var(--color-muted-foreground)]">Instansi</dt>
                        <dd className="font-medium">{regulation.issuing_institution ?? '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-[var(--color-muted-foreground)]">Berlaku Sejak</dt>
                        <dd className="font-medium">{regulation.effective_date ?? '—'}</dd>
                    </div>
                </dl>

                {regulation.description && (
                    <p className="mt-4 text-sm text-[var(--color-foreground)]">{regulation.description}</p>
                )}

                {regulation.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {regulation.tags.map((t) => <Badge key={t.id} variant="outline">{t.name}</Badge>)}
                    </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild>
                        <a href={route('regulations.download', regulation.id)}><Download className="h-4 w-4" /> Download</a>
                    </Button>
                    <Button variant="outline" asChild>
                        <a href={route('regulations.preview', regulation.id)} target="_blank" rel="noreferrer">
                            <Maximize2 className="h-4 w-4" /> Buka Layar Penuh
                        </a>
                    </Button>
                    {auth.user && (
                        <Button variant="outline" onClick={toggleBookmark}>
                            {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            {isBookmarked ? 'Tersimpan' : 'Simpan'}
                        </Button>
                    )}
                </div>

                <Card className="mt-8">
                    <CardHeader><CardTitle>Pratinjau Dokumen</CardTitle></CardHeader>
                    <CardContent>
                        <iframe
                            src={route('regulations.preview', regulation.id)}
                            className="h-[70vh] w-full rounded-lg border border-[var(--color-border)]"
                            title={regulation.title}
                        />
                    </CardContent>
                </Card>

                {related.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-[var(--color-navy-700)]">Peraturan Terkait</h2>
                        <ul className="mt-3 space-y-2">
                            {related.map((r) => (
                                <li key={r.id}>
                                    <Link href={route('regulations.show', r.id)} className="text-sm text-[var(--color-primary)] hover:underline">
                                        {r.title} {r.document_number ? `(No. ${r.document_number}/${r.year})` : `(${r.year})`}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
