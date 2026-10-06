import Link from "next/link"
import { cn } from "cn"

import { BRAND_NAME } from "@/lib/brand"

// The wordmark: "Evael" large and bold in brand orange, with "Store" small
// beneath it. (The bag mark is the app icon and share image; see brand-mark.ts.)
//
// The orange is the brand's bright primary, which reaches only 3:1 on the
// light page — fine here because the word is always display-size bold text
// (WCAG "large text"), never smaller than 22px.
//
// `variant="light"` is for dark surfaces (the footer): "Store" turns white.
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
        "group inline-flex shrink-0 flex-col justify-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:min-h-11",
        className
      )}
    >
      <span aria-hidden className="flex flex-col leading-none">
        <span className="text-[1.6rem] font-bold tracking-[-0.04em] text-brand transition-colors group-hover:text-brand-strong sm:text-[1.75rem] lg:text-[2rem]">
          {first}
        </span>
        {rest.length > 0 && (
          <span
            className={cn(
              "mt-0.5 pl-0.5 text-[0.7rem] font-medium tracking-[0.02em] lg:text-xs",
              light ? "text-white/80" : "text-muted-text"
            )}
          >
            {rest.join(" ")}
          </span>
        )}
      </span>
    </Link>
  )
}

export { Logo }
