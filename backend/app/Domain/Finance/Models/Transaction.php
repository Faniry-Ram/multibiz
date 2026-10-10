<?php

namespace App\Domain\Finance\Models;

use App\Domain\Business\Models\Business;
use App\Domain\Finance\Enums\PaymentMethod;
use App\Domain\Finance\Enums\TransactionType;
use App\Domain\Identity\Models\User;
use App\Domain\Sync\Concerns\Syncable;
use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $business_id
 * @property string $category_id
 * @property TransactionType $type
 * @property int $amount
 * @property PaymentMethod $payment_method
 * @property Carbon $occurred_at
 * @property string|null $note
 * @property string|null $source_type
 * @property string|null $source_id
 * @property int|null $created_by
 * @property int $version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['business_id', 'category_id', 'type', 'amount', 'payment_method', 'occurred_at', 'note', 'created_by'])]
class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory, Syncable;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => TransactionType::class,
            'payment_method' => PaymentMethod::class,
            'occurred_at' => 'datetime',
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
}
