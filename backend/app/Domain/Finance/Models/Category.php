<?php

namespace App\Domain\Finance\Models;

use App\Domain\Finance\Enums\CategoryKind;
use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;
use App\Domain\Sync\Concerns\Syncable;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $project_id
 * @property string $name
 * @property CategoryKind $kind
 * @property Carbon|null $archived_at
 * @property int|null $created_by
 * @property string|null $device_id
 * @property Carbon $recorded_at
 * @property int $version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['project_id', 'name', 'kind', 'archived_at', 'created_by', 'device_id', 'recorded_at'])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory, Syncable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kind' => CategoryKind::class,
            'archived_at' => 'datetime',
            'recorded_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<Entry, $this>
     */
    public function entries(): HasMany
    {
        return $this->hasMany(Entry::class);
    }
}
