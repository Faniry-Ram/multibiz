<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('entry_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('mime');
            $table->unsignedBigInteger('size');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('device_id')->nullable();
            $table->timestamp('recorded_at');
            $table->unsignedBigInteger('version');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['entry_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
