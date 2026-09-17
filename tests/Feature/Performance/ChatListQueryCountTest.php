<?php

namespace Tests\Feature\Performance;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ChatListQueryCountTest extends TestCase
{
    use RefreshDatabase;

    // Regression test for a real N+1 fixed in Phase 8: the conversation
    // list used to run a separate unread-count query per conversation.
    // Query count for the list must stay flat as the number of
    // conversations grows, not scale linearly with it.
    public function test_conversation_list_query_count_does_not_scale_with_conversation_count(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);

        Conversation::factory()->count(2)->create(['user_id' => $user->id]);
        DB::enableQueryLog();
        $this->actingAs($user)->get(route('chat.index'));
        $queryCountForTwo = count(DB::getQueryLog());
        DB::flushQueryLog();

        Conversation::factory()->count(8)->create(['user_id' => $user->id]);
        $this->actingAs($user)->get(route('chat.index'));
        $queryCountForTen = count(DB::getQueryLog());
        DB::disableQueryLog();

        // Allow a little slack, but it must not grow anywhere close to
        // linearly (the old code added 1 query per conversation).
        $this->assertLessThanOrEqual(
            $queryCountForTwo + 3,
            $queryCountForTen,
            'Query count grew with conversation count — likely an N+1 regression.'
        );
    }
}
