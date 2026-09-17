<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManagementTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        return User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);
    }

    public function test_management_pages_are_super_admin_only(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        foreach (['admin.users.index', 'admin.admins.index', 'admin.audit-logs.index', 'admin.statistics.index'] as $routeName) {
            $this->actingAs($user)->get(route($routeName))->assertForbidden();
            $this->actingAs($admin)->get(route($routeName))->assertForbidden();
            $this->actingAs($this->superAdmin())->get(route($routeName))->assertOk();
        }
    }

    public function test_super_admin_can_create_an_admin_account(): void
    {
        $response = $this->actingAs($this->superAdmin())->post(route('admin.admins.store'), [
            'name' => 'Admin Baru',
            'email' => 'admin.baru@tanyapbj.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'position' => 'Procurement Specialist',
            'organization' => 'UKPBJ Kota Pontianak',
            'expertise' => ['Tender'],
        ]);

        $response->assertRedirect(route('admin.admins.index'));
        $this->assertDatabaseHas('users', ['email' => 'admin.baru@tanyapbj.test', 'role' => User::ROLE_ADMIN]);
        $this->assertDatabaseHas('admin_profiles', ['position' => 'Procurement Specialist']);
        $this->assertDatabaseHas('audit_logs', ['action' => AuditLog::ACTION_ADMIN_CREATED]);
    }

    public function test_a_plain_admin_cannot_create_another_admin(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($admin)->post(route('admin.admins.store'), [
            'name' => 'Admin Selundupan',
            'email' => 'selundupan@tanyapbj.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'selundupan@tanyapbj.test']);
    }

    public function test_super_admin_can_deactivate_a_user_and_it_is_audited(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER, 'is_active' => true]);

        $this->actingAs($this->superAdmin())
            ->patch(route('admin.users.toggleActive', $user))
            ->assertRedirect();

        $this->assertFalse($user->fresh()->is_active);
        $this->assertDatabaseHas('audit_logs', ['action' => AuditLog::ACTION_USER_DEACTIVATED]);
    }

    public function test_a_super_admin_account_cannot_be_deactivated_through_this_screen(): void
    {
        $target = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);

        $this->actingAs($this->superAdmin())
            ->patch(route('admin.users.toggleActive', $target))
            ->assertForbidden();

        $this->assertTrue($target->fresh()->is_active);
    }

    public function test_audit_log_survives_deletion_of_the_acting_user(): void
    {
        $superAdmin = $this->superAdmin();
        $user = User::factory()->create(['role' => User::ROLE_USER]);

        $this->actingAs($superAdmin)->patch(route('admin.users.toggleActive', $user));

        $log = AuditLog::first();
        $this->assertNotNull($log);

        $superAdmin->forceDelete();

        // user_id nulls out, but actor_name keeps the trail readable.
        $log->refresh();
        $this->assertNull($log->user_id);
        $this->assertNotNull($log->actor_name);
    }
}
