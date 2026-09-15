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
        $name = fake()->unique()->randomElement([
            'Perpres', 'Permen', 'Peraturan LKPP', 'Perda', 'Pergub',
            'Perwali', 'Keputusan', 'Surat Edaran', 'Pedoman', 'Lainnya',
        ]);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 100000),
            'description' => fake()->sentence(),
        ];
    }
}
