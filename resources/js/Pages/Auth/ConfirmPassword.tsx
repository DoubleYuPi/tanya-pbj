import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Kata Sandi" />

            <p className="text-sm text-[var(--color-muted-foreground)]">
                Ini adalah area rahasia aplikasi. Mohon konfirmasi kata sandi Anda sebelum melanjutkan.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input id="password" type="password" className="mt-1" value={data.password} autoFocus
                        onChange={(e) => setData('password', e.target.value)} />
                    <InputError message={errors.password} className="mt-1" />
                </div>
                <Button type="submit" className="w-full" disabled={processing}>
                    Konfirmasi
                </Button>
            </form>
        </GuestLayout>
    );
}
