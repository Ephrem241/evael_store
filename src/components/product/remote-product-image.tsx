"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "cn"

// Remote product and category photos live in Supabase Storage (public buckets).
// They are pre-downscaled to max 1600px and converted to WebP on upload (storage.ts).
// Serving them with `unoptimized` allows browsers to load them directly from Supabase's
// public CDN, avoiding Next.js's 7-second server-side optimizer fetch timeout on
// high-latency networks.

// A tiny, isolated client leaf so ImagePlaceholder itself can stay
// directive-free (it's called directly from Server Components today, e.g.
// category/[slug]/page.tsx, passing a resolved icon component — making
// ImagePlaceholder itself "use client" would break that exact call site,
// the same class of bug Phase 5 hit with ProductGallery). Only plain,
// serializable props cross into this boundary, never a component reference
// or callback, so it's safe to render from either a Server or Client parent.
// Rendered absolutely positioned OVER ImagePlaceholder's existing
// gradient+icon fallback — on load failure this simply hides itself, letting
// the fallback underneath show through with no callback back to the parent
// required.
//
// `sizes` tells the browser how wide the image is actually displayed at each
// viewport width, so it fetches a matching resized copy (not the 1600px file);
// images are lazy by default, `eager` is for the one that is the first thing a
// page shows (the product photo).
function RemoteProductImage({
  src,
  alt,
  sizes,
  eager = false,
  className,
}: {
  src: string
  alt: string
  sizes: string
  eager?: boolean
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  )
}

export { RemoteProductImage }
