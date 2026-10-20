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

    /**
     * French label for the type pill shown next to a flux row, per
     * docs/maquette/README.md (Historique/Vue d'ensemble "Derniers flux").
     */
    public function label(): string
    {
        return match ($this) {
            self::Sale => 'Vente',
            self::Expense => 'Dépense',
            self::Investment => 'Investissement',
            self::OwnerIn => 'Apport',
            self::OwnerOut => 'Retrait',
            self::Headcount => 'Effectif',
            self::Production => 'Ponte',
            self::Note => 'Note',
        };
    }

    /**
     * The design-token color role the type pill renders in.
     */
    public function tone(): string
    {
        return match ($this) {
            self::Sale => 'pos',
            self::Expense => 'neg',
            self::Investment, self::OwnerIn, self::OwnerOut => 'primary',
            self::Headcount, self::Production => 'slate',
            self::Note => 'warn',
        };
    }
}
