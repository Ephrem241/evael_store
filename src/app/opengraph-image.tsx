import { ImageResponse } from "next/og"

import { BRAND_NAME } from "@/lib/brand"
import { BRAND_COLORS } from "@/lib/brand-mark"
import { BrandMarkImage } from "@/lib/brand-mark-image"

// The picture shown when a page without its own image (the home page, a
// category with no photo, ...) is shared: the logo lockup on the warm cream,
// no sentence. The same image serves English and Amharic pages, and the image
// renderer has no Ethiopic font, so text in it would be Latin-only anyway.
// (The wordmark is in the renderer's own sans: it takes only ttf/otf/woff,
// and the site's fonts are self-hosted as woff2.) The lockup follows the
// header (layout/logo.tsx): the bag mark, then "EVAEL" in widely spaced
// capitals over "STORE" in dark gold between two hairlines.
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
          color: BRAND_COLORS.primaryDeepest,
        }}
      >
        <BrandMarkImage size={230} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 140, fontWeight: 700, letterSpacing: 16, lineHeight: 1 }}>{first.toUpperCase()}</div>
          {rest.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                marginTop: 24,
                color: BRAND_COLORS.goldInk,
                fontSize: 44,
                fontWeight: 600,
                letterSpacing: 16,
              }}
            >
              <div style={{ display: "flex", flex: 1, height: 3, background: BRAND_COLORS.gold }} />
              {rest.join(" ").toUpperCase()}
              <div style={{ display: "flex", flex: 1, height: 3, background: BRAND_COLORS.gold }} />
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
