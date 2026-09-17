<?php

namespace Tests\Feature\Chat;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use App\Services\ConversationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class BroadcastAuthTest extends TestCase
{
    use RefreshDatabase;

    // Channel auth is a SECOND enforcement point for the same privacy
    // rules as ConversationPolicy. Without it, someone could subscribe to
    // another user's conversation channel over the websocket and receive
    // their messages live even though the HTTP route would 403.
    public function test_a_user_cannot_authorize_onto_another_users_conversation_channel(): void
    {
        $userA = User::factory()->create(['role' => User::ROLE_USER]);
        $userB = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $conversationB = Conversation::factory()->create(['user_id' => $userB->id, 'admin_id' => $admin->id]);

        $this->actingAs($userA)
            ->post('/broadcasting/auth', [
                'socket_id' => '1234.5678',
                'channel_name' => 'private-conversation.'.$conversationB->id,
            ])
            ->assertForbidden();
    }

    public function test_a_participant_can_authorize_onto_their_own_conversation_channel(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $conversation = Conversation::factory()->create(['user_id' => $user->id, 'admin_id' => $admin->id]);

        $this->actingAs($user)
            ->post('/broadcasting/auth', [
                'socket_id' => '1234.5678',
                'channel_name' => 'private-conversation.'.$conversation->id,
            ])
            ->assertOk();
    }

    public function test_a_user_cannot_authorize_onto_another_users_notification_channel(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $this->actingAs($userA)
            ->post('/broadcasting/auth', [
                'socket_id' => '1234.5678',
                'channel_name' => 'private-App.Models.User.'.$userB->id,
            ])
            ->assertForbidden();
    }

    public function test_sending_a_message_broadcasts_and_notifies_the_other_party(): void
    {
        Event::fake([MessageSent::class]);
        Notification::fake();

        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $conversation = Conversation::factory()->create(['user_id' => $user->id, 'admin_id' => $admin->id]);

        app(ConversationService::class)->postMessage($conversation, $user, 'Halo admin');

        Event::assertDispatched(MessageSent::class);
        // The admin gets notified; the sender does not notify themselves.
        Notification::assertSentTo($admin, NewMessageNotification::class);
        Notification::assertNotSentTo($user, NewMessageNotification::class);
    }
}
