<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => User::ROLE_USER]),
            'admin_id' => User::factory()->state(['role' => User::ROLE_ADMIN]),
            'subject' => fake()->sentence(6),
            'status' => Conversation::STATUS_OPEN,
            'last_message_at' => now(),
        ];
    }
}
