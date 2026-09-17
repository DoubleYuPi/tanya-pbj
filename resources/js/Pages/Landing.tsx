import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Search, UserCog, MessageCircleQuestion, CheckCircle2, Lightbulb } from 'lucide-react';

// Landing page per spec Part 10/11. Stats and "peraturan populer" are
// left as static placeholders for now — they become real database-backed
// figures once the regulation library (Phase 3) and chat (Phase 5) exist,
// per the "do not hard-code data that should come from the database"
// rule for anything beyond this initial scaffold.
export default function Landing() {
    return (
        <PublicLayout>
            <Head title="Beranda" />

            <section className="bg-[var(--color-navy-700)] px-4 py-20 text-white">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
                        Temukan Jawaban Seputar Pengadaan Barang/Jasa
                    </h1>
                    <p className="mt-4 text-base text-white/80 sm:text-lg">
                        Konsultasikan pertanyaan Anda mengenai Pengadaan Barang/Jasa Pemerintah dengan admin
                        dan tenaga yang berpengalaman.
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button size="lg" variant="secondary" asChild>
                            <Link href={route('register')}>Mulai Konsultasi</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10" asChild>
                            <Link href={route('regulations.index')}>Cari Peraturan</Link>
                        </Button>
                    </div>

                    <form action={route('search')} method="get" className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl bg-white p-2 shadow-lg">
                        <Search className="ml-2 h-5 w-5 text-[var(--color-muted-foreground)]" />
                        <Input
                            name="q"
                            className="border-0 shadow-none focus-visible:ring-0"
                            placeholder="Cari peraturan, nomor, topik, atau kata kunci..."
                        />
                        <Button type="submit">Cari</Button>
                    </form>
                </div>
            </section>

            <section id="cara-kerja" className="mx-auto max-w-5xl px-4 py-16">
                <h2 className="text-center text-2xl font-bold text-[var(--color-navy-700)]">Cara Kerja</h2>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
                    <StepCard n={1} icon={UserCog} title="Pilih Admin" />
                    <StepCard n={2} icon={MessageCircleQuestion} title="Tanyakan Pertanyaan" />
                    <StepCard n={3} icon={Lightbulb} title="Dapatkan Jawaban" />
                    <StepCard n={4} icon={CheckCircle2} title="Temukan Solusi" />
                </div>
            </section>

            <section id="tanya-admin" className="mx-auto max-w-6xl px-4 py-12">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FeatureCard
                        icon={MessageCircleQuestion}
                        title="Tanya Admin"
                        description="Pilih admin sesuai bidang keahlian dan mulai konsultasi langsung."
                    />
                    <FeatureCard
                        icon={Search}
                        title="Peraturan"
                        description="Telusuri Perpres, Permen, Perda, dan regulasi pengadaan lainnya."
                    />
                    <FeatureCard
                        icon={CheckCircle2}
                        title="Terpercaya"
                        description="Dikelola oleh admin dan tenaga ahli pengadaan yang berpengalaman."
                    />
                </div>
            </section>

            <section id="peraturan" className="mx-auto max-w-6xl px-4 py-12">
                <h2 className="text-2xl font-bold text-[var(--color-navy-700)]">Peraturan Populer</h2>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    Telusuri seluruh Perpres, Permen, Perda, dan regulasi pengadaan lainnya.
                </p>
                <Button className="mt-4" variant="outline" asChild>
                    <Link href={route('regulations.index')}>Lihat Semua Peraturan</Link>
                </Button>
            </section>
        </PublicLayout>
    );
}

function StepCard({ n, icon: Icon, title }: { n: number; icon: typeof Search; title: string }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-emerald-50)] text-[var(--color-emerald-600)]">
                <Icon className="h-6 w-6" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">Langkah {n}</p>
            <p className="mt-1 font-semibold text-[var(--color-navy-700)]">{title}</p>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Search; title: string; description: string }) {
    return (
        <Card>
            <CardHeader>
                <Icon className="h-8 w-8 text-[var(--color-secondary)]" />
                <CardTitle className="mt-2">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-[var(--color-muted-foreground)]">{description}</p>
            </CardContent>
        </Card>
    );
}
