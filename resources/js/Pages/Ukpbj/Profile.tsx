import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface SectionImage {
    id: number;
    url: string;
    caption: string | null;
}

interface Section {
    id: number;
    key: string;
    title: string;
    content: string | null;
    images: SectionImage[];
}

export default function Profile({ sections }: { sections: Section[] }) {
    return (
        <PublicLayout>
            <Head title="Profil UKPBJ" />

            <div className="mx-auto max-w-4xl px-4 py-12">
                <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Profil UKPBJ</h1>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    Mengenal Unit Kerja Pengadaan Barang/Jasa: visi misi, maklumat pelayanan, regulasi, dan SOP.
                </p>

                <nav aria-label="Bagian profil" className="mt-6 flex flex-wrap gap-2">
                    {sections.map((s) => (
                        <a
                            key={s.key}
                            href={`#${s.key}`}
                            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5 text-sm font-medium text-[var(--color-navy-700)] hover:bg-[var(--color-muted)]"
                        >
                            {s.title}
                        </a>
                    ))}
                </nav>

                <div className="mt-8 space-y-6">
                    {sections.map((s) => {
                        const paragraphs = s.content ? s.content.split(/\n{2,}/).filter((p) => p.trim() !== '') : [];
                        const isEmpty = paragraphs.length === 0 && s.images.length === 0;

                        return (
                            <section key={s.key} id={s.key} className="scroll-mt-20">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl text-[var(--color-navy-700)]">{s.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {isEmpty && (
                                            <p className="text-sm text-[var(--color-muted-foreground)]">
                                                Konten bagian ini belum tersedia.
                                            </p>
                                        )}

                                        {paragraphs.map((p, i) => (
                                            <p key={i} className="whitespace-pre-line leading-relaxed">
                                                {p}
                                            </p>
                                        ))}

                                        {s.images.length > 0 && (
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                {s.images.map((img) => (
                                                    <figure key={img.id}>
                                                        <a href={img.url} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={img.url}
                                                                alt={img.caption ?? s.title}
                                                                loading="lazy"
                                                                className="w-full rounded-lg border border-[var(--color-border)] object-contain"
                                                            />
                                                        </a>
                                                        {img.caption && (
                                                            <figcaption className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                                                                {img.caption}
                                                            </figcaption>
                                                        )}
                                                    </figure>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </section>
                        );
                    })}
                </div>
            </div>
        </PublicLayout>
    );
}
