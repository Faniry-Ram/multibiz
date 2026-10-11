<?php

namespace App\Domain\Finance\Models;

use App\Domain\Identity\Models\User;
use App\Domain\Sync\Concerns\Syncable;
use Database\Factories\AttachmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A receipt photo attached to an entry.
 *
 * @property string $id
 * @property string $entry_id
 * @property string $path
 * @property string $mime
 * @property int $size
 * @property int|null $created_by
 * @property string|null $device_id
 * @property Carbon $recorded_at
 * @property int $version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['entry_id', 'path', 'mime', 'size', 'created_by', 'device_id', 'recorded_at'])]
class Attachment extends Model
{
    /** @use HasFactory<AttachmentFactory> */
    use HasFactory, Syncable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Entry, $this>
     */
    public function entry(): BelongsTo
    {
        return $this->belongsTo(Entry::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
