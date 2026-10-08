import type { ReactNode } from "react"
import { cn } from "cn"

import { CarouselControls } from "@/components/home/carousel-controls"

// A sideways-scrolling row of cards that snaps to each one, with round arrows
// on its edges from `lg` up (phones and tablets swipe). The caller gives each
// item its width (`itemClassName`), chosen so the last visible card peeks out
// on phones — the cue that the row scrolls. The row is a named, focusable
// region, so the keyboard can scroll it too.
//
// `bleed`: on phones and tablets the row runs to the screen edges (its first
// card still lines up with the page margin).
function ProductRail({
  id,
  label,
  items,
  itemClassName,
  bleed = true,
  className,
}: {
  id: string
  /** The region's accessible name ("Trending Products, scrollable list"). */
  label: string
  items: { key: string; node: ReactNode }[]
  itemClassName: string
  bleed?: boolean
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        id={id}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn(
          // The focus ring stands off on a cream gap, so it shows on the dark Flash Deals panel too.
          "no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pt-1 pb-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:gap-4",
          bleed && "-mx-4 scroll-px-4 px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
        )}
      >
        {items.map((item) => (
          <div key={item.key} className={cn("shrink-0 snap-start", itemClassName)}>
            {item.node}
          </div>
        ))}
      </div>
      <CarouselControls targetId={id} />
    </div>
  )
}

export { ProductRail }
