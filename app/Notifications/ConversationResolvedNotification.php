<?php

namespace App\Notifications;

use App\Models\Conversation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ConversationResolvedNotification extends Notification
{
    use Queueable;

    public function __construct(public Conversation $conversation, public string $resolvedByName)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'conversation_resolved',
            'conversation_id' => $this->conversation->id,
            'resolved_by' => $this->resolvedByName,
            'sender_name' => $this->resolvedByName,
            'preview' => 'Percakapan telah ditandai selesai.',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
