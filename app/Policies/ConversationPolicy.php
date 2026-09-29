<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    // Spec Part 17: users see only their own conversations; admins see
    // only conversations assigned to them; Super Admin sees everything
    // but only to "monitor" (Part 7) — never to participate.
    // CRITICAL: a user must never reach another user's conversation by
    // guessing/changing the URL (spec Part 17's explicit example).
    public function view(User $user, Conversation $conversation): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdmin()) {
            return $conversation->admin_id === $user->id;
        }

        return $conversation->user_id === $user->id;
    }

    // Only the actual participants (the user who opened it, or the admin
    // assigned to it) can send messages — Super Admin is monitor-only.
    public function sendMessage(User $user, Conversation $conversation): bool
    {
        if ($user->isSuperAdmin()) {
            return false;
        }

        $isParticipant = $conversation->user_id === $user->id || $conversation->admin_id === $user->id;

        return $isParticipant && ! $conversation->isResolved();
    }

    // public function markResolved(User $user, Conversation $conversation): bool
    // {
    //     return ! $user->isSuperAdmin() && $this->view($user, $conversation);
    // }

    public function markResolved(User $user, Conversation $conversation): bool
    {
        return ! $user->isAdmin()
            && ! $user->isSuperAdmin()
            && $conversation->user_id === $user->id
            && ! $conversation->isResolved();
    }

    // public function reopen(User $user, Conversation $conversation): bool
    // {
    //     return $this->markResolved($user, $conversation);
    // }

    public function reopen(User $user, Conversation $conversation): bool
    {
        return ! $user->isSuperAdmin()
            && $this->view($user, $conversation)
            && $conversation->isResolved();
    }
}
