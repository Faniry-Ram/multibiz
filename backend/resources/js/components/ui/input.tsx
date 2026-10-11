import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-border text-text placeholder:text-muted flex h-10 w-full min-w-0 rounded-lg border bg-bg px-3 text-[14.5px] transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
        'aria-invalid:border-neg aria-invalid:ring-neg/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
