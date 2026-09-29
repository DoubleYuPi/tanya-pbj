import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    description: string | null;
    regulations_count: number;
}

export default function Index() {
    const { categories } = usePage<{ categories: Category[] }>().props;
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const submitCreate: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.categories.store'), { onSuccess: () => reset() });
    };

    const startEdit = (category: Category) => {
        setEditingId(category.id);
        setData({ name: category.name, description: category.description ?? '' });
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingId === null) return;
        put(route('admin.categories.update', editingId), {
            onSuccess: () => {
                setEditingId(null);
                reset();
            },
        });
    };

    const destroy = (id: number, name: string) => {
        if (confirm(`Hapus kategori "${name}"?`)) {
            router.delete(route('admin.categories.destroy', id));
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen Kategori Peraturan" />

            <h1 className="text-2xl font-bold text-[var(--color-green-700)]">Manajemen Kategori Peraturan</h1>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Daftar Kategori</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-[var(--color-border)]">
                            {categories.map((c) => (
                                <li key={c.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium">{c.name}</p>
                                        <p className="text-xs text-[var(--color-muted-foreground)]">{c.regulations_count} peraturan</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => startEdit(c)} aria-label={`Edit kategori ${c.name}`}><Pencil className="h-4 w-4" /></Button>
                                        <Button size="sm" variant="ghost" onClick={() => destroy(c.id, c.name)} aria-label={`Hapus kategori ${c.name}`}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={editingId ? submitEdit : submitCreate} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nama</Label>
                                <Input id="name" className="mt-1" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="description">Deskripsi (opsional)</Label>
                                <Input id="description" className="mt-1" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {editingId ? 'Simpan' : <><Plus className="h-4 w-4" /> Tambah</>}
                                </Button>
                                {editingId && (
                                    <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(); }}>
                                        Batal
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
