import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';

interface Category { id: number; name: string; }
interface RegulationEditData {
    id: number;
    regulation_category_id: number;
    title: string;
    document_number: string | null;
    year: number;
    issuing_institution: string | null;
    effective_date: string | null;
    description: string | null;
    status: string;
    file_original_name: string;
    tags: { id: number; name: string }[];
}

export default function Edit() {
    const { regulation, categories, maxUploadMb } = usePage<{
        regulation: RegulationEditData;
        categories: Category[];
        maxUploadMb: number;
    }>().props;

    const { data, setData, post, transform, processing, errors } = useForm({
        regulation_category_id: String(regulation.regulation_category_id),
        title: regulation.title,
        document_number: regulation.document_number ?? '',
        year: String(regulation.year),
        issuing_institution: regulation.issuing_institution ?? '',
        effective_date: regulation.effective_date ?? '',
        description: regulation.description ?? '',
        tags: regulation.tags.map((t) => t.name).join(', '),
        status: regulation.status,
        file: null as File | null,
        _method: 'put',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => ({
            ...d,
            tags: d.tags ? d.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        }));
        // Inertia uses POST + _method spoofing for multipart PUT requests
        // (browsers can't send real PUT with file uploads).
        post(route('admin.regulations.update', regulation.id), { forceFormData: true });
    };

    return (
        <SuperAdminLayout>
            <Head title="Edit Peraturan" />

            <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Edit Peraturan</h1>

            <Card className="mt-6 max-w-2xl">
                <CardHeader><CardTitle>Detail Peraturan</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                        <div>
                            <Label htmlFor="title">Judul</Label>
                            <Input id="title" className="mt-1" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                            <InputError message={errors.title} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="regulation_category_id">Jenis</Label>
                                <select
                                    id="regulation_category_id"
                                    className="mt-1 flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm shadow-sm"
                                    value={data.regulation_category_id}
                                    onChange={(e) => setData('regulation_category_id', e.target.value)}
                                >
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <InputError message={errors.regulation_category_id} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="document_number">Nomor Dokumen</Label>
                                <Input id="document_number" className="mt-1" value={data.document_number} onChange={(e) => setData('document_number', e.target.value)} />
                                <InputError message={errors.document_number} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="year">Tahun</Label>
                                <Input id="year" type="number" className="mt-1" value={data.year} onChange={(e) => setData('year', e.target.value)} />
                                <InputError message={errors.year} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="effective_date">Tanggal Berlaku</Label>
                                <Input id="effective_date" type="date" className="mt-1" value={data.effective_date} onChange={(e) => setData('effective_date', e.target.value)} />
                                <InputError message={errors.effective_date} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="issuing_institution">Instansi Penerbit</Label>
                            <Input id="issuing_institution" className="mt-1" value={data.issuing_institution} onChange={(e) => setData('issuing_institution', e.target.value)} />
                            <InputError message={errors.issuing_institution} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea id="description" className="mt-1" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            <InputError message={errors.description} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
                            <Input id="tags" className="mt-1" value={data.tags} onChange={(e) => setData('tags', e.target.value)} />
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="mt-1 flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm shadow-sm"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="published">Diterbitkan</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Diarsipkan</option>
                            </select>
                            <InputError message={errors.status} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="file">Ganti File PDF (opsional, maks. {maxUploadMb}MB)</Label>
                            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">File saat ini: {regulation.file_original_name}</p>
                            <input
                                id="file"
                                type="file"
                                accept="application/pdf"
                                className="mt-1 block w-full text-sm"
                                onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                            />
                            <InputError message={errors.file} className="mt-1" />
                        </div>

                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                    </form>
                </CardContent>
            </Card>
        </SuperAdminLayout>
    );
}
