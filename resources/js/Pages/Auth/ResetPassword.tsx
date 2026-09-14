import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Atur Ulang Kata Sandi" />

            <h1 className="text-xl font-bold text-[var(--color-navy-700)]">Atur Ulang Kata Sandi</h1>

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" className="mt-1" value={data.email}
                        onChange={(e) => setData('email', e.target.value)} />
                    <InputError message={errors.email} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="password">Kata Sandi Baru</Label>
                    <Input id="password" type="password" className="mt-1" value={data.password} autoFocus
                        onChange={(e) => setData('password', e.target.value)} />
                    <InputError message={errors.password} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi</Label>
                    <Input id="password_confirmation" type="password" className="mt-1" value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)} />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>
                <Button type="submit" className="w-full" disabled={processing}>
                    Atur Ulang Kata Sandi
                </Button>
            </form>
        </GuestLayout>
    );
}
