import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';

interface AdminData {
    id: number;
    name: string;
    email: string;
    position: string | null;
    organization: string | null;
    bio: string | null;
    expertise: string[];
    is_active: boolean;
}

export default function Edit() {
    const { admin } = usePage<{ admin: AdminData }>().props;

    const { data, setData, put, transform, processing, errors } = useForm({
        name: admin.name,
        email: admin.email,
        password: '',
        password_confirmation: '',
        position: admin.position ?? '',
        organization: admin.organization ?? '',
        bio: admin.bio ?? '',
        expertise: admin.expertise.join(', '),
        is_active: admin.is_active as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => ({
            ...d,
            expertise: d.expertise ? d.expertise.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        }));
        put(route('admin.admins.update', admin.id));
    };

    return (
        <SuperAdminLayout>
            <Head title={`Edit ${admin.name}`} />

            <h1 className="text-2xl font-bold text-[var(--color-green-700)]">Edit Admin</h1>

            <Card className="mt-6 max-w-2xl">
                <CardHeader><CardTitle>Akun & Profil Admin</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input id="name" className="mt-1" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" className="mt-1" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="password">Kata Sandi Baru (opsional)</Label>
                                <Input id="password" type="password" className="mt-1" placeholder="Kosongkan jika tidak diubah" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi</Label>
                                <Input id="password_confirmation" type="password" className="mt-1" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="position">Jabatan</Label>
                                <Input id="position" className="mt-1" value={data.position} onChange={(e) => setData('position', e.target.value)} />
                                <InputError message={errors.position} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="organization">Organisasi</Label>
                                <Input id="organization" className="mt-1" value={data.organization} onChange={(e) => setData('organization', e.target.value)} />
                                <InputError message={errors.organization} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="bio">Biografi Singkat</Label>
                            <Textarea id="bio" className="mt-1" value={data.bio} onChange={(e) => setData('bio', e.target.value)} />
                            <InputError message={errors.bio} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="expertise">Keahlian (pisahkan dengan koma)</Label>
                            <Input id="expertise" className="mt-1" value={data.expertise} onChange={(e) => setData('expertise', e.target.value)} />
                            <InputError message={errors.expertise} className="mt-1" />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                            Akun aktif
                        </label>
                        <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                    </form>
                </CardContent>
            </Card>
        </SuperAdminLayout>
    );
}
