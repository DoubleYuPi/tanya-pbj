<?php

namespace Database\Factories;

use App\Models\Regulation;
use App\Models\RegulationCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RegulationFactory extends Factory
{
    protected $model = Regulation::class;

    // Minimal, genuinely-valid single-page blank PDF (no external
    // dependencies needed to generate it) — used so seeded "DATA CONTOH"
    // regulations actually open/download/preview correctly rather than
    // pointing at a file that doesn't exist.
    public static function placeholderPdfBytes(): string
    {
        return "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            ."2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
            ."3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n"
            ."4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
            ."5 0 obj<</Length 92>>stream\nBT /F1 18 Tf 72 700 Td (DATA CONTOH - Dokumen Placeholder Pengembangan) Tj ET\nendstream\nendobj\n"
            ."xref\n0 6\n0000000000 65535 f \n"
            ."trailer<</Size 6/Root 1 0 R>>\nstartxref\n0\n%%EOF";
    }

    public function definition(): array
    {
        $number = fake()->numberBetween(1, 99);
        $year = fake()->numberBetween(2018, 2026);
        $storedName = Str::uuid().'.pdf';

        Storage::disk('regulations')->put($storedName, self::placeholderPdfBytes());

        return [
            // Both columns are NOT NULL at the DB level — defaulted here
            // via nested factories so `Regulation::factory()->create()`
            // works standalone; callers can still override either.
            'regulation_category_id' => RegulationCategory::factory(),
            'uploaded_by' => User::factory()->state(['role' => User::ROLE_SUPER_ADMIN]),
            'title' => "Peraturan Presiden Nomor {$number} Tahun {$year} tentang Pengadaan Barang/Jasa Pemerintah (DATA CONTOH)",
            'document_number' => (string) $number,
            'year' => $year,
            'issuing_institution' => 'Presiden Republik Indonesia',
            'effective_date' => fake()->dateTimeBetween("{$year}-01-01", "{$year}-12-31"),
            'description' => 'Dokumen contoh untuk keperluan pengembangan. '.fake()->sentence(12),
            'file_disk' => 'regulations',
            'file_path' => $storedName,
            'file_original_name' => "perpres-{$number}-{$year}-sample.pdf",
            'file_size' => strlen(self::placeholderPdfBytes()),
            'status' => 'published',
            'is_sample_data' => true,
        ];
    }
}
