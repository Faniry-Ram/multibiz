<?php

namespace App\Domain\Sync\Models;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Records that a client's sync push operation (identified by its client-generated
 * `op_id`) has already been applied, and what the result was — so a retried push
 * (e.g. after a dropped connection) is idempotent instead of double-applied.
 *
 * @property string $op_id
 * @property int $user_id
 * @property array<string, mixed> $result
 * @property Carbon $processed_at
 */
#[Fillable(['op_id', 'user_id', 'result', 'processed_at'])]
class ProcessedOperation extends Model
{
    protected $primaryKey = 'op_id';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'result' => 'array',
            'processed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
