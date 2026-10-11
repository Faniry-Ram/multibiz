import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function DateInput({
    className,
    ...props
}: Omit<React.ComponentProps<typeof Input>, 'type'>) {
    return (
        <Input
            type="date"
            className={cn('[color-scheme:light] dark:[color-scheme:dark]', className)}
            {...props}
        />
    );
}

export { DateInput };
