<?php

namespace App\Domain\Finance\Enums;

/**
 * Also used for `categories.kind` — a category's kind and a transaction's type share
 * the same income/expense vocabulary.
 */
enum TransactionType: string
{
    case Income = 'income';
    case Expense = 'expense';
}
