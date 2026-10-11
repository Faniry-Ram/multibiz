<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color')->nullable();
            $table->string('model'); // lots|herd|resale|simple — see App\Domain\Project\Enums\ProjectModel
            $table->string('status')->default('active'); // active|archived
            $table->date('started_on');
            $table->text('description')->nullable();
            $table->json('settings')->default('{}');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('device_id')->nullable();
            $table->timestamp('recorded_at');
            $table->unsignedBigInteger('version');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
