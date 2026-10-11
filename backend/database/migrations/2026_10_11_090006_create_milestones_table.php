<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('milestones', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('batch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('kind');
            $table->text('description')->nullable();
            $table->date('occurred_on');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('device_id')->nullable();
            $table->timestamp('recorded_at');
            $table->unsignedBigInteger('version');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('milestones');
    }
};
