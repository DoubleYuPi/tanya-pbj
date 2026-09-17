<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\AuditLog;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_settings_page_is_super_admin_only(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $superAdmin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);

        $this->actingAs($user)->get(route('admin.settings.edit'))->assertForbidden();
        $this->actingAs($admin)->get(route('admin.settings.edit'))->assertForbidden();
        $this->actingAs($superAdmin)->get(route('admin.settings.edit'))->assertOk();
    }

    public function test_super_admin_can_update_settings_and_it_is_audited(): void
    {
        $superAdmin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);

        $this->actingAs($superAdmin)->patch(route('admin.settings.update'), [
            'app_tagline' => 'Tagline Baru',
            'registration_enabled' => false,
            'regulation_max_upload_mb' => 50,
            'attachment_max_upload_mb' => 20,
        ])->assertRedirect();

        $this->assertSame('Tagline Baru', Setting::get('app_tagline'));
        $this->assertFalse(Setting::getBool('registration_enabled'));
        $this->assertDatabaseHas('audit_logs', ['action' => AuditLog::ACTION_SETTINGS_UPDATED]);
    }

    public function test_disabling_registration_blocks_new_signups(): void
    {
        Setting::set('registration_enabled', '0');

        $this->get(route('register'))->assertOk(); // shows the "closed" message, not a 404

        $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'blocked@example.com',
            'satuan_kerja' => config('satuan_kerja.list')[0],
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'blocked@example.com']);
    }
}
