<?php

namespace App\Domain\Project\Enums;

enum ProjectStatus: string
{
    case Active = 'active';
    case Archived = 'archived';
}
