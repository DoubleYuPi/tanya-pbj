<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class RateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('login');
    }

    public function test_login_is_rate_limited_after_repeated_wrong_password_attempts(): void
    {
        $user = User::factory()->create();

        for ($i = 0; $i < 5; $i++) {
            $this->post(route('login'), ['email' => $user->email, 'password' => 'wrong']);
        }

        // The 6th attempt within a minute should be throttled, regardless
        // of whether the credentials this time are actually correct —
        // that's the whole point of throttling by email+IP.
        $response = $this->post(route('login'), ['email' => $user->email, 'password' => 'password']);

        $response->assertStatus(429);
        $this->assertGuest();
    }

    public function test_registration_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post(route('register'), [
                'name' => "User {$i}",
                'email' => "user{$i}@example.com",
                'satuan_kerja' => config('satuan_kerja.list')[0],
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);
        }

        $response = $this->post(route('register'), [
            'name' => 'One Too Many',
            'email' => 'onetoomany@example.com',
            'satuan_kerja' => config('satuan_kerja.list')[0],
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertStatus(429);
    }

    public function test_login_rate_limit_is_keyed_by_email_not_shared_across_accounts(): void
    {
        $victim = User::factory()->create(['email' => 'victim@example.com']);
        $other = User::factory()->create(['email' => 'other@example.com']);

        // Exhaust the limit for the victim's email specifically.
        for ($i = 0; $i < 5; $i++) {
            $this->post(route('login'), ['email' => $victim->email, 'password' => 'wrong']);
        }

        // A different account, same IP, should be unaffected.
        $response = $this->post(route('login'), ['email' => $other->email, 'password' => 'password']);

        $this->assertAuthenticatedAs($other);
        $response->assertStatus(302);
    }
}
