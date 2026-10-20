<?php

namespace App\Domain\Analytics\Enums;

enum Verdict: string
{
    case Starting = 'starting';
    case Profitable = 'profitable';
    case Watch = 'watch';
    case Loss = 'loss';

    /**
     * French badge label, per docs/maquette/README.md section 2.
     */
    public function label(): string
    {
        return match ($this) {
            self::Starting => 'En démarrage',
            self::Profitable => 'Rentable',
            self::Watch => 'À surveiller',
            self::Loss => 'En perte',
        };
    }

    /**
     * The design-token color role this verdict renders in.
     */
    public function tone(): string
    {
        return match ($this) {
            self::Starting => 'primary',
            self::Profitable => 'pos',
            self::Watch => 'warn',
            self::Loss => 'neg',
        };
    }
}
