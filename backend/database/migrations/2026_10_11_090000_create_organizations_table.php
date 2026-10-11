<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('currency')->default('MGA');
            $table->string('timezone')->default('Indian/Antananarivo');
            $table->unsignedTinyInteger('week_starts_on')->default(1); // 0 (Sunday) .. 6 (Saturday)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
