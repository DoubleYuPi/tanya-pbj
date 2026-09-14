<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // The original users table (from the vanilla laravel new skeleton) only
    // has name/email/password. This adds the fields Tanya PBJ needs
    // (spec Part 6/9/31) without dropping/recreating the table, since it
    // already has real migration history on this database.
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->enum('role', ['super_admin', 'admin', 'user'])->default('user')->after('phone')->index();
            $table->boolean('is_active')->default(true)->after('role');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['phone', 'role', 'is_active']);
        });
    }
};
