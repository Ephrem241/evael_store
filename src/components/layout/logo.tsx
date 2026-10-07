import Link from "next/link"
import { cn } from "cn"

import { BRAND_NAME } from "@/lib/brand"
import { BRAND_MARK, BRAND_MARK_SIZE, BRAND_MARK_VIEWBOX } from "@/lib/brand-mark"

// The bag mark (brand-mark.ts), drawn with the theme's colours. Its tile
// deepens to the strong orange while the logo link is hovered.
function BrandMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox={BRAND_MARK_VIEWBOX} className={cn("shrink-0", className)}>
      <rect
        width={BRAND_MARK_SIZE}
        height={BRAND_MARK_SIZE}
        rx={BRAND_MARK.tileRadius}
        className="fill-brand transition-colors group-hover:fill-brand-strong"
      />
      <path
        d={BRAND_MARK.handle}
        fill="none"
        stroke="white"
        strokeWidth={BRAND_MARK.handleWidth}
        strokeLinecap="round"
      />
      <path d={BRAND_MARK.body} fill="white" />
      <path
        d={BRAND_MARK.letter}
        fill="none"
        strokeWidth={BRAND_MARK.letterWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-brand-strong"
      />
    </svg>
  )
}

// The logo: the bag mark beside the wordmark — "Evael" bold, with "STORE"
// small and letter-spaced in orange beneath it. The tile carries the brand
// orange, so the name itself is charcoal, which keeps the lockup from being
// one block of orange.
//
// `variant="light"` is for dark surfaces (the footer, the admin): the name
// turns white and "STORE" takes the gold (7.2:1 on the footer's near-black;
// on light surfaces it is the burgundy ink, 10.9:1 on white).
function Logo({
  className,
  variant = "default",
}: {
  className?: string
  variant?: "default" | "light"
}) {
  const light = variant === "light"
  const [first, ...rest] = BRAND_NAME.split(" ")

  return (
    <Link
      href="/"
      aria-label={BRAND_NAME}
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:min-h-11 lg:gap-2.5",
        className
      )}
    >
      <BrandMark className="size-9 lg:size-11" />
      <span aria-hidden className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[1.375rem] font-bold tracking-[-0.04em] sm:text-2xl lg:text-[1.75rem]",
            light ? "text-white" : "text-charcoal"
          )}
        >
          {first}
        </span>
        {rest.length > 0 && (
          <span
            className={cn(
              "mt-1 pl-px text-[0.625rem] font-semibold tracking-[0.24em] uppercase lg:text-[0.6875rem]",
              light ? "text-gold" : "text-brand-ink"
            )}
          >
            {rest.join(" ")}
          </span>
        )}
      </span>
    </Link>
  )
}

export { Logo }
