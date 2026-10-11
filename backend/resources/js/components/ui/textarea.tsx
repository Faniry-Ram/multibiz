import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'border-border text-text placeholder:text-muted flex min-h-16 w-full rounded-lg border bg-bg px-3.5 py-2.5 text-[14.5px] leading-relaxed transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
                'aria-invalid:border-neg aria-invalid:ring-neg/20',
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
