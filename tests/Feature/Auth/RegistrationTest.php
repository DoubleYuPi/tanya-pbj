<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $this->get(route('register'))->assertOk();
    }

    public function test_new_users_can_register_and_are_always_assigned_the_user_role(): void
    {
        $satuanKerja = config('satuan_kerja.list')[0];

        $response = $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'satuan_kerja' => $satuanKerja,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertSame(User::ROLE_USER, $user->role);
        $this->assertSame($satuanKerja, $user->satuan_kerja);

        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_registration_ignores_a_client_supplied_role(): void
    {
        // Even if someone tampers with the request to try to self-assign
        // an elevated role, the controller must ignore it (spec Part 6:
        // admin/super admin accounts are never created through this form).
        $this->post(route('register'), [
            'name' => 'Sneaky User',
            'email' => 'sneaky@example.com',
            'satuan_kerja' => config('satuan_kerja.list')[0],
            'role' => 'super_admin',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $user = User::where('email', 'sneaky@example.com')->first();
        $this->assertSame(User::ROLE_USER, $user->role);
    }

    public function test_registration_requires_a_valid_satuan_kerja(): void
    {
        $response = $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test2@example.com',
            'satuan_kerja' => 'INSTANSI YANG TIDAK ADA',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors('satuan_kerja');
        $this->assertGuest();
    }
}
