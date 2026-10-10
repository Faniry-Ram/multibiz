<?php

namespace App\Domain\Finance\Models;

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Enums\TransactionType;
use App\Domain\Identity\Models\User;
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
 * @property string $business_id
 * @property string $name
 * @property TransactionType $kind
 * @property string|null $color
 * @property int|null $created_by
 * @property int $version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['business_id', 'name', 'kind', 'color', 'created_by'])]
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
            'kind' => TransactionType::class,
        ];
    }

    /**
     * @return BelongsTo<Business, $this>
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<Transaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
