import { Head, Link, usePage } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface UserDetail {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    satuan_kerja: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
}

export default function Show() {
    const { user, conversationCount } = usePage<{ user: UserDetail; conversationCount: number }>().props;

    return (
        <SuperAdminLayout>
            <Head title={user.name} />

            <Button variant="link" asChild className="px-0">
                <Link href={route('admin.users.index')}>← Kembali ke daftar pengguna</Link>
            </Button>

            <Card className="mt-2 max-w-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{user.name}</CardTitle>
                        <Badge variant={user.is_active ? 'secondary' : 'destructive'}>
                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                            <dt className="text-[var(--color-muted-foreground)]">Email</dt>
                            <dd>{user.email}</dd>
                        </div>
                        <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                            <dt className="text-[var(--color-muted-foreground)]">Telepon</dt>
                            <dd>{user.phone ?? '—'}</dd>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-[var(--color-border)] pb-2">
                            <dt className="shrink-0 text-[var(--color-muted-foreground)]">Satuan Kerja</dt>
                            <dd className="text-right">{user.satuan_kerja ?? '—'}</dd>
                        </div>
                        <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                            <dt className="text-[var(--color-muted-foreground)]">Jumlah Konsultasi</dt>
                            <dd>{conversationCount}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-[var(--color-muted-foreground)]">Terdaftar</dt>
                            <dd>{user.created_at}</dd>
                        </div>
                    </dl>
                    <p className="mt-4 text-xs text-[var(--color-muted-foreground)]">
                        Isi percakapan pengguna bersifat privat dan tidak ditampilkan di halaman ini.
                    </p>
                </CardContent>
            </Card>
        </SuperAdminLayout>
    );
}
