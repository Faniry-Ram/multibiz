<?php

namespace App\Domain\Finance\Models;

use App\Domain\Finance\Enums\EntryType;
use App\Domain\Finance\Enums\HeadcountReason;
use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Batch;
use App\Domain\Project\Models\Project;
use App\Domain\Sync\Concerns\AppendOnly;
use Database\Factories\EntryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A single row of the immutable flux registry. Never updated, never deleted — see
 * App\Domain\Sync\Concerns\AppendOnly and App\Domain\Finance\Actions\ReverseEntry.
 *
 * @property string $id
 * @property string $organization_id
 * @property string $project_id
 * @property string|null $batch_id
 * @property string|null $category_id
 * @property EntryType $type
 * @property int|null $amount
 * @property float|null $quantity
 * @property int|null $unit_price
 * @property string|null $unit
 * @property int|null $headcount_delta
 * @property HeadcountReason|null $headcount_reason
 * @property int|null $useful_life_months
 * @property Carbon $occurred_at
 * @property Carbon $recorded_at
 * @property string|null $note
 * @property int|null $created_by
 * @property string|null $device_id
 * @property string|null $reverses_entry_id
 * @property int $version
 * @property Carbon|null $created_at
 */
#[Fillable([
    'organization_id', 'project_id', 'batch_id', 'category_id', 'type', 'amount', 'quantity',
    'unit_price', 'unit', 'headcount_delta', 'headcount_reason', 'useful_life_months',
    'occurred_at', 'recorded_at', 'note', 'created_by', 'device_id', 'reverses_entry_id',
])]
class Entry extends Model
{
    /** @use HasFactory<EntryFactory> */
    use AppendOnly, HasFactory;

    public const UPDATED_AT = null;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => EntryType::class,
            'headcount_reason' => HeadcountReason::class,
            'occurred_at' => 'datetime',
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
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return BelongsTo<Entry, $this>
     */
    public function reverses(): BelongsTo
    {
        return $this->belongsTo(Entry::class, 'reverses_entry_id');
    }
}
