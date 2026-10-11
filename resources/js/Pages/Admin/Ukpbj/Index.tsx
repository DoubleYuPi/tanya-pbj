import { Head, Link } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface SectionRow {
    id: number;
    key: string;
    title: string;
    has_content: boolean;
    images_count: number;
}

export default function Index({ sections }: { sections: SectionRow[] }) {
    return (
        <SuperAdminLayout>
            <Head title="Profil UKPBJ" />

            <h1 className="text-2xl font-bold text-[var(--color-green-700)]">Profil UKPBJ</h1>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Pilih bagian yang ingin diubah. Teks dan gambar bersifat opsional.
            </p>

            <div className="mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
                {sections.map((s) => (
                    <Card key={s.id}>
                        <CardHeader>
                            <CardTitle className="text-base">{s.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant={s.has_content ? 'default' : 'outline'}>
                                    {s.has_content ? 'Teks tersedia' : 'Belum ada teks'}
                                </Badge>
                                <Badge variant="outline">{s.images_count} gambar</Badge>
                            </div>
                            <Button size="sm" className="mt-4" asChild>
                                <Link href={route('admin.ukpbj.edit', s.key)}>Ubah</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </SuperAdminLayout>
    );
}
