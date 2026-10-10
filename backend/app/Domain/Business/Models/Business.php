<?php

namespace App\Domain\Business\Models;

use App\Domain\Finance\Models\Category;
use App\Domain\Finance\Models\Transaction;
use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;
use App\Domain\Sync\Concerns\Syncable;
use Database\Factories\BusinessFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property int $organization_id
 * @property string $name
 * @property string|null $type
 * @property string|null $color
 * @property string $currency
 * @property int|null $created_by
 * @property int $version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['organization_id', 'name', 'type', 'color', 'currency', 'created_by'])]
class Business extends Model
{
    /** @use HasFactory<BusinessFactory> */
    use HasFactory, Syncable;

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
     * @return HasMany<Transaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
