import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Loader2 } from "lucide-react"
import { Slot } from "radix-ui"

// Every button shares: an 8px corner (pills say so in their variant), a 2px
// focus ring 2px clear of the button, 50% opacity when disabled, and a slight
// press (scale 0.98, 100ms). Corners are written as `rounded-(--radius-…)` so
// a caller's own `rounded-full` replaces them cleanly (the class merger can't
// tell that `rounded-control` and `rounded-full` are the same property).
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-(--radius-control) border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,scale] duration-100 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // `default` is the spec's `primary`: Add to Cart, Buy Now, Checkout, Subscribe.
        default: "bg-brand-strong text-white hover:bg-brand-deep",
        primary: "bg-brand-strong text-white hover:bg-brand-deep",
        // "Shop Now" on the hero: the brighter burgundy, as a pill.
        hero: "h-11 rounded-full bg-brand px-6 text-white hover:bg-brand-deep max-lg:h-11",
        // "Explore Deals": a gold-edged pill whose text is the dark gold (5.5:1).
        "outline-gold":
          "h-11 rounded-full border-gold-border bg-transparent px-6 text-gold-ink hover:bg-brand-soft max-lg:h-11",
        // "Shop Deals", "View All Deals": gold with the deepest burgundy on it
        // (6.8:1). White on gold would be 2.4:1, whatever the mockup shows.
        gold: "bg-gold text-brand-deepest hover:bg-[color-mix(in_srgb,var(--color-gold),var(--color-brand-deepest)_12%)]",
        // The round white button over photos and beside rails (carousel arrows,
        // back, the heart). 36px; its invisible ::after reaches 44px below `lg`.
        "icon-circle":
          "relative size-9 rounded-full border-border bg-surface text-charcoal shadow-(--shadow-soft) after:absolute after:-inset-1 hover:bg-subtle max-lg:size-9 lg:after:hidden",
        // "View All →": small burgundy text, underlined on hover.
        "ghost-link":
          "h-auto gap-1 rounded-(--radius-control) px-0 py-1 text-xs text-brand-ink underline-offset-4 hover:underline max-lg:h-auto max-lg:min-h-11",
        // A neutral outline that warms to the brand on hover. Its text is charcoal.
        outline:
          "border-charcoal/15 bg-card text-charcoal hover:border-brand hover:bg-brand-soft aria-expanded:bg-brand-soft dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        soft: "bg-brand-soft text-brand-ink hover:bg-[color-mix(in_srgb,var(--color-brand-soft),var(--color-brand)_10%)] hover:text-brand-deep",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link: "text-brand-ink underline-offset-4 hover:underline",
      },
      size: {
        // Below `lg` the default and icon sizes are 44px, the smallest
        // comfortable tap target on a phone; from `lg` up they stay 40px.
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 max-lg:h-11",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-[15px] has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10 max-lg:size-11",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    compoundVariants: [
      // The pills and the round button carry their own size whatever `size` says.
      { variant: ["hero", "outline-gold"], className: "h-11 px-6 max-lg:h-11" },
      { variant: "icon-circle", className: "size-9 px-0 max-lg:size-9" },
      { variant: "ghost-link", className: "h-auto px-0 py-1 text-xs max-lg:h-auto" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /**
     * Shows a spinner in place of the label and disables the button. The label
     * stays (transparent) underneath, so the button keeps its width and its
     * accessible name. Not available with `asChild`.
     */
    loading?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? disabled : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && !asChild ? (
        <span className="inline-grid place-items-center *:[grid-area:1/1]">
          <span className="inline-flex items-center gap-[inherit] opacity-0">{children}</span>
          <Loader2 aria-hidden className="animate-spin" />
        </span>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
