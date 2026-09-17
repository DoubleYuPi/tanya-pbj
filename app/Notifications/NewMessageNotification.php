<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class NewMessageNotification extends Notification
{
    use Queueable;

    public function __construct(public Message $message)
    {
    }

    // 'database' persists it for the bell dropdown's history; 'broadcast'
    // pushes it live so the badge updates without a refresh. Email /
    // WhatsApp / push are listed as future features in the spec — they'd
    // be added here without touching any call site.
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $this->message->loadMissing('sender');

        return [
            'type' => 'new_message',
            'conversation_id' => $this->message->conversation_id,
            'sender_name' => $this->message->sender->name,
            'preview' => Str::limit($this->message->body, 80),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
