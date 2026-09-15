<?php

namespace Tests\Feature\Authorization;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_sees_user_dashboard(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);

        $this->actingAs($user)->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->component('Dashboard/User'));
    }

    public function test_admin_sees_admin_dashboard(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($admin)->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->component('Dashboard/Admin'));
    }

    public function test_super_admin_sees_super_admin_dashboard(): void
    {
        $superAdmin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);

        $this->actingAs($superAdmin)->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->component('Dashboard/SuperAdmin'));
    }

    public function test_regular_user_cannot_access_admin_only_route(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);

        $this->actingAs($user)->get(route('admin.dashboard'))->assertForbidden();
    }

    public function test_admin_can_access_admin_route(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk();
    }

    public function test_super_admin_can_access_admin_only_route_too(): void
    {
        // Super Admin has full system access (spec Part 7) — the role
        // middleware must let it through every role-gated route, not just
        // its own.
        $superAdmin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);

        $this->actingAs($superAdmin)->get(route('admin.dashboard'))->assertOk();
    }

    public function test_guest_is_redirected_away_from_admin_route(): void
    {
        $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
    }

    public function test_deactivated_admin_cannot_log_in_to_reach_admin_routes(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN, 'is_active' => false]);

        $this->post(route('login'), [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
    }
}
