<?php

namespace App\Domain\Sync\Concerns;

use App\Domain\Finance\Models\Entry;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Applied to models that form the immutable flux registry: a row is created once,
 * stamped with a `version` from the shared `sync_version_seq` (see
 * docs/adr/0003-global-version-sequence-for-sync.md), and then never updated or
 * deleted again. Mistakes are corrected by recording a reverse entry
 * (`reverses_entry_id`), never by mutating the original row.
 *
 * @see Entry
 */
trait AppendOnly
{
    use HasUuids;

    protected static function bootAppendOnly(): void
    {
        static::creating(function (self $model) {
            $model->version = DB::selectOne('select nextval(?) as value', ['sync_version_seq'])->value;
        });

        static::updating(function (self $model) {
            throw new RuntimeException(class_basename($model).' records are append-only and cannot be updated. Record a reverse entry instead.');
        });

        static::deleting(function (self $model) {
            throw new RuntimeException(class_basename($model).' records are append-only and cannot be deleted. Record a reverse entry instead.');
        });
    }
}
