<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.'.$this->message->conversation_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    // Shape the payload explicitly rather than serializing the whole
    // model — keeps internal fields off the wire and matches what the
    // chat UI already expects from the Inertia props.
    public function broadcastWith(): array
    {
        $this->message->loadMissing(['sender', 'attachments']);

        return [
            'message' => [
                'id' => $this->message->id,
                'body' => $this->message->body,
                'user_id' => $this->message->user_id,
                'sender_name' => $this->message->sender->name,
                'created_at' => $this->message->created_at->toIso8601String(),
                'read_at' => $this->message->read_at?->toIso8601String(),
                'attachments' => $this->message->attachments->map(fn ($a) => [
                    'id' => $a->id,
                    'original_name' => $a->original_name,
                    'mime_type' => $a->mime_type,
                ])->all(),
            ],
            'conversation_id' => $this->message->conversation_id,
        ];
    }
}
