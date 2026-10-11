<?php

namespace App\Domain\Project\Models;

use App\Domain\Finance\Models\Entry;
use App\Domain\Identity\Models\User;
use App\Domain\Sync\Concerns\Syncable;
use Database\Factories\BatchFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A batch ("bande") of a `lots`-model project: a cohort of animals with a start and
 * (eventual) end. Headcount/cost/margin are computed from `entries`, never stored —
 * see App\Domain\Analytics.
 *
 * @property string $id
 * @property string $project_id
 * @property int $number
 * @property string|null $name
 * @property Carbon $started_on
 * @property Carbon|null $planned_end_on
 * @property Carbon|null $closed_on
 * @property int $initial_headcount
 * @property string|null $notes
 * @property int|null $created_by
 * @property string|null $device_id
 * @property Carbon $recorded_at
 * @property int $version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['project_id', 'number', 'name', 'started_on', 'planned_end_on', 'closed_on', 'initial_headcount', 'notes', 'created_by', 'device_id', 'recorded_at'])]
class Batch extends Model
{
    /** @use HasFactory<BatchFactory> */
    use HasFactory, Syncable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_on' => 'date',
            'planned_end_on' => 'date',
            'closed_on' => 'date',
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
