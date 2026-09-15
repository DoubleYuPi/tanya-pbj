<?php

namespace Database\Seeders;

use App\Models\RegulationCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RegulationCategorySeeder extends Seeder
{
    // The 10 categories from spec Part 20/24.
    public function run(): void
    {
        collect([
            'Perpres', 'Permen', 'Peraturan LKPP', 'Perda', 'Pergub',
            'Perwali', 'Keputusan', 'Surat Edaran', 'Pedoman', 'Lainnya',
        ])->each(fn (string $name) => RegulationCategory::firstOrCreate(
            ['slug' => Str::slug($name)],
            ['name' => $name]
        ));
    }
}
