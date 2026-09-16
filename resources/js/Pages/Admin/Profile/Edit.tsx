import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';

interface AdminProfileData {
    name: string;
    phone: string | null;
    position: string | null;
    organization: string | null;
    bio: string | null;
    expertise: string[];
    status: 'online' | 'away' | 'offline';
}

export default function Edit() {
    const { profile } = usePage<{ profile: AdminProfileData }>().props;

    const { data, setData, patch, transform, processing, errors, recentlySuccessful } = useForm({
        name: profile.name,
        phone: profile.phone ?? '',
        position: profile.position ?? '',
        organization: profile.organization ?? '',
        bio: profile.bio ?? '',
        expertise: profile.expertise.join(', '),
        status: profile.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // expertise is stored as a JSON array — split the comma-separated
        // field client-side right before submit.
        transform((d) => ({
            ...d,
            expertise: d.expertise ? d.expertise.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        }));
        patch(route('admin.profile.update'));
    };

    return (
        <AdminLayout>
            <Head title="Profil Saya" />

            <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Profil Saya</h1>

            <Card className="mt-6 max-w-2xl">
                <CardHeader><CardTitle>Informasi Profil Admin</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Nama</Label>
                                <Input id="name" className="mt-1" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input id="phone" className="mt-1" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                <InputError message={errors.phone} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="position">Jabatan</Label>
                                <Input id="position" className="mt-1" placeholder="Procurement Specialist" value={data.position} onChange={(e) => setData('position', e.target.value)} />
                                <InputError message={errors.position} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="organization">Organisasi</Label>
                                <Input id="organization" className="mt-1" placeholder="UKPBJ Kota Pontianak" value={data.organization} onChange={(e) => setData('organization', e.target.value)} />
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
                            <Input id="expertise" className="mt-1" placeholder="Tender, E-Katalog, Kontrak" value={data.expertise} onChange={(e) => setData('expertise', e.target.value)} />
                            <InputError message={errors.expertise} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="status">Status Ketersediaan</Label>
                            <select
                                id="status"
                                className="mt-1 flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm shadow-sm"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as AdminProfileData['status'])}
                            >
                                <option value="online">Online</option>
                                <option value="away">Away</option>
                                <option value="offline">Offline</option>
                            </select>
                            <InputError message={errors.status} className="mt-1" />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>Simpan</Button>
                            {recentlySuccessful && <span className="text-sm text-emerald-600">Tersimpan.</span>}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
