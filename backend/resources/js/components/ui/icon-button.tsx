import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const iconButtonVariants = cva(
    "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px] focus-visible:ring-2 focus-visible:ring-primary/50",
    {
        variants: {
            variant: {
                outline: 'border border-border text-text2 hover:bg-surface2',
                ghost: 'text-muted hover:bg-surface2 hover:text-text',
                primary: 'bg-primary text-white hover:bg-primary/90',
            },
            size: {
                default: 'size-10',
                sm: 'size-8 [&_svg:not([class*="size-"])]:size-4',
                xs: 'size-6 rounded-[7px] [&_svg:not([class*="size-"])]:size-3',
            },
        },
        defaultVariants: {
            variant: 'outline',
            size: 'default',
        },
    },
);

function IconButton({
    className,
    variant,
    size,
    asChild = false,
    'aria-label': ariaLabel,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof iconButtonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="icon-button"
            type={asChild ? undefined : 'button'}
            aria-label={ariaLabel}
            className={cn(iconButtonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { IconButton, iconButtonVariants };
