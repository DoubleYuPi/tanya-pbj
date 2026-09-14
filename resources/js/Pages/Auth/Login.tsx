import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <h1 className="text-xl font-bold text-[var(--color-navy-700)]">Masuk ke Akun Anda</h1>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Konsultasikan pertanyaan seputar Pengadaan Barang/Jasa Anda.
            </p>

            {status && <div className="mt-4 text-sm font-medium text-emerald-600">{status}</div>}

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        className="mt-1"
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input
                        id="password"
                        type="password"
                        className="mt-1"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        Ingat saya
                    </label>
                    <Link href={route('password.request')} className="text-[var(--color-primary)] hover:underline">
                        Lupa kata sandi?
                    </Link>
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    Masuk
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
                Belum punya akun?{' '}
                <Link href={route('register')} className="font-medium text-[var(--color-primary)] hover:underline">
                    Daftar
                </Link>
            </p>
        </GuestLayout>
    );
}
