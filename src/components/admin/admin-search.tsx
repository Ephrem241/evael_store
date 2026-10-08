"use client"

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { nameOf } from "@/lib/i18n/content"
import { formatPrice } from "@/lib/currency"
import { useAdminProducts, useProfiles } from "@/lib/hooks/use-admin-data"
import { useAllOrders } from "@/lib/hooks/use-orders"
import { MIN_SEARCH_LENGTH, searchAdmin } from "@/lib/admin/admin-search"

interface Option {
  key: string
  href: string
  title: string
  details: string
}

interface Group {
  key: "products" | "orders" | "customers"
  label: string
  options: Option[]
}

// The top bar's search over products, orders and customers (spec section 4.2).
// Nothing is loaded until the field is first used; then it searches the same
// lists the admin pages show, in the browser. It is an ARIA combobox: the
// focus stays in the field while the arrow keys move through the grouped
// results, Enter opens the highlighted one, Escape closes the list (a second
// Escape clears the field). A polite status line says how many were found.
function AdminSearch({
  className,
  autoFocus = false,
  onDone,
}: {
  className?: string
  /** Focus the field as soon as it appears (the phone's search overlay). */
  autoFocus?: boolean
  /** Called after a result is opened, or on Escape in an empty field. */
  onDone?: () => void
}) {
  const t = useT()
  const router = useRouter()
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [used, setUsed] = useState(autoFocus)
  const [activeIndex, setActiveIndex] = useState(0)

  const products = useAdminProducts(used)
  const orders = useAllOrders(used)
  const profiles = useProfiles(used)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const groups = useMemo<Group[]>(() => {
    const found = searchAdmin(query, { products: products.data, orders: orders.data, profiles: profiles.data })
    const nameOfUser = new Map((profiles.data ?? []).map((profile) => [profile.id, profile.fullName]))
    const all: Group[] = [
      {
        key: "products",
        label: t("admin.search.products"),
        options: found.products.map((product) => ({
          key: product.id,
          href: `/admin/products/${product.id}/edit`,
          title: nameOf(product, t.locale),
          details: t("admin.search.productDetails", { sku: product.sku, price: formatPrice(product.price, t) }),
        })),
      },
      {
        key: "orders",
        label: t("admin.search.orders"),
        options: found.orders.map((order) => ({
          key: order.id,
          href: `/admin/orders/${order.id}`,
          title: `#${order.order_number}`,
          details: t("admin.search.orderDetails", {
            customer: nameOfUser.get(order.user_id) ?? t("admin.orders.deletedUser"),
            total: formatPrice(order.total, t),
          }),
        })),
      },
      {
        key: "customers",
        label: t("admin.search.customers"),
        options: found.customers.map((profile) => ({
          key: profile.id,
          href: `/admin/customers?q=${encodeURIComponent(profile.email)}`,
          title: profile.fullName,
          details: profile.email,
        })),
      },
    ]
    return all.filter((group) => group.options.length > 0)
  }, [query, products.data, orders.data, profiles.data, t])

  const options = groups.flatMap((group) => group.options)
  // Where each group's results start in that one flat list.
  const groupStarts = groups.map((_, i) => groups.slice(0, i).reduce((count, group) => count + group.options.length, 0))
  const active = Math.min(activeIndex, Math.max(options.length - 1, 0))
  const typed = query.trim()
  const loading = products.loading || orders.loading || profiles.loading
  const failed = !!(products.error || orders.error || profiles.error)
  const showPanel = open && typed.length > 0
  const showList = showPanel && options.length > 0
  const optionId = (index: number) => `${id}-option-${index}`

  // The one line that stands in for the results when there are none to show,
  // and is also what the status region announces.
  let message = ""
  if (typed.length > 0 && typed.replace(/^#/, "").length < MIN_SEARCH_LENGTH) message = t("admin.search.hint")
  else if (failed) message = t("admin.search.failed")
  else if (loading) message = t("admin.search.loading")
  else if (typed.length > 0 && options.length === 0) message = t("admin.search.noResults", { query: typed })
  const status = showList ? t.plural("admin.search.resultCount", options.length) : showPanel ? message : ""

  // Keep the highlighted result in view as the arrows move through a long list.
  useEffect(() => {
    if (showList) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: "nearest" })
  }, [id, active, showList])

  function choose(option: Option) {
    setQuery("")
    setOpen(false)
    inputRef.current?.blur()
    router.push(option.href)
    onDone?.()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (options.length === 0) return
      event.preventDefault()
      setOpen(true)
      const step = event.key === "ArrowDown" ? 1 : -1
      setActiveIndex((active + step + options.length) % options.length)
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (showList) choose(options[active])
    } else if (event.key === "Escape") {
      event.preventDefault()
      if (showPanel) setOpen(false)
      else if (query) setQuery("")
      else onDone?.()
    }
  }

  return (
    <div role="search" className={cn("relative", className)}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-text" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-label={t("admin.search.label")}
        aria-expanded={showList}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={showList ? optionId(active) : undefined}
        placeholder={t("admin.search.placeholder")}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        value={query}
        onFocus={() => {
          setUsed(true)
          setOpen(true)
        }}
        onBlur={() => setOpen(false)}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(0)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        className="h-11 w-full rounded-[10px] border border-border bg-card pr-3 pl-10 text-sm text-charcoal transition-colors outline-none placeholder:text-muted-text focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 max-lg:text-base [&::-webkit-search-cancel-button]:hidden"
      />

      {/* Pressing on a result must not take the focus out of the field first. */}
      <div
        hidden={!showPanel}
        onMouseDown={(event) => event.preventDefault()}
        className="absolute inset-x-0 top-full z-40 mt-2 max-h-[min(28rem,70vh)] overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-lift"
      >
        {!showList && message && <p className="px-3 py-2.5 text-sm text-muted-text">{message}</p>}
        <div role="listbox" id={`${id}-listbox`} aria-label={t("admin.search.label")} hidden={!showList}>
          {groups.map((group, groupIndex) => (
            <div key={group.key} role="group" aria-labelledby={`${id}-${group.key}`}>
              <div id={`${id}-${group.key}`} className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-text">
                {group.label}
              </div>
              {group.options.map((option, i) => {
                const optionIndex = groupStarts[groupIndex] + i
                return (
                  <div
                    key={option.key}
                    id={optionId(optionIndex)}
                    role="option"
                    aria-selected={optionIndex === active}
                    onClick={() => choose(option)}
                    onMouseMove={() => setActiveIndex(optionIndex)}
                    className={cn(
                      "flex min-h-11 cursor-pointer flex-col justify-center rounded-lg px-3 py-1.5",
                      optionIndex === active && "bg-subtle"
                    )}
                  >
                    <span className="truncate text-sm font-medium text-charcoal">{option.title}</span>
                    <span className="truncate text-xs text-muted-text">{option.details}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <p role="status" className="sr-only">
        {status}
      </p>
    </div>
  )
}

export { AdminSearch }
