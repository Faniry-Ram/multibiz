<?php

namespace App\Domain\Project\Models;

use App\Domain\Identity\Models\User;
use App\Domain\Sync\Concerns\Syncable;
use Database\Factories\MilestoneFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $project_id
 * @property string|null $batch_id
 * @property string $title
 * @property string $kind
 * @property string|null $description
 * @property Carbon $occurred_on
 * @property int|null $created_by
 * @property string|null $device_id
 * @property Carbon $recorded_at
 * @property int $version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['project_id', 'batch_id', 'title', 'kind', 'description', 'occurred_on', 'created_by', 'device_id', 'recorded_at'])]
class Milestone extends Model
{
    /** @use HasFactory<MilestoneFactory> */
    use HasFactory, Syncable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'occurred_on' => 'date',
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
     * @return BelongsTo<Batch, $this>
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
