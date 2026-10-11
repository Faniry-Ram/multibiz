<?php

namespace App\Domain\Project\Models;

use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Enums\ProjectModel;
use App\Domain\Project\Enums\ProjectStatus;
use App\Domain\Sync\Concerns\Syncable;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $organization_id
 * @property string $name
 * @property string|null $color
 * @property ProjectModel $model
 * @property ProjectStatus $status
 * @property Carbon $started_on
 * @property string|null $description
 * @property array<string, mixed> $settings
 * @property int|null $created_by
 * @property string|null $device_id
 * @property Carbon $recorded_at
 * @property int $version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['organization_id', 'name', 'color', 'model', 'status', 'started_on', 'description', 'settings', 'created_by', 'device_id', 'recorded_at'])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory, Syncable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'model' => ProjectModel::class,
            'status' => ProjectStatus::class,
            'started_on' => 'date',
            'settings' => 'array',
            'recorded_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Organization, $this>
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<Category, $this>
     */
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    /**
     * @return HasMany<Entry, $this>
     */
    public function entries(): HasMany
    {
        return $this->hasMany(Entry::class);
    }

    /**
     * @return HasMany<Batch, $this>
     */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }
}
