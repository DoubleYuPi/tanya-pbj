import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';
import { PageProps } from '@/types';
import { Circle, MessageCircleQuestion } from 'lucide-react';

interface AdminDetail {
    id: number;
    name: string;
    position: string | null;
    organization: string | null;
    bio: string | null;
    expertise: string[];
    status: 'online' | 'away' | 'offline';
}

interface Stats {
    totalConsultations: number;
    answeredQuestions: number;
    averageResponseTime: string | null;
}

const STATUS_LABEL: Record<string, string> = {
    online: 'Admin tersedia',
    away: 'Sedang sibuk',
    offline: 'Admin sedang tidak tersedia',
};

const STATUS_COLOR: Record<string, string> = {
    online: 'text-emerald-500',
    away: 'text-amber-500',
    offline: 'text-gray-400',
};

export default function Show() {
    const { auth, admin, stats } = usePage<PageProps<{ admin: AdminDetail; stats: Stats }>>().props;

    const { data, setData, post, processing, errors } = useForm({
        admin_id: admin.id,
        message: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('chat.store'));
    };

    return (
        <PublicLayout>
            <Head title={admin.name} />

            <div className="mx-auto max-w-3xl px-4 py-12">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-navy-100)] text-2xl font-semibold text-[var(--color-navy-600)]">
                                {admin.name.charAt(0)}
                            </span>
                            <div>
                                <CardTitle className="text-xl">{admin.name}</CardTitle>
                                <p className="text-sm text-[var(--color-muted-foreground)]">{admin.position}</p>
                                <p className="text-sm text-[var(--color-muted-foreground)]">{admin.organization}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1.5 text-sm">
                            <Circle className={`h-2.5 w-2.5 fill-current ${STATUS_COLOR[admin.status]}`} />
                            <span className="text-[var(--color-muted-foreground)]">{STATUS_LABEL[admin.status]}</span>
                        </div>

                        {admin.bio && <p className="mt-4 text-sm text-[var(--color-foreground)]">{admin.bio}</p>}

                        {admin.expertise.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {admin.expertise.map((e) => <Badge key={e}>{e}</Badge>)}
                            </div>
                        )}

                        <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-[var(--color-border)] pt-4 text-center text-sm">
                            <div>
                                <dt className="text-[var(--color-muted-foreground)]">Konsultasi</dt>
                                <dd className="text-lg font-semibold">{stats.totalConsultations}</dd>
                            </div>
                            <div>
                                <dt className="text-[var(--color-muted-foreground)]">Terjawab</dt>
                                <dd className="text-lg font-semibold">{stats.answeredQuestions}</dd>
                            </div>
                            <div>
                                <dt className="text-[var(--color-muted-foreground)]">Waktu Respon</dt>
                                <dd className="text-lg font-semibold">{stats.averageResponseTime ?? '—'}</dd>
                            </div>
                        </dl>

                        {!auth.user ? (
                            <Button className="mt-6 w-full" asChild>
                                <Link href={route('login')}>Masuk untuk Mulai Konsultasi</Link>
                            </Button>
                        ) : auth.user.role === 'user' ? (
                            <form onSubmit={submit} className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-6">
                                <label htmlFor="message" className="text-sm font-medium">
                                    Mulai Konsultasi
                                </label>
                                <Textarea
                                    id="message"
                                    placeholder="Tuliskan pertanyaan Anda mengenai Pengadaan Barang/Jasa..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                />
                                <InputError message={errors.message} />
                                <Button type="submit" className="w-full" disabled={processing || !data.message.trim()}>
                                    <MessageCircleQuestion className="h-4 w-4" /> Kirim Pertanyaan
                                </Button>
                            </form>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
