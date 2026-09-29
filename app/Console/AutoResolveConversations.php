<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use App\Services\ConversationService;
use Illuminate\Console\Command;

class AutoResolveConversations extends Command
{
    protected $signature = 'conversations:auto-resolve {--hours=24 : Idle hours before a conversation is auto-resolved}';

    protected $description = 'Mark conversations as resolved when neither side has posted for 24 hours';

    public function handle(ConversationService $conversations): int
    {
        $cutoff = now()->subHours((int) $this->option('hours'));
        $count = 0;

        Conversation::query()
            ->idleSince($cutoff)
            ->chunkById(100, function ($chunk) use ($conversations, &$count) {
                foreach ($chunk as $conversation) {
                    $conversations->autoResolve($conversation);
                    $count++;
                }
            });

        $this->info("Auto-resolved {$count} conversation(s).");

        return self::SUCCESS;
    }
}
