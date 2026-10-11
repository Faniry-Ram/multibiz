<?php

namespace App\Domain\Finance\Enums;

enum HeadcountReason: string
{
    case Death = 'death';
    case Entry = 'entry';
    case Sale = 'sale';
    case Cull = 'cull';
}
