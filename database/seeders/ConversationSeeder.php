<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\ConversationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ConversationSeeder extends Seeder
{
    // 10 sample Users + 10 conversations + 30+ messages (spec Part 40),
    // using the exact example questions from the spec.
    private const SAMPLE_QUESTIONS = [
        'Apa perbedaan tender dan e-purchasing?',
        'Kapan metode e-purchasing dapat digunakan?',
        'Bagaimana proses pengadaan melalui E-Katalog?',
        'Apa yang dimaksud dengan swakelola?',
        'Bagaimana proses penyusunan HPS?',
        'Dokumen apa saja yang diperlukan dalam proses tender?',
    ];

    public function run(): void
    {
        $admins = User::where('role', User::ROLE_ADMIN)->get();

        if ($admins->isEmpty()) {
            $this->call(AdminSeeder::class);
            $admins = User::where('role', User::ROLE_ADMIN)->get();
        }

        $satuanKerjaList = config('satuan_kerja.list');

        $users = User::factory()
            ->count(10)
            ->create([
                'role' => User::ROLE_USER,
                'password' => Hash::make('password'),
            ]);

        // Assign a varied satuan kerja per user (a closure inside a bulk
        // create() would reuse one value for all 10).
        $users->each(fn (User $u) => $u->update([
            'satuan_kerja' => fake()->randomElement($satuanKerjaList),
        ]));

        $service = app(ConversationService::class);

        for ($i = 0; $i < 10; $i++) {
            $user = $users->random();
            $admin = $admins->random();
            $question = fake()->randomElement(self::SAMPLE_QUESTIONS);

            $conversation = $service->startOrFindExisting($user, $admin, $question);

            // Add 1-3 more back-and-forth messages so there's ~30+ total
            // across the 10 seeded conversations.
            for ($m = 0; $m < random_int(1, 3); $m++) {
                $sender = $m % 2 === 0 ? $admin : $user;
                $service->postMessage($conversation, $sender, fake()->sentence(12));
            }

            // Randomly resolve about a third of them so statuses vary.
            if (random_int(1, 3) === 1) {
                $service->markResolved($conversation);
            }
        }
    }
}
