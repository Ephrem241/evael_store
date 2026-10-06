"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Clock, ImageIcon, Search } from "lucide-react"
import { cn } from "cn"

import { formatPrice } from "@/lib/currency"
import { nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import type { SearchSuggestions } from "@/lib/services/catalog-client"
import { getCategoryIcon } from "@/components/product/category-icons"
import { RemoteProductImage } from "@/components/product/remote-product-image"
import { useRecentSearchesStore } from "@/lib/store/recent-searches"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function SearchBar({
  className,
  placeholder,
  size = "md",
}: {
  className?: string
  placeholder?: string
  /** "lg" is the roomier bar used on phones, where search is a primary action. */
  size?: "md" | "lg"
}) {
  const t = useT()
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLFormElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  // The bar is rendered twice (desktop and phone header), so ids must be per instance.
  const uid = React.useId()
  const recentQueries = useRecentSearchesStore((s) => s.queries)
  const addRecentSearch = useRecentSearchesStore((s) => s.add)
  const clearRecentSearches = useRecentSearchesStore((s) => s.clear)
  const [suggestions, setSuggestions] = React.useState<SearchSuggestions>({
    products: [],
    categories: [],
  })

  const trimmed = query.trim()

  // Type-ahead straight from the database, debounced so each keystroke
  // doesn't fire a request.
  React.useEffect(() => {
    if (!trimmed) return
    let cancelled = false
    const timer = setTimeout(() => {
      // Loaded on the first search, not with every page (it brings the
      // Supabase client with it).
      import("@/lib/services/catalog-client")
        .then((m) => m.searchSuggestions(trimmed))
        .then((result) => {
          if (!cancelled) setSuggestions(result)
        })
        .catch((error) => console.error(error))
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [trimmed])

  const matchingProducts = trimmed ? suggestions.products : []
  const matchingCategories = trimmed ? suggestions.categories : []
  const showRecent = !trimmed && recentQueries.length > 0
  const hasMatches = matchingProducts.length > 0 || matchingCategories.length > 0
  const showSuggestions = open && (hasMatches || showRecent)

  function go(url: string) {
    setOpen(false)
    router.push(url)
  }

  function submitSearch(value: string) {
    const q = value.trim()
    if (!q) return
    addRecentSearch(q)
    go(`/search?q=${encodeURIComponent(q)}`)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    submitSearch(query)
  }

  function handleBlur(e: React.FocusEvent) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false)
    }
  }

  // Arrow keys move through the suggestions like a menu: Down from the field
  // enters the list, Up from the first one returns to the field.
  function moveThroughSuggestions(direction: 1 | -1) {
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("[data-suggestion]") ?? [])
    const next = items[items.indexOf(document.activeElement as HTMLElement) + direction]
    if (next) next.focus()
    else if (direction === -1) inputRef.current?.focus()
  }

  function closeSuggestions() {
    // Focus first, close last: focusing the field opens the list again (its
    // onFocus), and the last state update wins.
    inputRef.current?.focus()
    setOpen(false)
  }

  // Suggestions appear without any focus change, so their number is read out.
  const suggestionCount = matchingCategories.length + matchingProducts.length

  return (
    <form
      ref={containerRef}
      role="search"
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      className={cn("relative flex items-center", className)}
    >
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true) // typing again after Escape brings the suggestions back
        }}
        onFocus={() => {
          setOpen(true)
          // Warm the suggestions code while the shopper is still typing, so
          // the first suggestion doesn't wait for it to download.
          void import("@/lib/services/catalog-client")
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
          else if (e.key === "ArrowDown" && showSuggestions) {
            e.preventDefault()
            moveThroughSuggestions(1)
          }
        }}
        placeholder={placeholder ?? t("search.placeholder")}
        aria-label={t("search.label")}
        autoComplete="off"
        // 15px text from `lg` up; below it the Input's own 16px applies, so iOS
        // doesn't zoom in when the phone search bar is tapped. The heights are
        // set for every width (`max-lg:` too), or the Input's phone height
        // would replace them there.
        className={cn(
          "rounded-full border-charcoal/15 bg-subtle/60 pl-11 pr-14 text-[15px] transition-[background-color,border-color,box-shadow] placeholder:text-muted-text hover:border-charcoal/25 focus-visible:bg-card",
          size === "lg" ? "h-12 max-lg:h-12" : "h-11 max-lg:h-11"
        )}
      />
      <Search aria-hidden className="pointer-events-none absolute left-4 size-[18px] text-muted-text" />
      <Button
        type="submit"
        size="icon"
        // 44px below `lg` (the Button's icon size there), 2px in from the field's
        // edge on every side of the 48px phone search field.
        className="absolute right-1.5 size-9 rounded-full bg-brand-strong text-white hover:bg-brand-deep max-lg:right-0.5"
        aria-label={t("search.submit")}
      >
        <ArrowRight className="size-4" />
      </Button>

      {/* Suggestions appear without any focus change, so their number is read out. */}
      <p role="status" className="sr-only">
        {showSuggestions && suggestionCount > 0 ? t.plural("search.suggestionCount", suggestionCount) : ""}
      </p>

      {showSuggestions && (
        <div
          ref={panelRef}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              moveThroughSuggestions(1)
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              moveThroughSuggestions(-1)
            } else if (e.key === "Escape") {
              closeSuggestions()
            }
          }}
          className="absolute top-full left-0 z-40 mt-2 w-full animate-in overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lift duration-150 fade-in slide-in-from-top-1">
          {showRecent && (
            <div role="group" aria-labelledby={`${uid}-recent`} className="border-b border-border p-2 last:border-b-0">
              <div className="flex items-center justify-between px-2 py-1">
                <p id={`${uid}-recent`} className="text-xs font-medium text-muted-text">{t("search.recent")}</p>
                <button
                  type="button"
                  data-suggestion
                  onClick={() => {
                    clearRecentSearches()
                    inputRef.current?.focus()
                  }}
                  className="rounded-md px-1.5 py-0.5 text-xs font-medium text-brand-ink hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {t("search.clearRecent")}
                </button>
              </div>
              {recentQueries.map((q) => (
                <button
                  key={q}
                  type="button"
                  data-suggestion
                  onClick={() => submitSearch(q)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-subtle"
                >
                  <Clock aria-hidden className="size-3.5 text-muted-text" />
                  {q}
                </button>
              ))}
            </div>
          )}

          {matchingCategories.length > 0 && (
            <div role="group" aria-labelledby={`${uid}-categories`} className="border-b border-border p-2 last:border-b-0">
              <p id={`${uid}-categories`} className="px-2 py-1 text-xs font-medium text-muted-text">{t("search.categories")}</p>
              {matchingCategories.map((c) => {
                const Icon = getCategoryIcon(c.slug)
                return (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    data-suggestion
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-subtle"
                  >
                    <Icon aria-hidden className="size-3.5 text-muted-text" />
                    {nameOf(c, t.locale)}
                  </Link>
                )
              })}
            </div>
          )}

          {matchingProducts.length > 0 && (
            <div role="group" aria-labelledby={`${uid}-products`} className="border-b border-border p-2">
              <p id={`${uid}-products`} className="px-2 py-1 text-xs font-medium text-muted-text">{t("search.products")}</p>
              {matchingProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  data-suggestion
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-subtle"
                >
                  <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-subtle">
                    <ImageIcon aria-hidden className="size-4 text-muted-text" />
                    {p.image_url && <RemoteProductImage src={p.image_url} alt="" sizes="40px" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{nameOf(p, t.locale)}</span>
                  <span className="shrink-0 text-xs font-semibold text-brand-ink">{formatPrice(p.price, t)}</span>
                </Link>
              ))}
            </div>
          )}

          {trimmed && (
            <div className="p-2">
              <button
                type="button"
                data-suggestion
                onClick={() => submitSearch(query)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-brand-ink hover:bg-brand-soft"
              >
                <span className="truncate">{t("search.seeAll", { query: trimmed })}</span>
                <ArrowRight aria-hidden className="size-4 shrink-0" />
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

export { SearchBar }
