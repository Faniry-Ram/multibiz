<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type')->nullable();
            $table->string('color')->nullable();
            $table->string('currency')->default('MGA');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('version');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
