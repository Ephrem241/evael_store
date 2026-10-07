"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { Button } from "@/components/ui/button"

// Set once the shopper has moved from one page of the shop to another in
// this tab: from then on "back" can safely mean the browser's back, which
// stays inside the shop. (sessionStorage: per tab, gone when it closes.)
const IN_APP_KEY = "evael-in-app-navigation"

function cameFromThisShop(): boolean {
  try {
    if (sessionStorage.getItem(IN_APP_KEY) === "1") return true
  } catch {
    // Storage blocked: fall back to the referrer alone.
  }
  try {
    return !!document.referrer && new URL(document.referrer).origin === window.location.origin
  } catch {
    return false
  }
}

/** Renders nothing; remembers that a navigation inside the shop happened (see BackButton). */
function NavigationHistory() {
  const pathname = usePathname()
  const first = useRef(pathname)

  useEffect(() => {
    if (pathname === first.current) return
    try {
      sessionStorage.setItem(IN_APP_KEY, "1")
    } catch {
      // Storage blocked: BackButton falls back to the referrer.
    }
  }, [pathname])

  return null
}

// The phone bar's back arrow. A real link to the page above this one (so it
// works before JavaScript, and from a page opened directly); once the shopper
// has come here from another page of the shop it goes back instead, so the
// previous page — its scroll position, its filters — is where they land.
function BackButton({ fallbackHref = "/", className }: { fallbackHref?: string; className?: string }) {
  const t = useT()
  const router = useRouter()

  return (
    <Button variant="ghost" size="icon-lg" asChild className={cn("-ml-2 shrink-0 text-charcoal", className)}>
      <Link
        href={fallbackHref}
        aria-label={t("nav.back")}
        onClick={(event) => {
          if (window.history.length > 1 && cameFromThisShop()) {
            event.preventDefault()
            router.back()
          }
        }}
      >
        <ArrowLeft aria-hidden className="size-[22px]" strokeWidth={1.75} />
      </Link>
    </Button>
  )
}

export { BackButton, NavigationHistory }
