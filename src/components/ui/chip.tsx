import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// A filter chip: a 36px pill. Selected is the burgundy fill with white text;
// unselected is white with a hairline border. Below `lg` an invisible ::after
// stretches the tap area to 44px without making the row taller. Usually a link
// (asChild), so the filters work before JavaScript; the caller marks the
// chosen one (aria-current or aria-pressed) and passes `selected`.
const chipVariants = cva(
  "relative inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none after:absolute after:inset-x-0 after:-inset-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:after:hidden [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      selected: {
        true: "border-brand-strong bg-brand-strong text-white hover:bg-brand-deep",
        false: "border-border bg-surface text-charcoal hover:border-charcoal/25 hover:bg-subtle",
      },
    },
    defaultVariants: { selected: false },
  }
)

function Chip({
  className,
  selected = false,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof chipVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="chip"
      data-selected={selected || undefined}
      className={cn(chipVariants({ selected }), className)}
      {...props}
    />
  )
}

export { Chip, chipVariants }
