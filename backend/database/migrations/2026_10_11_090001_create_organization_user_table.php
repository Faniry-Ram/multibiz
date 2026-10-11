<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Membership + role of a user within an organization — see
 * App\Domain\Organization\Enums\Role. A direct `users.organization_id` column was
 * deliberately dropped in favor of this pivot so a user's access level is explicit
 * and future multi-member organizations don't need a schema change.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_user', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role'); // owner|manager|entry|viewer — see App\Domain\Organization\Enums\Role
            $table->timestamps();

            $table->unique(['organization_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_user');
    }
};
