<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The flux registry: append-only, see App\Domain\Finance\Concerns\AppendOnly. A row
 * is never updated nor (soft-)deleted — mistakes are corrected with a reverse entry
 * (`reverses_entry_id`). No `updated_at`/`deleted_at` on purpose.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('project_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('batch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // sale|expense|investment|owner_in|owner_out|headcount|production|note
            $table->bigInteger('amount')->nullable(); // minor units — see App\Support\Money
            $table->decimal('quantity', 12, 2)->nullable();
            $table->bigInteger('unit_price')->nullable(); // minor units — see App\Support\Money
            $table->string('unit')->nullable();
            $table->integer('headcount_delta')->nullable();
            $table->string('headcount_reason')->nullable(); // death|entry|sale|cull
            $table->unsignedInteger('useful_life_months')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamp('recorded_at');
            $table->text('note')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('device_id')->nullable();
            $table->uuid('reverses_entry_id')->nullable();
            $table->unsignedBigInteger('version');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['project_id', 'version']);
            $table->index(['project_id', 'occurred_at']);
            $table->index(['batch_id']);
        });

        // Self-referencing FK added after creation: Postgres can't validate it against
        // this table's own primary key within the same CREATE TABLE statement.
        Schema::table('entries', function (Blueprint $table) {
            $table->foreign('reverses_entry_id')->references('id')->on('entries')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entries');
    }
};
