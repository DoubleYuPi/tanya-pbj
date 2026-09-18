<?php

namespace Database\Factories;

use App\Models\RegulationCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RegulationCategoryFactory extends Factory
{
    protected $model = RegulationCategory::class;

    public function definition(): array
    {
        // No fake()->unique() on the base name — that pool only has 10
        // entries, and a long test run creating many categories would
        // eventually exhaust it. A random numeric suffix keeps both name
        // and slug unique indefinitely instead.
        $base = fake()->randomElement([
            'Perpres', 'Permen', 'Peraturan LKPP', 'Perda', 'Pergub',
            'Perwali', 'Keputusan', 'Surat Edaran', 'Pedoman', 'Lainnya',
        ]);
        $suffix = fake()->unique()->numberBetween(1, 1_000_000);
        $name = "{$base} {$suffix}";

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
        ];
    }
}
