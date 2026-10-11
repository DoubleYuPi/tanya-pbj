import { Head } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Input } from '@/Components/ui/input';
import { ChevronDown, Search } from 'lucide-react';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
}

interface Category {
    id: number;
    name: string;
    faqs: FaqItem[];
}

export default function Index({ categories }: { categories: Category[] }) {
    const [query, setQuery] = useState('');
    const q = query.trim().toLowerCase();

    const visible = categories
        .map((c) => ({
            ...c,
            faqs: c.faqs.filter(
                (f) => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
            ),
        }))
        .filter((c) => c.faqs.length > 0);

    return (
        <PublicLayout>
            <Head title="FAQ" />

            <div className="mx-auto max-w-3xl px-4 py-12">
                <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Pertanyaan yang Sering Diajukan</h1>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    Jawaban atas pertanyaan umum seputar Pengadaan Barang/Jasa dan layanan UKPBJ.
                </p>

                <div className="relative mt-6">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                    <Input
                        className="pl-9"
                        placeholder="Cari pertanyaan..."
                        aria-label="Cari pertanyaan"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                {!q && categories.length > 1 && (
                    <nav aria-label="Kategori FAQ" className="mt-4 flex flex-wrap gap-2">
                        {categories.map((c) => (
                            <a
                                key={c.id}
                                href={`#faq-${c.id}`}
                                className="rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5 text-sm font-medium text-[var(--color-navy-700)] hover:bg-[var(--color-muted)]"
                            >
                                {c.name}
                            </a>
                        ))}
                    </nav>
                )}

                {categories.length === 0 ? (
                    <p className="mt-12 text-center text-sm text-[var(--color-muted-foreground)]">
                        Belum ada pertanyaan yang tersedia.
                    </p>
                ) : visible.length === 0 ? (
                    <p className="mt-12 text-center text-sm text-[var(--color-muted-foreground)]">
                        Tidak ada pertanyaan yang cocok dengan pencarian Anda.
                    </p>
                ) : (
                    <div className="mt-8 space-y-8">
                        {visible.map((c) => (
                            <section key={c.id} id={`faq-${c.id}`} className="scroll-mt-20">
                                <h2 className="text-lg font-semibold text-[var(--color-navy-700)]">{c.name}</h2>
                                <div className="mt-3 divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-white">
                                    {c.faqs.map((f) => (
                                        <details key={f.id} className="group" open={q !== ''}>
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                                                <span>{f.question}</span>
                                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                                            </summary>
                                            <p className="whitespace-pre-line px-4 pb-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                                                {f.answer}
                                            </p>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
