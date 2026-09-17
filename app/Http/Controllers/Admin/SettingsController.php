<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Setting;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    // The spec's route table (Part 41) lists /admin/settings without
    // defining what belongs there. Scoped here to what's concretely
    // useful and safe for a Super Admin to control at runtime rather
    // than requiring a .env edit + restart: upload limits and whether
    // public registration is currently open.
    public function edit(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'app_tagline' => Setting::get('app_tagline', 'Konsultasi dan Informasi Pengadaan Barang/Jasa Pemerintah'),
                'registration_enabled' => Setting::getBool('registration_enabled', true),
                'regulation_max_upload_mb' => (int) Setting::get('regulation_max_upload_mb', env('REGULATION_MAX_UPLOAD_MB', 25)),
                'attachment_max_upload_mb' => (int) Setting::get('attachment_max_upload_mb', env('ATTACHMENT_MAX_UPLOAD_MB', 10)),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_tagline' => ['required', 'string', 'max:255'],
            'registration_enabled' => ['required', 'boolean'],
            'regulation_max_upload_mb' => ['required', 'integer', 'min:1', 'max:200'],
            'attachment_max_upload_mb' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, is_bool($value) ? ($value ? '1' : '0') : (string) $value);
        }

        AuditLogger::log(AuditLog::ACTION_SETTINGS_UPDATED, 'Memperbarui pengaturan sistem', null, $validated);

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
