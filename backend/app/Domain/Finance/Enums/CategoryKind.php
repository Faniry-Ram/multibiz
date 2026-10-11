<?php

namespace App\Domain\Finance\Enums;

enum CategoryKind: string
{
    case Income = 'income';
    case Expense = 'expense';
    case Investment = 'investment';
}
