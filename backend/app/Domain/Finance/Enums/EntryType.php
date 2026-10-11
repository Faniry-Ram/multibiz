<?php

namespace App\Domain\Finance\Enums;

/**
 * The type of a flux (`entries.type`). See docs/audit-architecture.md and the project
 * mission for the full semantics of each type.
 */
enum EntryType: string
{
    case Sale = 'sale';
    case Expense = 'expense';
    case Investment = 'investment';
    case OwnerIn = 'owner_in';
    case OwnerOut = 'owner_out';
    case Headcount = 'headcount';
    case Production = 'production';
    case Note = 'note';

    /**
     * Owner contributions/withdrawals never affect the project's result.
     */
    public function affectsResult(): bool
    {
        return match ($this) {
            self::Sale, self::Expense => true,
            self::Investment, self::OwnerIn, self::OwnerOut, self::Headcount, self::Production, self::Note => false,
        };
    }
}
