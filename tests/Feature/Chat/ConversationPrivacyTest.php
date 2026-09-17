<?php

namespace Tests\Feature\Chat;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationPrivacyTest extends TestCase
{
    use RefreshDatabase;

    // This is the spec's own explicit security example (Part 17): if User
    // A owns conversation #1, User A must NOT be able to access
    // conversation #2 belonging to User B by changing the URL.
    public function test_a_user_cannot_view_another_users_conversation_by_changing_the_url(): void
    {
        $userA = User::factory()->create(['role' => User::ROLE_USER]);
        $userB = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $conversationB = Conversation::factory()->create(['user_id' => $userB->id, 'admin_id' => $admin->id]);

        $this->actingAs($userA)->get(route('chat.show', $conversationB))->assertForbidden();
    }

    public function test_a_user_cannot_send_a_message_into_another_users_conversation(): void
    {
        $userA = User::factory()->create(['role' => User::ROLE_USER]);
        $userB = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $conversationB = Conversation::factory()->create(['user_id' => $userB->id, 'admin_id' => $admin->id]);

        $this->actingAs($userA)->post(route('chat.messages.store', $conversationB), ['body' => 'sneaky message'])
            ->assertForbidden();

        $this->assertDatabaseMissing('messages', ['body' => 'sneaky message']);
    }

    public function test_an_admin_cannot_view_a_conversation_assigned_to_another_admin(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $adminA = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $adminB = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $conversation = Conversation::factory()->create(['user_id' => $user->id, 'admin_id' => $adminA->id]);

        $this->actingAs($adminB)->get(route('admin.chat.show', $conversation))->assertForbidden();
        $this->actingAs($adminA)->get(route('admin.chat.show', $conversation))->assertOk();
    }

    public function test_super_admin_can_view_any_conversation_but_cannot_send_messages(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $superAdmin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);

        $conversation = Conversation::factory()->create(['user_id' => $user->id, 'admin_id' => $admin->id]);

        $this->assertTrue($superAdmin->can('view', $conversation));
        $this->assertFalse($superAdmin->can('sendMessage', $conversation));
    }

    public function test_guest_cannot_access_any_chat_route(): void
    {
        $conversation = Conversation::factory()->create();

        $this->get(route('chat.index'))->assertRedirect(route('login'));
        $this->get(route('chat.show', $conversation))->assertRedirect(route('login'));
    }

    public function test_admin_role_cannot_access_user_chat_routes_and_vice_versa(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user = User::factory()->create(['role' => User::ROLE_USER]);

        $this->actingAs($admin)->get(route('chat.index'))->assertForbidden();
        $this->actingAs($user)->get(route('admin.chat.index'))->assertForbidden();
    }
}
