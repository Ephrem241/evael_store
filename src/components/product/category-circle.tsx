import { createElement, type ReactNode } from "react"
import Link from "next/link"
import { cn } from "cn"

import { RemoteProductImage } from "@/components/product/remote-product-image"
import { getCategoryIcon } from "@/components/product/category-icons"

// One round category icon over its name, as marketplaces show categories: the
// category's photo in a circle (its icon until it has one, or if the photo
// fails), the name under it on up to two lines. The home page's "Shop by
// Category" grid and the row over the shop and category listings both use it.
//
// `active`: the category being browsed — a burgundy ring and bold name, and
// aria-current so screen readers say so too. `picture` replaces the photo
// (the Deals circle's own image); `tone="sale"` sets the name in the sale colour.
function CategoryCircle({
  href,
  name,
  slug,
  imageUrl,
  picture,
  active = false,
  tone = "default",
  sizes = "(min-width: 640px) 112px, 80px",
  className,
}: {
  href: string
  name: string
  /** Picks the fallback icon. */
  slug?: string
  imageUrl?: string | null
  picture?: ReactNode
  active?: boolean
  tone?: "default" | "sale"
  sizes?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex min-w-0 flex-col items-center gap-1.5 rounded-xl text-center outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span
        className={cn(
          "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full bg-subtle transition-transform group-active:scale-95",
          active ? "ring-2 ring-brand ring-offset-2 ring-offset-background" : "ring-1 ring-border group-hover:ring-brand/40"
        )}
      >
        {picture ?? (
          <>
            {createElement(getCategoryIcon(slug ?? ""), {
              "aria-hidden": true,
              className: "size-6 text-brand-ink lg:size-8",
              strokeWidth: 1.5,
            })}
            {imageUrl && <RemoteProductImage src={imageUrl} alt="" sizes={sizes} />}
          </>
        )}
      </span>
      <span
        className={cn(
          "line-clamp-2 text-[11px] leading-tight sm:text-xs",
          tone === "sale" ? "font-semibold text-sale" : active ? "font-semibold text-brand-ink" : "text-charcoal group-hover:text-brand-ink"
        )}
      >
        {name}
      </span>
    </Link>
  )
}

export { CategoryCircle }
