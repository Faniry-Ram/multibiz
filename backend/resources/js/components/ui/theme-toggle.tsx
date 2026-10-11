import { Moon, Sun } from 'lucide-react';

import { IconButton } from '@/components/ui/icon-button';
import { useAppearance } from '@/hooks/use-appearance';

function ThemeToggle({ className }: { className?: string }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <IconButton
            aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            className={className}
        >
            {isDark ? <Sun /> : <Moon />}
        </IconButton>
    );
}

export { ThemeToggle };
