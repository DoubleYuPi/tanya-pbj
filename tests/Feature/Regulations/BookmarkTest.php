<?php

namespace Tests\Feature\Regulations;

use App\Models\Regulation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookmarkTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_bookmark_a_regulation(): void
    {
        $regulation = Regulation::factory()->create(['status' => Regulation::STATUS_PUBLISHED]);

        $this->post(route('regulations.bookmark', $regulation))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_bookmark_and_unbookmark_a_regulation(): void
    {
        $user = User::factory()->create();
        $regulation = Regulation::factory()->create(['status' => Regulation::STATUS_PUBLISHED]);

        $this->actingAs($user)->post(route('regulations.bookmark', $regulation))->assertRedirect();
        $this->assertDatabaseHas('user_bookmarks', ['user_id' => $user->id, 'regulation_id' => $regulation->id]);

        $this->actingAs($user)->delete(route('regulations.unbookmark', $regulation))->assertRedirect();
        $this->assertDatabaseMissing('user_bookmarks', ['user_id' => $user->id, 'regulation_id' => $regulation->id]);
    }

    public function test_users_only_see_their_own_bookmarks(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $regulation = Regulation::factory()->create(['status' => Regulation::STATUS_PUBLISHED]);

        $userA->bookmarkedRegulations()->attach($regulation->id);

        $this->actingAs($userB)->get(route('regulations.bookmarks'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Regulations/Bookmarks'));

        $this->assertSame(0, $userB->bookmarkedRegulations()->count());
        $this->assertSame(1, $userA->bookmarkedRegulations()->count());
    }
}
