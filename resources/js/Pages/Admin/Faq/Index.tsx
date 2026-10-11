import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import InputError from '@/Components/InputError';

interface Faq {
    id: number;
    question: string;
    answer: string;
    sort_order: number;
}

interface Category {
    id: number;
    name: string;
    sort_order: number;
    faqs: Faq[];
}

export default function Index() {
    const { categories } = usePage<{ categories: Category[] }>().props;

    const addCategory = useForm({ name: '' });

    const submitCategory: FormEventHandler = (e) => {
        e.preventDefault();
        addCategory.post(route('admin.faq.categories.store'), {
            preserveScroll: true,
            onSuccess: () => addCategory.reset(),
        });
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen FAQ" />

            <h1 className="text-2xl font-bold text-[var(--color-green-700)]">Manajemen FAQ</h1>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Kelompokkan pertanyaan berdasarkan kategori. Urutan tampil mengikuti angka urutan (terkecil lebih dulu).
            </p>

            <Card className="mt-6 max-w-2xl">
                <CardHeader><CardTitle className="text-base">Tambah kategori</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={submitCategory} className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                aria-label="Nama kategori"
                                placeholder="Contoh: Pengadaan Langsung"
                                value={addCategory.data.name}
                                onChange={(e) => addCategory.setData('name', e.target.value)}
                            />
                            <InputError message={addCategory.errors.name} className="mt-1" />
                        </div>
                        <Button type="submit" disabled={addCategory.processing}>Tambah kategori</Button>
                    </form>
                </CardContent>
            </Card>

            {categories.length === 0 && (
                <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">
                    Belum ada kategori. Tambahkan kategori pertama di atas.
                </p>
            )}

            <div className="mt-6 max-w-2xl space-y-6">
                {categories.map((c) => (
                    <CategoryCard key={c.id} category={c} />
                ))}
            </div>
        </SuperAdminLayout>
    );
}

function CategoryCard({ category }: { category: Category }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ name: category.name, sort_order: String(category.sort_order) });

    const save: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(route('admin.faq.categories.update', category.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const remove = () => {
        if (confirm(`Hapus kategori "${category.name}" beserta ${category.faqs.length} pertanyaan di dalamnya?`)) {
            router.delete(route('admin.faq.categories.destroy', category.id), { preserveScroll: true });
        }
    };

    return (
        <Card>
            <CardHeader>
                {editing ? (
                    <form onSubmit={save} className="flex flex-wrap items-start gap-2">
                        <div className="flex-1">
                            <Input
                                aria-label="Nama kategori"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                            />
                            <InputError message={form.errors.name} className="mt-1" />
                        </div>
                        <Input
                            aria-label="Urutan"
                            type="number"
                            min={0}
                            className="w-24"
                            value={form.data.sort_order}
                            onChange={(e) => form.setData('sort_order', e.target.value)}
                        />
                        <Button type="submit" size="sm" disabled={form.processing}>Simpan</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => { form.reset(); setEditing(false); }}>
                            Batal
                        </Button>
                    </form>
                ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{category.name}</CardTitle>
                            <Badge variant="outline">Urutan {category.sort_order}</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Ubah</Button>
                            <Button size="sm" variant="outline" onClick={remove}>Hapus</Button>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {category.faqs.length === 0 && (
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                        Belum ada pertanyaan di kategori ini.
                    </p>
                )}

                {category.faqs.map((f) => (
                    <FaqRow key={f.id} faq={f} />
                ))}

                <AddFaqForm categoryId={category.id} />
            </CardContent>
        </Card>
    );
}

function FaqRow({ faq }: { faq: Faq }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ question: faq.question, answer: faq.answer, sort_order: String(faq.sort_order) });

    const save: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(route('admin.faq.items.update', faq.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const remove = () => {
        if (confirm('Hapus pertanyaan ini?')) {
            router.delete(route('admin.faq.items.destroy', faq.id), { preserveScroll: true });
        }
    };

    if (editing) {
        return (
            <form onSubmit={save} className="space-y-3 rounded-lg border border-[var(--color-border)] p-3">
                <div>
                    <Label htmlFor={`q-${faq.id}`}>Pertanyaan</Label>
                    <Input
                        id={`q-${faq.id}`}
                        className="mt-1"
                        value={form.data.question}
                        onChange={(e) => form.setData('question', e.target.value)}
                    />
                    <InputError message={form.errors.question} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor={`a-${faq.id}`}>Jawaban</Label>
                    <Textarea
                        id={`a-${faq.id}`}
                        rows={5}
                        className="mt-1"
                        value={form.data.answer}
                        onChange={(e) => form.setData('answer', e.target.value)}
                    />
                    <InputError message={form.errors.answer} className="mt-1" />
                </div>
                <div className="flex items-end gap-2">
                    <div>
                        <Label htmlFor={`o-${faq.id}`}>Urutan</Label>
                        <Input
                            id={`o-${faq.id}`}
                            type="number"
                            min={0}
                            className="mt-1 w-24"
                            value={form.data.sort_order}
                            onChange={(e) => form.setData('sort_order', e.target.value)}
                        />
                    </div>
                    <Button type="submit" size="sm" disabled={form.processing}>Simpan</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => { form.reset(); setEditing(false); }}>
                        Batal
                    </Button>
                </div>
            </form>
        );
    }

    return (
        <div className="rounded-lg border border-[var(--color-border)] p-3">
            <p className="font-medium">{faq.question}</p>
            <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-[var(--color-muted-foreground)]">{faq.answer}</p>
            <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Ubah</Button>
                <Button size="sm" variant="outline" onClick={remove}>Hapus</Button>
            </div>
        </div>
    );
}

function AddFaqForm({ categoryId }: { categoryId: number }) {
    const form = useForm({ question: '', answer: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('admin.faq.items.store', categoryId), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3 border-t border-[var(--color-border)] pt-4">
            <p className="text-sm font-medium">Tambah pertanyaan</p>
            <div>
                <Input
                    aria-label="Pertanyaan"
                    placeholder="Pertanyaan"
                    value={form.data.question}
                    onChange={(e) => form.setData('question', e.target.value)}
                />
                <InputError message={form.errors.question} className="mt-1" />
            </div>
            <div>
                <Textarea
                    aria-label="Jawaban"
                    placeholder="Jawaban"
                    rows={4}
                    value={form.data.answer}
                    onChange={(e) => form.setData('answer', e.target.value)}
                />
                <InputError message={form.errors.answer} className="mt-1" />
            </div>
            <Button type="submit" size="sm" disabled={form.processing}>Tambah pertanyaan</Button>
        </form>
    );
}
