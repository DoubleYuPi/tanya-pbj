import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Instagram } from 'lucide-react';
import SapaChatbot from '@/Components/SapaChatbot';
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

            <section className="bg-[var(--color-green-700)] px-4 py-20 text-white">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
                        Temukan Jawaban Seputar Pengadaan Barang/Jasa
                    </h1>
                    <p className="mt-4 text-base text-white/80 sm:text-lg">
                        Konsultasi/diskusikan permasalahan Anda tentang Pengadaan Barang/Jasa Pemerintah.
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
                            className="border-0 bg-transparent text-gray-900 shadow-none placeholder:text-gray-500 focus-visible:ring-0"
                            placeholder="Cari peraturan, nomor, topik, atau kata kunci..." 
                            aria-label="Cari peraturan, nomor, topik, atau kata kunci"
                        />
                        <Button type="submit">Cari</Button>
                    </form>
                </div>
            </section>

            <section id="cara-kerja" className="mx-auto max-w-5xl px-4 py-16">
                <h2 className="text-center text-2xl font-bold text-[var(--color-green-700)]">Standar Operasional prosedur</h2>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
                    <StepCard n={1} icon={UserCog} title="Pilih Admin" />
                    <StepCard n={2} icon={MessageCircleQuestion} title="Ajukan Pertanyaan" />
                    <StepCard n={3} icon={Lightbulb} title="Dapatkan Jawaban" />
                    <StepCard n={4} icon={CheckCircle2} title="Temukan Solusi" />
                </div>
            </section>

            <section id="tanya-admin" className="mx-auto max-w-6xl px-4 py-12">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FeatureCard
                        icon={MessageCircleQuestion}
                        title="Tanya Admin"
                        description="Pilih admin sesuai kebutuhan (Pengelolaan PBJ, LPSE, Pembinaan Advokasi PBJ) dan mulai konsultasi langsung."
                    />
                    <FeatureCard
                        icon={Search}
                        title="Peraturan"
                        description="Perpres, Perlem, Permen, Perda, dan regulasi pengadaan lainnya."
                    />
                    <FeatureCard
                        icon={CheckCircle2}
                        title="Terpercaya"
                        description="Dikelola oleh JF PBJ dan Tenaga Pendukung PBJ."
                    />
                </div>
            </section>

            <section id="kontak" className="bg-[var(--color-green-700)] text-white">
                <div className="mx-auto max-w-6xl px-4 py-12">
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
                        {/* Logo + alamat */}
                        <div className="lg:col-span-5">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/images/logo-pemkotptk.png"
                                    alt="Pemerintah Kota Pontianak"
                                    className="h-16 w-auto object-contain"
                                />
                                <div className="h-14 w-px bg-white/40" aria-hidden="true" />
                                <img
                                    src="/images/logo-bpbj-kotak.jpg"
                                    alt="Logo UKPBJ Kota Pontianak"
                                    className="h-16 w-auto object-contain"
                                />
                            </div>
                            <address className="mt-4 text-sm not-italic leading-relaxed text-white/90">
                                <p className="font-semibold">Pemerintah Kota Pontianak</p>
                                <p>Jl. Rahadi Usman No. 3</p>
                                <p>Kota Pontianak, Kalimantan Barat, 78111</p>
                                <p>Telp. 732570 - 733040 - 733041 - 733042</p>
                                <p>Fax. 739616</p>
                                <p>Email: pemkot@pontianak.go.id</p>
                            </address>
                        </div>


                        {/* Link terkait */}
                        <div className="lg:col-span-3">
                            <h2 className="text-lg font-semibold">Link Terkait</h2>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <a
                                        href="https://www.instagram.com/ukpbj.setda.pontianak/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-white/90 transition hover:text-white hover:underline"
                                    >
                                        <Instagram className="h-4 w-4" />
                                        @UKPBJ.SETDA.PONTIANAK
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Denah lokasi */}
                        <div className="lg:col-span-4">
                            <h2 className="text-lg font-semibold">Denah Lokasi</h2>
                            <div className="mt-4 overflow-hidden rounded-lg border border-white/20">
                                <iframe
                                    title="Lokasi Kantor Wali Kota Pontianak"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.81801439522!2d109.33558111426937!3d-0.022438035558214848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e1d585becf4ec47%3A0x8a5679e61dee167d!2sKantor+Wali+Kota+Pontianak!5e0!3m2!1sid!2sid!4v1557899143922!5m2!1sid!2sid"
                                    className="h-56 w-full border-0"
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <SapaChatbot />
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
            <p className="mt-1 font-semibold text-[var(--color-green-700)]">{title}</p>
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
