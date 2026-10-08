"use client"

import { useCallback, useRef, useState } from "react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { getCategoryIcon } from "@/components/product/category-icons"
import { SoldOutStamp } from "@/components/product/sold-out-stamp"
import { FavoriteButton } from "@/components/product/favorite-button"
import { ShareButton } from "@/components/product/share-button"
import { BackButton } from "@/components/navigation/back-button"
import { CartButton } from "@/components/layout/cart-button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Takes categorySlug (a plain string) rather than the resolved icon
// component: a Server Component parent can't pass a raw component
// reference as a prop into a Client Component (React can't serialize a
// function across that boundary) — resolving it here instead works because
// category-icons.ts is plain, un-"use client" data safely importable from
// either side.
//
// One view per REAL photo of the product (nothing invented): a single photo
// shows just that, several get a swipeable track and thumbnails (48px under
// the photo on phones, a column of 64px on its left on desktop; the current
// one has a burgundy border). A product with no photo yet shows the single
// gradient placeholder. The photo sits whole on the subtle well, and a tap
// enlarges it.
//
// Phones and tablets: the photo starts at the very top of the page (there is
// no header bar or bottom nav here — data-hide-brand-header), with round white
// buttons over it: back on the left; the heart, share and the cart (with its
// count) on the right. Desktop keeps the heart and share; the breadcrumb leads
// back and the header has the cart.
function ProductGallery({
  productId,
  productName,
  categorySlug,
  imageUrls,
  soldOut = false,
  backHref,
}: {
  productId: string
  productName: string
  categorySlug: string
  // The product's photos, main one first (plain strings, so they can cross the
  // server/client boundary).
  imageUrls: string[]
  // Marked sold out by the admin (stock 0): a SOLD OUT stamp sits over the photo.
  soldOut?: boolean
  /** Where the back button leads when there is no shop page to go back to. */
  backHref: string
}) {
  const t = useT()
  const Icon = getCategoryIcon(categorySlug)
  const views: (string | null)[] = imageUrls.length > 0 ? imageUrls : [null]
  const many = views.length > 1

  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  const scrollToIndex = (i: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" })
  }

  const handleScroll = useCallback(() => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth))
  }, [])

  return (
    <div className="lg:grid lg:grid-cols-[4rem_minmax(0,1fr)] lg:items-start lg:gap-3">
      <div className="relative lg:order-2">
        <div className="relative overflow-hidden bg-subtle max-sm:-mx-4 max-lg:-mt-4 sm:mx-auto sm:max-w-md sm:rounded-card sm:border sm:border-border lg:max-w-none">
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {views.map((url, i) => (
              <button
                key={`${productId}-${i}`}
                type="button"
                // One stop in the tab order: the photo on show (the thumbnails
                // move between photos), not every slide of the track.
                tabIndex={i === activeIndex ? 0 : -1}
                onClick={() => setZoomOpen(true)}
                className="w-full shrink-0 snap-center cursor-zoom-in transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset max-lg:active:opacity-90"
                aria-label={t("product.gallery.enlarge", { index: i + 1, total: views.length, name: productName })}
              >
                <ImagePlaceholder
                  seed={`${productId}-${i}`}
                  icon={Icon}
                  label={t("product.gallery.view", { name: productName, index: i + 1 })}
                  imageUrl={url}
                  // The photo the product page opens with: half the width on desktop,
                  // full width on a phone. It is the largest thing on screen (LCP).
                  sizes="(min-width: 1024px) 50vw, (min-width: 640px) 448px, 100vw"
                  eager={i === 0}
                  fit="contain"
                  className="rounded-none"
                />
              </button>
            ))}
          </div>
          {soldOut && <SoldOutStamp label={t("product.stock.soldOut")} size="lg" />}
        </div>

        {/* The buttons over the photo. The marker hides the burgundy phone header. */}
        <div
          data-hide-brand-header
          className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 max-lg:-mt-4 max-lg:pt-[max(0.75rem,calc(env(safe-area-inset-top)+0.5rem))] max-sm:-mx-4 sm:mx-auto sm:max-w-md lg:max-w-none"
        >
          <BackButton fallbackHref={backHref} variant="circle" className="pointer-events-auto lg:invisible" />
          <div className="pointer-events-auto flex gap-2 lg:flex-col">
            <FavoriteButton productId={productId} />
            <ShareButton title={productName} />
            <CartButton variant="circle" className="lg:hidden" />
          </div>
        </div>
      </div>

      {many && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto sm:mx-auto sm:max-w-md lg:order-1 lg:mt-0 lg:max-w-none lg:flex-col lg:overflow-visible">
          {views.map((url, i) => (
            <button
              key={`${productId}-thumb-${i}`}
              type="button"
              aria-current={i === activeIndex}
              onClick={() => scrollToIndex(i)}
              className={cn(
                "size-12 shrink-0 overflow-hidden rounded-(--radius-control) border-2 bg-subtle transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:size-16",
                i === activeIndex ? "border-brand" : "border-transparent hover:border-border"
              )}
            >
              <ImagePlaceholder
                seed={`${productId}-${i}`}
                icon={Icon}
                label={t("product.gallery.thumb", { index: i + 1 })}
                imageUrl={url}
                sizes="64px"
                className="rounded-none"
              />
            </button>
          ))}
        </div>
      )}

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        {/* The photo carries its own text alternative, so no separate description. */}
        <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
          {/* Names the dialog for screen readers; the picture is the visible content. */}
          <DialogTitle className="sr-only">{productName}</DialogTitle>
          <div className="relative overflow-hidden rounded-image bg-subtle">
            <ImagePlaceholder
              seed={`${productId}-${activeIndex}`}
              icon={Icon}
              label={productName}
              imageUrl={views[activeIndex] ?? null}
              sizes="(min-width: 640px) 512px, calc(100vw - 2rem)"
              fit="contain"
            />
            {soldOut && <SoldOutStamp label={t("product.stock.soldOut")} size="lg" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { ProductGallery }
