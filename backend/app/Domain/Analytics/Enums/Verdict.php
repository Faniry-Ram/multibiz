<?php

namespace App\Domain\Analytics\Enums;

enum Verdict: string
{
    case Starting = 'starting';
    case Profitable = 'profitable';
    case Watch = 'watch';
    case Loss = 'loss';
}
