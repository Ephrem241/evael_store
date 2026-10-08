import Link from "next/link"
import { cn } from "cn"

import { BRAND_NAME } from "@/lib/brand"
import { BRAND_MARK, BRAND_MARK_SIZE, BRAND_MARK_VIEWBOX } from "@/lib/brand-mark"

// The bag mark (brand-mark.ts), in the theme's colours. On light surfaces: a
// burgundy tile with a gold bag and a deep burgundy "E"; on dark ones it is
// turned around, a gold tile with a deep burgundy bag and a gold "E". The tile
// deepens while the logo link is hovered.
function BrandMark({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return (
    <svg aria-hidden viewBox={BRAND_MARK_VIEWBOX} className={cn("shrink-0", className)}>
      <rect
        width={BRAND_MARK_SIZE}
        height={BRAND_MARK_SIZE}
        rx={BRAND_MARK.tileRadius}
        className={cn("transition-colors", inverse ? "fill-gold" : "fill-brand group-hover:fill-brand-strong")}
      />
      <path
        d={BRAND_MARK.handle}
        fill="none"
        strokeWidth={BRAND_MARK.handleWidth}
        strokeLinecap="round"
        className={inverse ? "stroke-brand-deepest" : "stroke-gold"}
      />
      <path d={BRAND_MARK.body} className={inverse ? "fill-brand-deepest" : "fill-gold"} />
      <path
        d={BRAND_MARK.letter}
        fill="none"
        strokeWidth={BRAND_MARK.letterWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={inverse ? "stroke-gold" : "stroke-brand-deepest"}
      />
    </svg>
  )
}

// The logo: the bag mark beside the wordmark — "EVAEL" in the display face,
// capitals spaced 0.12em, with "STORE" small and widely spaced between two
// hairlines beneath it. The tagline is not part of the logo; the headers set
// it under the lockup themselves.
//
// `variant="light"` is for dark surfaces (the phone header, the footer, the
// admin): the name turns white, "STORE" and the mark gold (7.2:1 on the
// footer, 5.0:1 on the phone header's burgundy). On light surfaces the name is
// the deepest burgundy and "STORE" the dark gold (5.5:1 on cream).
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
        "group inline-flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background max-lg:min-h-11 lg:gap-2.5",
        light && "focus-visible:ring-gold focus-visible:ring-offset-transparent",
        className
      )}
    >
      <BrandMark inverse={light} className="size-9 lg:size-10" />
      <span aria-hidden className="flex flex-col items-stretch leading-none">
        <span
          className={cn(
            "font-display text-[1.375rem] font-bold tracking-[0.12em] uppercase lg:text-[1.5rem]",
            light ? "text-white" : "text-brand-deepest"
          )}
        >
          {first}
        </span>
        {rest.length > 0 && (
          <span
            className={cn(
              "mt-1 flex items-center gap-1.5 text-[0.625rem] font-semibold tracking-[0.3em] uppercase",
              light ? "text-gold" : "text-gold-ink"
            )}
          >
            <span className="h-px flex-1 bg-current opacity-60" />
            <span className="-mr-[0.3em]">{rest.join(" ")}</span>
            <span className="h-px flex-1 bg-current opacity-60" />
          </span>
        )}
      </span>
    </Link>
  )
}

export { Logo, BrandMark }
