"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Globe } from "lucide-react"
import { cn } from "cn"

import { LOCALES, LOCALE_NAMES, LOCALE_PARAM, type Locale } from "@/lib/i18n/config"
import { setLocale } from "@/lib/i18n/actions"
import { useT } from "@/lib/i18n/provider"

// Switching language: store the choice in the cookie, then show the page again
// in it. A `?lang=` in the address would override the cookie, so it is
// dropped; otherwise the page refreshes in place. Shared with the admin's
// language menu.
function useLocaleSwitch(): { choose: (locale: Locale) => void; pending: boolean } {
  const t = useT()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function choose(locale: Locale) {
    if (locale === t.locale) return
    startTransition(async () => {
      await setLocale(locale)
      const url = new URL(window.location.href)
      if (url.searchParams.has(LOCALE_PARAM)) {
        url.searchParams.delete(LOCALE_PARAM)
        router.replace(`${url.pathname}${url.search}`)
      } else {
        router.refresh()
      }
    })
  }

  return { choose, pending }
}

// Two-option control. `labels="short"` (EN | አማ) fits the bars; `labels="full"`
// (English | አማርኛ) is for the footer and the phone menu. Each option is written
// in its own language and script so it can be found without reading the
// current one.
//
// Tones: "light" (a pill group on light surfaces), "dark" (the same on the
// dark footer) and "bar" (plain white text with a divider, for the burgundy
// announcement bar; the current language is bold and underlined).
//
// `compact` (the admin's narrow phone bar) is instead ONE button that names
// the OTHER language ("አማ" while reading English, "EN" while reading Amharic)
// and switches to it.
function LanguageSwitcher({
  className,
  labels = "short",
  tone = "light",
  compact = false,
  showIcon = true,
}: {
  className?: string
  labels?: "short" | "full"
  tone?: "light" | "dark" | "bar"
  compact?: boolean
  /** The light and dark pills start with a small globe; leave it out where the row already has one (the account menu). */
  showIcon?: boolean
}) {
  const t = useT()
  const { choose, pending } = useLocaleSwitch()
  const dark = tone === "dark"

  if (compact) {
    const other = LOCALES.find((locale) => locale !== t.locale) ?? t.locale
    return (
      <button
        type="button"
        lang={other}
        disabled={pending}
        onClick={() => choose(other)}
        // Named in its own language: the button says which language it switches TO.
        aria-label={LOCALE_NAMES[other].native}
        className={cn(
          "inline-flex h-9 min-w-10 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-medium text-charcoal transition-colors hover:bg-subtle focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none max-lg:h-11 max-lg:min-w-11",
          other === "am" && "font-ethiopic-system",
          pending && "opacity-70",
          className
        )}
      >
        {LOCALE_NAMES[other].short}
      </button>
    )
  }

  if (tone === "bar") {
    return (
      <div
        role="group"
        aria-label={t("nav.language")}
        aria-busy={pending}
        className={cn("flex items-center gap-1.5 text-xs", pending && "opacity-70", className)}
      >
        {LOCALES.map((locale, i) => {
          const active = locale === t.locale
          return (
            <span key={locale} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden className="text-white/50">
                  |
                </span>
              )}
              <button
                type="button"
                lang={locale}
                aria-pressed={active}
                disabled={pending}
                onClick={() => choose(locale)}
                className={cn(
                  "min-h-6 rounded-sm px-1 text-white underline-offset-4 transition-colors outline-none hover:underline focus-visible:ring-2 focus-visible:ring-gold",
                  active ? "font-semibold underline" : "text-white/85",
                  locale === "am" && "font-ethiopic-system"
                )}
              >
                {labels === "full" ? LOCALE_NAMES[locale].native : LOCALE_NAMES[locale].short}
              </button>
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      aria-busy={pending}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-0.5",
        dark ? "border-white/20 bg-white/5" : "border-border bg-card",
        pending && "opacity-70",
        className
      )}
    >
      {showIcon && <Globe aria-hidden className={cn("mx-1.5 size-3.5", dark ? "text-white/60" : "text-muted-text")} />}
      {LOCALES.map((locale) => {
        const active = locale === t.locale
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={active}
            disabled={pending}
            onClick={() => choose(locale)}
            className={cn(
              "min-h-8 rounded-full px-3 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none max-lg:min-h-11",
              // Ethiopic label: system font, so it doesn't pull in the web font (see globals.css).
              locale === "am" && "font-ethiopic-system",
              dark
                ? active
                  ? "bg-brand-strong text-white"
                  : "text-white/80 hover:bg-white/10"
                : active
                  ? "bg-brand-strong text-white"
                  : "text-charcoal hover:bg-subtle"
            )}
          >
            {labels === "full" ? LOCALE_NAMES[locale].native : LOCALE_NAMES[locale].short}
          </button>
        )
      })}
    </div>
  )
}

export { LanguageSwitcher, useLocaleSwitch }
