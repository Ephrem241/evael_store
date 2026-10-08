import { type LucideIcon } from "lucide-react"
import { cn } from "cn"

import { RemoteProductImage } from "@/components/product/remote-product-image"

// Fixed, on-brand gradients — no stock photos, no external image calls
// (spec Sections 11/53). Picked deterministically from the item's id so the
// same product/category always renders the same placeholder and server and
// client render identical markup (no hydration mismatch).
const GRADIENTS = [
  "bg-linear-to-br from-subtle to-background",
  "bg-linear-to-br from-brand/15 via-subtle/40 to-background",
  "bg-linear-to-br from-subtle/70 via-background to-subtle/30",
  "bg-linear-to-br from-charcoal/10 via-subtle/50 to-background",
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function ImagePlaceholder({
  seed,
  icon: Icon,
  label,
  imageUrl,
  sizes = "100vw",
  eager,
  aspectClassName = "aspect-square",
  decorative = false,
  fit = "cover",
  className,
}: {
  seed: string
  icon: LucideIcon
  label: string
  /**
   * Admin-settable (Phase 11). No file storage exists yet (Supabase Storage
   * is Phase 12), so this is a plain URL rather than a real upload. When
   * set, a real image renders on top of the gradient fallback below; a
   * failed load just leaves the fallback visible, and an unset URL (every
   * seed product) behaves exactly as before.
   */
  imageUrl?: string | null
  /**
   * How wide this image is displayed, as an HTML `sizes` value — say it
   * truthfully (e.g. "96px" for a cart thumbnail) so a small resized copy is
   * downloaded instead of the full-size original.
   */
  sizes?: string
  /** Load immediately instead of lazily: for the image the page opens with. */
  eager?: boolean
  aspectClassName?: string
  /**
   * The picture repeats a name shown right next to it (a table row, a list
   * item), so it is hidden from assistive technology instead of being read twice.
   */
  decorative?: boolean
  /**
   * "contain": the whole photo, 12px clear of the edges, on the plain subtle
   * well (product cards: packshots are never cropped). "cover" fills the box.
   */
  fit?: "cover" | "contain"
  className?: string
}) {
  const contain = fit === "contain"
  const gradient = contain ? "bg-subtle" : GRADIENTS[hashString(seed) % GRADIENTS.length]

  return (
    <div
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-image",
        aspectClassName,
        gradient,
        className
      )}
    >
      <Icon aria-hidden className="size-10 text-brand-ink/40" />
      {imageUrl && (
        <RemoteProductImage
          src={imageUrl}
          alt={decorative ? "" : label}
          sizes={sizes}
          eager={eager}
          className={contain ? "object-contain p-3" : undefined}
        />
      )}
    </div>
  )
}

export { ImagePlaceholder }
