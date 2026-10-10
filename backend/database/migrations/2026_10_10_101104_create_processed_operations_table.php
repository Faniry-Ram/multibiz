<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('processed_operations', function (Blueprint $table) {
            $table->uuid('op_id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('result');
            $table->timestamp('processed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('processed_operations');
    }
};
