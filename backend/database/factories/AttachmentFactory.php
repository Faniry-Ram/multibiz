<?php

namespace Database\Factories;

use App\Domain\Finance\Models\Attachment;
use App\Domain\Finance\Models\Entry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Attachment>
 */
class AttachmentFactory extends Factory
{
    protected $model = Attachment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'entry_id' => Entry::factory(),
            'path' => 'attachments/'.fake()->uuid().'.jpg',
            'mime' => 'image/jpeg',
            'size' => fake()->numberBetween(10_000, 2_000_000),
            'recorded_at' => now(),
        ];
    }
}
