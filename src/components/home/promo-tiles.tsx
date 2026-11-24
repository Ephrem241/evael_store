import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import type { Translator } from "@/lib/i18n/translator"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { getCategoryIcon } from "@/components/product/category-icons"
import { DiscountBadge } from "@/components/product/discount-badge"
import { Price } from "@/components/product/price"

// How many products each tile shows.
const PER_TILE = 2

export interface PromoTile {
  id: string
  title: string
  href: string
  products: ProductWithCategory[]
}

// The row of promo tiles under the categories, in the marketplace style:
// each tile is a white card with its title and a "›" link to the whole list,
// and two of its real products (photo, discount pill, price). Trending, New
// Arrivals and Deals: each tile is a way into a list, not the list itself
// (the "For You" feed at the end of the page lists everything).
//
// Desktop: the tiles side by side. Phones and tablets: a sideways row where
// the next tile peeks out. A tile with fewer than two products is left out,
// and the row with it if none is left.
async function PromoTiles({ tiles }: { tiles: PromoTile[] }) {
  const shown = tiles.filter((tile) => tile.products.length >= PER_TILE)
  if (shown.length === 0) return null
  const t = await getT()

  return (
    <div
      style={{ "--tile-columns": shown.length } as React.CSSProperties}
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-[repeat(var(--tile-columns),minmax(0,1fr))] lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {shown.map((tile) => (
        <section
          key={tile.id}
          aria-labelledby={`promo-${tile.id}`}
          className="w-[78%] shrink-0 snap-start rounded-card border border-border bg-card p-3 sm:w-[46%] lg:w-auto lg:p-4"
        >
          <Link
            href={tile.href}
            className="group mb-3 flex items-center justify-between gap-2 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h2 id={`promo-${tile.id}`} className="truncate text-[15px] font-bold text-charcoal lg:text-base">
              {tile.title}
            </h2>
            <ChevronRight
              aria-hidden
              className="size-4 shrink-0 text-muted-text transition-transform group-hover:translate-x-0.5 group-hover:text-brand-ink"
            />
          </Link>
          <ul className="grid grid-cols-2 gap-2 lg:gap-3">
            {tile.products.slice(0, PER_TILE).map((product) => (
              <li key={product.id}>
                <PromoProduct product={product} t={t} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

// One product in a tile: the whole thing is one link (its name is the
// photo's alt text), with the price under the photo.
function PromoProduct({ product, t }: { product: ProductWithCategory; t: Translator }) {
  const name = nameOf(product, t.locale)
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-image outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative block overflow-hidden rounded-image bg-subtle">
        <ImagePlaceholder
          seed={product.id}
          icon={getCategoryIcon(product.categorySlug)}
          label={name}
          imageUrl={product.image_url}
          sizes="(min-width: 1024px) 180px, 36vw"
          fit="contain"
          className="rounded-none transition-transform duration-200 ease-out group-hover:scale-[1.03]"
        />
        <DiscountBadge
          price={product.price}
          compareAtPrice={product.compare_at_price}
          t={t}
          className="pointer-events-none absolute top-1.5 left-1.5"
        />
      </span>
      <Price amount={product.price} t={t} className="mt-1.5 block text-sm" />
    </Link>
  )
}

export { PromoTiles }
