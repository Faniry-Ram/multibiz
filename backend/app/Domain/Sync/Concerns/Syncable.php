<?php

namespace App\Domain\Sync\Concerns;

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Transaction;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * Applied to every model the mobile app syncs. Gives the model a UUID primary key,
 * soft deletes (so a pull can report deletions), and a `version` column stamped from
 * the shared `sync_version_seq` sequence on every save — see
 * docs/adr/0003-global-version-sequence-for-sync.md.
 *
 * @see Business
 * @see Category
 * @see Transaction
 */
trait Syncable
{
    use HasUuids, SoftDeletes;

    protected static function bootSyncable(): void
    {
        static::saving(function (self $model) {
            $model->version = self::nextSyncVersion();
        });

        // SoftDeletes::delete() persists `deleted_at` via a raw query update, not
        // save(), so the `saving` hook above never fires for it — without this, a
        // soft-deleted row would keep its pre-delete version and a sync pull would
        // never notice it was deleted.
        static::deleted(function (self $model) {
            if ($model->isForceDeleting()) {
                return;
            }

            $version = self::nextSyncVersion();

            $model->newQueryWithoutScopes()->whereKey($model->getKey())->update(['version' => $version]);
            $model->version = $version;
        });
    }

    private static function nextSyncVersion(): int
    {
        return DB::selectOne('select nextval(?) as value', ['sync_version_seq'])->value;
    }
}
