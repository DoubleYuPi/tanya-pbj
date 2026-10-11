import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';

interface Slide {
    id: number;
    title: string | null;
    subtitle: string | null;
    image_url: string;
    link_url: string | null;
    is_active: boolean;
    sort_order: number;
}

export default function Index() {
    const { slides } = usePage<{ slides: Slide[] }>().props;

    return (
        <SuperAdminLayout>
            <Head title="Slide Beranda" />

            <h1 className="text-2xl font-bold text-[var(--color-green-700)]">Slide Beranda</h1>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Slide tampil di bagian paling atas halaman Beranda, berurutan sesuai angka urutan (terkecil lebih dulu).
                Jika tidak ada slide aktif, tampilan bawaan (judul + tombol) dipakai.
            </p>

            <Card className="mt-6 max-w-2xl">
                <CardHeader><CardTitle className="text-base">Tambah slide</CardTitle></CardHeader>
                <CardContent><SlideForm /></CardContent>
            </Card>

            {slides.length === 0 && (
                <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">Belum ada slide.</p>
            )}

            <div className="mt-6 max-w-2xl space-y-4">
                {slides.map((s) => (
                    <SlideRow key={s.id} slide={s} />
                ))}
            </div>
        </SuperAdminLayout>
    );
}

function SlideRow({ slide }: { slide: Slide }) {
    const [editing, setEditing] = useState(false);

    const remove = () => {
        if (confirm('Hapus slide ini?')) {
            router.delete(route('admin.slides.destroy', slide.id), { preserveScroll: true });
        }
    };

    if (editing) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <SlideForm slide={slide} onDone={() => setEditing(false)} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="space-y-3 pt-6">
                <img src={slide.image_url} alt={slide.title ?? 'Slide'} className="aspect-[8/3] w-full rounded-lg border border-[var(--color-border)] object-cover" />
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Urutan {slide.sort_order}</Badge>
                    <Badge variant={slide.is_active ? 'default' : 'outline'}>{slide.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                </div>
                {slide.title && <p className="font-medium">{slide.title}</p>}
                {slide.subtitle && <p className="text-sm text-[var(--color-muted-foreground)]">{slide.subtitle}</p>}
                <p className="break-all text-sm text-[var(--color-muted-foreground)]">
                    Tautan: {slide.link_url ?? 'tidak ada'}
                </p>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Ubah</Button>
                    <Button size="sm" variant="outline" onClick={remove}>Hapus</Button>
                </div>
            </CardContent>
        </Card>
    );
}

// One form for both "add" (no slide prop) and "edit".
function SlideForm({ slide, onDone }: { slide?: Slide; onDone?: () => void }) {
    const [fileKey, setFileKey] = useState(0); // remounts the file input to clear it after a successful add
    const form = useForm<{
        image: File | null;
        title: string;
        subtitle: string;
        link_url: string;
        is_active: boolean;
        sort_order: string;
    }>({
        image: null,
        title: slide?.title ?? '',
        subtitle: slide?.subtitle ?? '',
        link_url: slide?.link_url ?? '',
        is_active: slide?.is_active ?? true,
        sort_order: String(slide?.sort_order ?? 0),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                if (slide) {
                    onDone?.();
                } else {
                    form.reset();
                    setFileKey((k) => k + 1);
                }
            },
        };

        if (slide) {
            // PHP can't read multipart PUT bodies, so send POST + _method=put.
            form.transform((d) => ({ ...d, _method: 'put' }));
            form.post(route('admin.slides.update', slide.id), options);
        } else {
            form.transform((d) => ({ ...d, sort_order: undefined }));
            form.post(route('admin.slides.store'), options);
        }
    };

    const id = slide ? `slide-${slide.id}` : 'slide-new';

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <Label htmlFor={`${id}-image`}>Gambar{slide ? ' (kosongkan jika tidak diganti)' : ''}</Label>
                <Input
                    key={fileKey}
                    id={`${id}-image`}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="mt-1"
                    onChange={(e) => form.setData('image', e.target.files?.[0] ?? null)}
                />
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                    JPG/PNG/WebP, maks. 2 MB. Ukuran ideal 1920×720 px (rasio 8:3); di ponsel gambar dipotong ke rasio 16:9, jadi letakkan konten penting di tengah.
                </p>
                <InputError message={form.errors.image} className="mt-1" />
            </div>

            <div>
                <Label htmlFor={`${id}-title`}>Judul (opsional)</Label>
                <Input id={`${id}-title`} className="mt-1" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                <InputError message={form.errors.title} className="mt-1" />
            </div>

            <div>
                <Label htmlFor={`${id}-subtitle`}>Teks pendukung (opsional)</Label>
                <Input id={`${id}-subtitle`} className="mt-1" value={form.data.subtitle} onChange={(e) => form.setData('subtitle', e.target.value)} />
                <InputError message={form.errors.subtitle} className="mt-1" />
            </div>

            <div>
                <Label htmlFor={`${id}-link`}>Tautan saat slide diklik (opsional)</Label>
                <Input
                    id={`${id}-link`}
                    className="mt-1"
                    placeholder="/peraturan atau https://contoh.go.id/berita"
                    value={form.data.link_url}
                    onChange={(e) => form.setData('link_url', e.target.value)}
                />
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                    Awali dengan "/" untuk halaman di situs ini, atau "https://" untuk situs lain (dibuka di tab baru).
                </p>
                <InputError message={form.errors.link_url} className="mt-1" />
            </div>

            <div className="flex flex-wrap items-end gap-4">
                {slide && (
                    <div>
                        <Label htmlFor={`${id}-order`}>Urutan</Label>
                        <Input
                            id={`${id}-order`}
                            type="number"
                            min={0}
                            className="mt-1 w-24"
                            value={form.data.sort_order}
                            onChange={(e) => form.setData('sort_order', e.target.value)}
                        />
                        <InputError message={form.errors.sort_order} className="mt-1" />
                    </div>
                )}
                <label className="flex items-center gap-2 pb-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.data.is_active}
                        onChange={(e) => form.setData('is_active', e.target.checked)}
                    />
                    Tampilkan di Beranda
                </label>
            </div>

            <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={form.processing}>{slide ? 'Simpan' : 'Tambah slide'}</Button>
                {slide && (
                    <Button type="button" size="sm" variant="outline" onClick={() => { form.reset(); onDone?.(); }}>
                        Batal
                    </Button>
                )}
            </div>
        </form>
    );
}
