import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <h1 className="text-xl font-bold text-[var(--color-navy-700)]">Verifikasi Alamat Email Anda</h1>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                Terima kasih telah mendaftar. Sebelum melanjutkan, mohon verifikasi email Anda melalui tautan yang
                telah kami kirimkan.
            </p>

            {status === 'verification-link-sent' && (
                <div className="mt-4 text-sm font-medium text-emerald-600">
                    Tautan verifikasi baru telah dikirim ke alamat email Anda.
                </div>
            )}

            <form onSubmit={submit} className="mt-6 flex items-center justify-between">
                <Button type="submit" disabled={processing}>
                    Kirim Ulang Email Verifikasi
                </Button>
                <Link href={route('logout')} method="post" as="button" className="text-sm text-[var(--color-muted-foreground)] hover:underline">
                    Keluar
                </Link>
            </form>
        </GuestLayout>
    );
}
