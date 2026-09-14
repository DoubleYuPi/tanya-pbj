<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Admin profile fields per spec Part 8: position, organization, bio,
    // expertise tags, availability status.
    public function up(): void
    {
        Schema::create('admin_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('position')->nullable();
            $table->string('organization')->nullable();
            $table->json('expertise')->nullable();
            $table->text('bio')->nullable();
            $table->string('avatar_path')->nullable();
            $table->enum('status', ['online', 'away', 'offline'])->default('offline')->index();
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_profiles');
    }
};
