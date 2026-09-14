import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Daftar" />

            <h1 className="text-xl font-bold text-[var(--color-navy-700)]">Buat Akun Baru</h1>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Daftar untuk mulai konsultasi dengan admin PBJ.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" className="mt-1" value={data.name} autoFocus autoComplete="name"
                        onChange={(e) => setData('name', e.target.value)} />
                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" className="mt-1" value={data.email} autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)} />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="phone">Nomor Telepon (opsional)</Label>
                    <Input id="phone" className="mt-1" value={data.phone} autoComplete="tel"
                        onChange={(e) => setData('phone', e.target.value)} />
                    <InputError message={errors.phone} className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input id="password" type="password" className="mt-1" value={data.password} autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)} />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi</Label>
                    <Input id="password_confirmation" type="password" className="mt-1" value={data.password_confirmation}
                        autoComplete="new-password" onChange={(e) => setData('password_confirmation', e.target.value)} />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    Daftar
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
                Sudah punya akun?{' '}
                <Link href={route('login')} className="font-medium text-[var(--color-primary)] hover:underline">
                    Masuk
                </Link>
            </p>
        </GuestLayout>
    );
}
