<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('kind'); // income|expense — see App\Domain\Finance\Enums\TransactionType
            $table->string('color')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('version');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
