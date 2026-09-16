<?php

namespace Database\Factories;

use App\Models\AdminProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdminProfileFactory extends Factory
{
    protected $model = AdminProfile::class;

    public function definition(): array
    {
        return [
            'position' => 'Procurement Specialist',
            'organization' => fake()->company(),
            'bio' => fake()->sentence(15),
            'expertise' => fake()->randomElements(['Tender', 'E-Katalog', 'Kontrak', 'Swakelola', 'Regulasi'], 2),
            'status' => 'online',
            'last_active_at' => now(),
        ];
    }
}
