<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('category_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // income|expense — see App\Domain\Finance\Enums\TransactionType
            $table->bigInteger('amount'); // minor units — see App\Support\Money
            $table->string('payment_method'); // cash|mobile_money|bank|other
            $table->timestamp('occurred_at');
            $table->text('note')->nullable();
            $table->string('source_type')->nullable();
            $table->uuid('source_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('version');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['business_id', 'version']);
            $table->index(['source_type', 'source_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
