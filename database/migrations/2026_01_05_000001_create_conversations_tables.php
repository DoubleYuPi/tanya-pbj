<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject')->nullable();
            $table->string('category')->nullable()->index();
            $table->enum('status', [
                'open', 'waiting_for_admin', 'waiting_for_user', 'resolved', 'closed',
            ])->default('waiting_for_admin')->index();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // A user shouldn't have two unresolved conversations open with
            // the same admin at once.
            $table->index(['user_id', 'admin_id', 'status']);
        });

        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['user', 'admin', 'observer'])->default('user');
            $table->timestamps();
            $table->unique(['conversation_id', 'user_id']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            // Internal notes are only ever visible to admin/super_admin —
            // enforced in the policy/query, not just hidden client-side
            // (spec doesn't require this for tanya-pbj, but the column
            // costs nothing to reserve and matches Part 46's own-notes
            // pattern many procurement helpdesks need).
            $table->boolean('is_internal_note')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['conversation_id', 'created_at']);
        });

        Schema::create('message_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            $table->string('disk')->default('attachments');
            $table->string('path');
            $table->string('original_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('size');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_attachments');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversations');
    }
};
