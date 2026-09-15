<?php

namespace Database\Seeders;

use App\Models\Regulation;
use App\Models\RegulationCategory;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class RegulationSeeder extends Seeder
{
    // 15+ sample regulations (spec Part 40), clearly marked DATA CONTOH
    // (Part 21/26) — never presented as real legal references.
    public function run(): void
    {
        $categories = RegulationCategory::all();

        if ($categories->isEmpty()) {
            $this->call(RegulationCategorySeeder::class);
            $categories = RegulationCategory::all();
        }

        $uploader = User::where('role', User::ROLE_SUPER_ADMIN)->first()
            ?? User::factory()->create(['role' => User::ROLE_SUPER_ADMIN]);

        $tagPool = ['tender', 'e-katalog', 'kontrak', 'swakelola', 'regulasi'];

        Regulation::factory()
            ->count(15)
            ->create([
                'uploaded_by' => $uploader->id,
                'regulation_category_id' => fn () => $categories->random()->id,
            ])
            ->each(function (Regulation $regulation) use ($tagPool) {
                $tags = collect($tagPool)->random(random_int(1, 2))
                    ->map(fn (string $name) => Tag::firstOrCreate(['slug' => \Illuminate\Support\Str::slug($name)], ['name' => $name])->id);

                $regulation->tags()->sync($tags);
            });
    }
}
