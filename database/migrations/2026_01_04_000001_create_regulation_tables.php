<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regulation_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('regulations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('regulation_category_id')->constrained('regulation_categories');
            $table->string('title');
            $table->string('document_number')->nullable();
            $table->unsignedSmallInteger('year')->index();
            $table->string('issuing_institution')->nullable();
            $table->date('effective_date')->nullable();
            $table->text('description')->nullable();
            // Stored outside the public disk; downloads go through an
            // authorized controller route (spec Part 23 & 38).
            $table->string('file_disk')->default('regulations');
            $table->string('file_path');
            $table->string('file_original_name');
            $table->unsignedBigInteger('file_size');
            $table->enum('status', ['draft', 'published', 'archived'])->default('published')->index();
            $table->boolean('is_sample_data')->default(false);
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('regulation_tag', function (Blueprint $table) {
            $table->foreignId('regulation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['regulation_id', 'tag_id']);
        });

        Schema::create('user_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('regulation_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'regulation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_bookmarks');
        Schema::dropIfExists('regulation_tag');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('regulations');
        Schema::dropIfExists('regulation_categories');
    }
};
