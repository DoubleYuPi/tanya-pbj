import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';

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

export default function Edit() {
    const { section } = usePage<{ section: Section }>().props;

    // Remount the form whenever the set of images changes so the file input
    // and captions start fresh after each successful save.
    return <EditForm key={section.images.map((i) => i.id).join('-')} section={section} />;
}

function EditForm({ section }: { section: Section }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        content: section.content ?? '',
        captions: Object.fromEntries(section.images.map((i) => [i.id, i.caption ?? ''])) as Record<number, string>,
        remove_image_ids: [] as number[],
        new_images: [] as File[],
        new_captions: [] as string[],
    });

    const toggleRemove = (id: number) =>
        setData(
            'remove_image_ids',
            data.remove_image_ids.includes(id)
                ? data.remove_image_ids.filter((x) => x !== id)
                : [...data.remove_image_ids, id],
        );

    const onPickFiles = (files: File[]) => {
        setData((d) => ({ ...d, new_images: files, new_captions: files.map(() => '') }));
    };

    const setNewCaption = (index: number, value: string) => {
        const next = [...data.new_captions];
        next[index] = value;
        setData('new_captions', next);
    };

    const imageErrors = Object.entries(errors)
        .filter(([key]) => key.startsWith('new_images'))
        .map(([, message]) => message);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.ukpbj.update', section.key), { forceFormData: true, preserveScroll: true });
    };

    return (
        <SuperAdminLayout>
            <Head title={`Ubah ${section.title}`} />

            <Link href={route('admin.ukpbj.index')} className="text-sm text-[var(--color-muted-foreground)] hover:underline">
                &larr; Kembali ke Profil UKPBJ
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-[var(--color-green-700)]">{section.title}</h1>

            <form onSubmit={submit} className="mt-6 max-w-2xl space-y-6" encType="multipart/form-data">
                <Card>
                    <CardHeader><CardTitle>Teks</CardTitle></CardHeader>
                    <CardContent>
                        <Label htmlFor="content">Isi (kosongkan jika tidak ada)</Label>
                        <Textarea
                            id="content"
                            rows={10}
                            className="mt-1"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                        />
                        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                            Pisahkan paragraf dengan satu baris kosong.
                        </p>
                        <InputError message={errors.content} className="mt-1" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Gambar</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {section.images.length > 0 && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {section.images.map((img) => {
                                    const marked = data.remove_image_ids.includes(img.id);
                                    return (
                                        <div key={img.id} className="space-y-2">
                                            <img
                                                src={img.url}
                                                alt={img.caption ?? section.title}
                                                className={`w-full rounded-lg border border-[var(--color-border)] object-contain ${marked ? 'opacity-40' : ''}`}
                                            />
                                            <Input
                                                aria-label="Keterangan gambar"
                                                placeholder="Keterangan gambar (opsional)"
                                                value={data.captions[img.id] ?? ''}
                                                disabled={marked}
                                                onChange={(e) => setData('captions', { ...data.captions, [img.id]: e.target.value })}
                                            />
                                            <label className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" checked={marked} onChange={() => toggleRemove(img.id)} />
                                                Hapus gambar ini saat disimpan
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="new_images">Tambah gambar (JPG, PNG, WEBP, maks. 4 MB per gambar)</Label>
                            <input
                                id="new_images"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="mt-1 block w-full text-sm"
                                onChange={(e) => onPickFiles(Array.from(e.target.files ?? []))}
                            />
                            {imageErrors.map((message, i) => (
                                <InputError key={i} message={message} className="mt-1" />
                            ))}
                        </div>

                        {data.new_images.length > 0 && (
                            <div className="space-y-3">
                                {data.new_images.map((file, i) => (
                                    <div key={i}>
                                        <p className="text-sm font-medium">{file.name}</p>
                                        <Input
                                            aria-label={`Keterangan untuk ${file.name}`}
                                            className="mt-1"
                                            placeholder="Keterangan gambar (opsional)"
                                            value={data.new_captions[i] ?? ''}
                                            onChange={(e) => setNewCaption(i, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Button type="submit" disabled={processing}>Simpan perubahan</Button>
            </form>
        </SuperAdminLayout>
    );
}
