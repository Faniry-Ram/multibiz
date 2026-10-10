<?php

namespace App\Domain\Finance\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case MobileMoney = 'mobile_money';
    case Bank = 'bank';
    case Other = 'other';
}
