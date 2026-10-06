import { ImageResponse } from "next/og"

import { BRAND_NAME } from "@/lib/brand"
import { BRAND_COLORS } from "@/lib/brand-mark"
import { BrandMarkImage } from "@/lib/brand-mark-image"

// The picture shown when a page without its own image (the home page, a
// category with no photo, ...) is shared: the logo lockup, no sentence. The
// same image serves English and Amharic pages, and the image renderer has no
// Ethiopic font, so text in it would be Latin-only anyway. (The wordmark is in
// the renderer's own sans: it takes only ttf/otf/woff, and Inter is
// self-hosted as woff2.) The lockup matches the header (layout/logo.tsx): the
// bag mark, then "Evael" large in charcoal over "STORE" small, letter-spaced,
// in orange.
export const alt = BRAND_NAME
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  const [first, ...rest] = BRAND_NAME.split(" ")

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 52,
          background: BRAND_COLORS.background,
          color: BRAND_COLORS.text,
        }}
      >
        <BrandMarkImage size={230} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: -6, lineHeight: 1 }}>
            {first}
          </div>
          {rest.length > 0 && (
            <div
              style={{
                display: "flex",
                marginTop: 18,
                marginLeft: 6,
                color: BRAND_COLORS.primaryInk,
                fontSize: 52,
                fontWeight: 600,
                letterSpacing: 12,
              }}
            >
              {rest.join(" ").toUpperCase()}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
