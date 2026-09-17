<?php

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Channel authorization is a second, independent enforcement point for the
| same privacy rules as ConversationPolicy (spec Part 17/21). Without this,
| someone could subscribe to another user's conversation channel and
| receive their messages live even though the HTTP route would 403 — so
| this deliberately mirrors the policy rather than trusting it implicitly.
|
*/

Broadcast::channel('conversation.{conversationId}', function (User $user, int $conversationId) {
    $conversation = Conversation::find($conversationId);

    if (! $conversation) {
        return false;
    }

    // Reuses the exact same policy the HTTP layer uses — one source of
    // truth for "who may see this conversation".
    return $user->can('view', $conversation);
});

// Per-user private notification channel (new question, new reply, etc).
Broadcast::channel('App.Models.User.{id}', function (User $user, int $id) {
    return $user->id === $id;
});
