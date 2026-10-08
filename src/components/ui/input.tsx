import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // A white, 44px field with an 8px corner and a burgundy focus ring.
        // Desktop text unprefixed (text-sm), phones and tablets behind
        // `max-lg:` — 16px text there, so iOS never auto-zooms on focus. The
        // height is written for both (h-11, max-lg:h-11), so a caller's own
        // plain `h-12` replaces the desktop value and `max-lg:` the phone one.
        "h-11 w-full min-w-0 rounded-(--radius-control) border border-input bg-card px-3 py-1 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 max-lg:h-11 max-lg:text-base dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
