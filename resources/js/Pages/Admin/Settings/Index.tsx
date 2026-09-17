import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';

interface SettingsData {
    app_tagline: string;
    registration_enabled: boolean;
    regulation_max_upload_mb: number;
    attachment_max_upload_mb: number;
}

export default function Index() {
    const { settings } = usePage<{ settings: SettingsData }>().props;

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        app_tagline: settings.app_tagline,
        registration_enabled: settings.registration_enabled,
        regulation_max_upload_mb: settings.regulation_max_upload_mb,
        attachment_max_upload_mb: settings.attachment_max_upload_mb,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('admin.settings.update'));
    };

    return (
        <SuperAdminLayout>
            <Head title="Pengaturan Sistem" />

            <h1 className="text-2xl font-bold text-[var(--color-navy-700)]">Pengaturan Sistem</h1>

            <Card className="mt-6 max-w-xl">
                <CardHeader><CardTitle>Umum</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="app_tagline">Tagline Aplikasi</Label>
                            <Input
                                id="app_tagline"
                                className="mt-1"
                                value={data.app_tagline}
                                onChange={(e) => setData('app_tagline', e.target.value)}
                            />
                            <InputError message={errors.app_tagline} className="mt-1" />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.registration_enabled}
                                onChange={(e) => setData('registration_enabled', e.target.checked)}
                            />
                            Izinkan pendaftaran akun baru
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="regulation_max_upload_mb">Ukuran Maks. PDF Peraturan (MB)</Label>
                                <Input
                                    id="regulation_max_upload_mb"
                                    type="number"
                                    className="mt-1"
                                    value={data.regulation_max_upload_mb}
                                    onChange={(e) => setData('regulation_max_upload_mb', Number(e.target.value))}
                                />
                                <InputError message={errors.regulation_max_upload_mb} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="attachment_max_upload_mb">Ukuran Maks. Lampiran Chat (MB)</Label>
                                <Input
                                    id="attachment_max_upload_mb"
                                    type="number"
                                    className="mt-1"
                                    value={data.attachment_max_upload_mb}
                                    onChange={(e) => setData('attachment_max_upload_mb', Number(e.target.value))}
                                />
                                <InputError message={errors.attachment_max_upload_mb} className="mt-1" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>Simpan Pengaturan</Button>
                            {recentlySuccessful && <span className="text-sm text-emerald-600">Tersimpan.</span>}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </SuperAdminLayout>
    );
}
