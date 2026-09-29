<?php

namespace App\Services;

use App\Events\ConversationUpdated;
use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use App\Notifications\ConversationResolvedNotification;
use App\Notifications\NewMessageNotification;
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
        $message = DB::transaction(function () use ($conversation, $sender, $body, $attachments) {
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

        // Broadcast + notify AFTER the transaction commits, so listeners
        // never read a half-written conversation (spec Part 18's ordering:
        // save → broadcast → notify).
        broadcast(new MessageSent($message))->toOthers();

        if ($recipient = $this->recipientFor($conversation, $sender)) {
            $recipient->notify(new NewMessageNotification($message));
        }

        return $message;
    }

    public function markResolved(Conversation $conversation, ?User $resolvedBy = null): void
    {
        $conversation->update(['status' => Conversation::STATUS_RESOLVED, 'resolved_at' => now()]);

        broadcast(new ConversationUpdated($conversation))->toOthers();

        if ($resolvedBy && $recipient = $this->recipientFor($conversation, $resolvedBy)) {
            $recipient->notify(new ConversationResolvedNotification($conversation, $resolvedBy->name));
        }
    }

    public function autoResolve(Conversation $conversation): void
    {
        $conversation->update(['status' => Conversation::STATUS_RESOLVED, 'resolved_at' => now()]);

        broadcast(new ConversationUpdated($conversation));

        foreach ([$conversation->user_id, $conversation->admin_id] as $id) {
            if ($id && $recipient = User::find($id)) {
                $recipient->notify(new ConversationResolvedNotification($conversation, 'Sistem (otomatis, 24 jam tanpa balasan)'));
            }
        }
    }

    public function reopen(Conversation $conversation): void
    {
        // reopened_at restarts the 24h auto-resolve clock.
        $conversation->update([
            'status' => Conversation::STATUS_OPEN,
            'resolved_at' => null,
            'reopened_at' => now(),
        ]);

        broadcast(new ConversationUpdated($conversation))->toOthers();
    }

    // The participant who ISN'T the actor — i.e. who should be notified.
    private function recipientFor(Conversation $conversation, User $actor): ?User
    {
        $recipientId = $actor->id === $conversation->user_id
            ? $conversation->admin_id
            : $conversation->user_id;

        return $recipientId ? User::find($recipientId) : null;
    }
}
