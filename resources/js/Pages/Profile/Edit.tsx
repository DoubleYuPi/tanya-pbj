import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import { PageProps } from '@/types';

// Profile is shared across all three roles (spec Part 31/32), so it picks
// its layout at runtime based on the logged-in user's role rather than
// having three near-duplicate profile pages.
const LAYOUTS = { user: UserLayout, admin: AdminLayout, super_admin: SuperAdminLayout } as const;

export default function Edit({ mustVerifyEmail, satuanKerjaOptions }: { mustVerifyEmail: boolean; satuanKerjaOptions: string[] }) {
    const { auth } = usePage<PageProps>().props;
    const Layout = LAYOUTS[auth.user?.role ?? 'user'];

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        phone: auth.user?.phone ?? '',
        satuan_kerja: auth.user?.satuan_kerja ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <Layout>
            <Head title="Profil Saya" />

            <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Profil Saya</h1>

            <Card className="mt-6 max-w-xl">
                <CardHeader>
                    <CardTitle>Informasi Profil</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nama</Label>
                            <Input id="name" className="mt-1" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" className="mt-1" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input id="phone" className="mt-1" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            <InputError message={errors.phone} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="satuan_kerja">Nama Satuan Kerja</Label>
                            <select
                                id="satuan_kerja"
                                className="mt-1 flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                                value={data.satuan_kerja}
                                onChange={(e) => setData('satuan_kerja', e.target.value)}
                            >
                                <option value="">Pilih satuan kerja Anda...</option>
                                {satuanKerjaOptions.map((unit) => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                            <InputError message={errors.satuan_kerja} className="mt-1" />
                        </div>

                        {mustVerifyEmail && auth.user?.email_verified_at === null && (
                            <p className="text-sm text-amber-600">
                                Email Anda belum diverifikasi.{' '}
                                <Link href={route('verification.send')} method="post" as="button" className="underline">
                                    Klik untuk kirim ulang email verifikasi.
                                </Link>
                            </p>
                        )}

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>Simpan</Button>
                            {recentlySuccessful && <span className="text-sm text-emerald-600">Tersimpan.</span>}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </Layout>
    );
}
