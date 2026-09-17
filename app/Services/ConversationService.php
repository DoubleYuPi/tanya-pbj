<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConversationService
{
    // Starts a new consultation, or returns the existing unresolved one
    // if the user already has one open with this admin — avoids
    // duplicate/fragmented threads for the same ongoing issue.
    public function startOrFindExisting(User $user, User $admin, string $firstMessage, ?string $subject = null): Conversation
    {
        $existing = Conversation::query()
            ->where('user_id', $user->id)
            ->where('admin_id', $admin->id)
            ->whereNotIn('status', [Conversation::STATUS_RESOLVED, Conversation::STATUS_CLOSED])
            ->first();

        if ($existing) {
            return $existing;
        }

        return DB::transaction(function () use ($user, $admin, $firstMessage, $subject) {
            $conversation = Conversation::create([
                'user_id' => $user->id,
                'admin_id' => $admin->id,
                'subject' => $subject ?: Str::limit($firstMessage, 100),
                'status' => Conversation::STATUS_WAITING_ADMIN,
                'last_message_at' => now(),
            ]);

            $conversation->participants()->attach([
                $user->id => ['role' => 'user'],
                $admin->id => ['role' => 'admin'],
            ]);

            $this->postMessage($conversation, $user, $firstMessage);

            return $conversation;
        });
    }

    /**
     * @param  UploadedFile[]  $attachments
     */
    public function postMessage(Conversation $conversation, User $sender, string $body, array $attachments = []): Message
    {
        return DB::transaction(function () use ($conversation, $sender, $body, $attachments) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'user_id' => $sender->id,
                'body' => $body,
            ]);

            foreach ($attachments as $file) {
                $storedName = Str::uuid().'.'.$file->getClientOriginalExtension();
                $path = $file->storeAs('', $storedName, 'attachments');

                MessageAttachment::create([
                    'message_id' => $message->id,
                    'disk' => 'attachments',
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ]);
            }

            // Flip status to whichever side is now waiting on a reply.
            $conversation->update([
                'status' => $sender->id === $conversation->admin_id
                    ? Conversation::STATUS_WAITING_USER
                    : Conversation::STATUS_WAITING_ADMIN,
                'last_message_at' => now(),
            ]);

            return $message;
        });
    }

    public function markResolved(Conversation $conversation): void
    {
        $conversation->update(['status' => Conversation::STATUS_RESOLVED, 'resolved_at' => now()]);
    }

    public function reopen(Conversation $conversation): void
    {
        $conversation->update(['status' => Conversation::STATUS_OPEN, 'resolved_at' => null]);
    }
}
