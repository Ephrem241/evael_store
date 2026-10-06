import { ImageResponse } from "next/og"

import { BrandMarkImage } from "@/lib/brand-mark-image"

// The home-screen icon on iOS (also used as the organization logo in
// structured data): the mark, larger. iOS rounds the corners itself, so the
// tile is square.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <BrandMarkImage size={size.width} tileRadius={0} />
      </div>
    ),
    { ...size }
  )
}
