<?php

namespace Tests\Feature\Chat;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ChatFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('attachments');
    }

    public function test_user_can_start_a_consultation_with_an_admin(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $response = $this->actingAs($user)->post(route('chat.store'), [
            'admin_id' => $admin->id,
            'message' => 'Apa perbedaan tender dan e-purchasing?',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('conversations', ['user_id' => $user->id, 'admin_id' => $admin->id]);
        $this->assertDatabaseHas('messages', ['body' => 'Apa perbedaan tender dan e-purchasing?']);
    }

    public function test_starting_a_second_consultation_with_the_same_admin_reuses_the_open_one(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($user)->post(route('chat.store'), ['admin_id' => $admin->id, 'message' => 'Pertanyaan pertama']);
        $this->actingAs($user)->post(route('chat.store'), ['admin_id' => $admin->id, 'message' => 'Pertanyaan kedua']);

        $this->assertSame(1, Conversation::where('user_id', $user->id)->where('admin_id', $admin->id)->count());
    }

    public function test_admin_can_reply_and_status_flips_to_waiting_for_user(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $conversation = Conversation::factory()->create([
            'user_id' => $user->id,
            'admin_id' => $admin->id,
            'status' => Conversation::STATUS_WAITING_ADMIN,
        ]);

        $this->actingAs($admin)->post(route('admin.chat.messages.store', $conversation), [
            'body' => 'Terima kasih atas pertanyaan Anda.',
        ])->assertRedirect();

        $conversation->refresh();
        $this->assertSame(Conversation::STATUS_WAITING_USER, $conversation->status);
    }

    public function test_message_with_valid_attachment_is_stored(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $conversation = Conversation::factory()->create(['user_id' => $user->id, 'admin_id' => $admin->id]);

        $this->actingAs($user)->post(route('chat.messages.store', $conversation), [
            'body' => 'Berikut dokumennya',
            'attachments' => [UploadedFile::fake()->create('dokumen.pdf', 500, 'application/pdf')],
        ])->assertRedirect();

        $this->assertDatabaseHas('message_attachments', ['original_name' => 'dokumen.pdf']);
    }

    public function test_message_attachment_rejects_disallowed_file_types(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $conversation = Conversation::factory()->create(['user_id' => $user->id, 'admin_id' => $admin->id]);

        $response = $this->actingAs($user)->post(route('chat.messages.store', $conversation), [
            'body' => 'File berbahaya',
            'attachments' => [UploadedFile::fake()->create('virus.exe', 500, 'application/x-msdownload')],
        ]);

        $response->assertSessionHasErrors('attachments.0');
        $this->assertDatabaseMissing('messages', ['body' => 'File berbahaya']);
    }

    public function test_user_can_mark_conversation_resolved_and_reopen_it(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $conversation = Conversation::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->post(route('chat.resolve', $conversation))->assertRedirect();
        $this->assertSame(Conversation::STATUS_RESOLVED, $conversation->fresh()->status);

        $this->actingAs($user)->post(route('chat.reopen', $conversation))->assertRedirect();
        $this->assertSame(Conversation::STATUS_OPEN, $conversation->fresh()->status);
    }

    public function test_cannot_send_a_message_to_a_resolved_conversation(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $conversation = Conversation::factory()->create([
            'user_id' => $user->id,
            'status' => Conversation::STATUS_RESOLVED,
        ]);

        $this->actingAs($user)->post(route('chat.messages.store', $conversation), ['body' => 'Masih ada pertanyaan'])
            ->assertForbidden();
    }
}
