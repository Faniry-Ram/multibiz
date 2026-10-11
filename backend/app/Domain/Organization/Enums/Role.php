<?php

namespace App\Domain\Organization\Enums;

/**
 * A user's role within an organization. `Entry` can record flux but has no access to
 * the pocket (Ma poche) or analytics; everyone else can view everything, and only
 * `Owner`/`Manager` can create or archive projects and categories.
 */
enum Role: string
{
    case Owner = 'owner';
    case Manager = 'manager';
    case Entry = 'entry';
    case Viewer = 'viewer';

    public function canManageProjects(): bool
    {
        return match ($this) {
            self::Owner, self::Manager => true,
            self::Entry, self::Viewer => false,
        };
    }

    public function canRecordEntries(): bool
    {
        return $this !== self::Viewer;
    }

    public function canAccessPocketAndAnalytics(): bool
    {
        return match ($this) {
            self::Owner, self::Manager, self::Viewer => true,
            self::Entry => false,
        };
    }
}
