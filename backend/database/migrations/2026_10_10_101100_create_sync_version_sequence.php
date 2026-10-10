<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * A single sequence shared by every Syncable model's `version` column, so a mobile
 * client's sync cursor ("give me everything after version N") is comparable across
 * tables. See docs/adr/0003-global-version-sequence-for-sync.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE SEQUENCE IF NOT EXISTS sync_version_seq');
    }

    public function down(): void
    {
        DB::statement('DROP SEQUENCE IF EXISTS sync_version_seq');
    }
};
