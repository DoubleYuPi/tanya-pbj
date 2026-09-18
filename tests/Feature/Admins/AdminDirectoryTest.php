<?php

namespace Tests\Feature\Admins;

use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_browse_the_admin_directory(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        AdminProfile::factory()->create(['user_id' => $admin->id]);

        $this->get(route('admins.index'))->assertOk();
    }

    public function test_guests_can_view_an_admin_profile(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        AdminProfile::factory()->create(['user_id' => $admin->id]);

        $this->get(route('admins.show', $admin))->assertOk();
    }

    public function test_a_regular_users_profile_is_not_reachable_as_an_admin(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);

        $this->get(route('admins.show', $user))->assertNotFound();
    }

    public function test_inactive_admins_are_not_publicly_visible(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN, 'is_active' => false]);
        AdminProfile::factory()->create(['user_id' => $admin->id]);

        $this->get(route('admins.show', $admin))->assertNotFound();
    }

    public function test_admin_directory_response_never_exposes_email(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN, 'email' => 'secret@example.com']);
        AdminProfile::factory()->create(['user_id' => $admin->id]);

        $response = $this->get(route('admins.index'));

        $response->assertOk();
        $response->assertDontSee('secret@example.com');
    }

    public function test_admin_can_update_own_profile(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $response = $this->actingAs($admin)->patch(route('admin.profile.update'), [
            'name' => $admin->name,
            'position' => 'Procurement Specialist',
            'organization' => 'UKPBJ Kota Pontianak',
            'expertise' => ['Tender', 'E-Katalog'],
            'status' => 'online',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('admin_profiles', [
            'user_id' => $admin->id,
            'position' => 'Procurement Specialist',
            'status' => 'online',
        ]);
    }

    public function test_regular_user_cannot_reach_admin_profile_page(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);

        $this->actingAs($user)->get(route('admin.profile.edit'))->assertForbidden();
    }

    public function test_admin_can_quickly_toggle_availability(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($admin)->patch(route('admin.availability.update'), ['status' => 'away'])
            ->assertRedirect();

        $this->assertDatabaseHas('admin_profiles', ['user_id' => $admin->id, 'status' => 'away']);
    }
}
