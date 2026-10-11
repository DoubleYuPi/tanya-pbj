<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ukpbj_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('title');
            $table->longText('content')->nullable();
            $table->timestamps();
        });

        // The four sections are fixed; Super Admin only edits their content.
        $now = now();
        DB::table('ukpbj_sections')->insert([
            ['key' => 'visi-misi', 'title' => 'Visi Misi', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'maklumat-pelayanan', 'title' => 'Maklumat Pelayanan', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'regulasi', 'title' => 'Regulasi', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'sop', 'title' => 'SOP', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('ukpbj_sections');
    }
};
