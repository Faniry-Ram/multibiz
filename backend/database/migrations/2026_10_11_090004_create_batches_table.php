<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('number');
            $table->string('name')->nullable();
            $table->date('started_on');
            $table->date('planned_end_on')->nullable();
            $table->date('closed_on')->nullable();
            $table->unsignedInteger('initial_headcount');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('device_id')->nullable();
            $table->timestamp('recorded_at');
            $table->unsignedBigInteger('version');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['project_id', 'number']);
            $table->index(['project_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
