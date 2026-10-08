import Link from "next/link"
import { cn } from "cn"

import { getT } from "@/lib/i18n/server"
import { buildPageUrl, type RawParams } from "@/components/catalog/listing-url"

function PageLink({
  page,
  disabled,
  rawParams,
  basePath,
  label,
  symbol,
}: {
  page: number
  disabled: boolean
  rawParams: RawParams
  basePath: string
  label: string
  symbol: string
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="flex size-10 items-center justify-center rounded-(--radius-control) text-sm text-muted-text/40"
      >
        {symbol}
      </span>
    )
  }

  return (
    <Link
      href={buildPageUrl(basePath, rawParams, page)}
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-(--radius-control) text-sm text-charcoal outline-none hover:bg-subtle focus-visible:ring-2 focus-visible:ring-ring"
    >
      {symbol}
    </Link>
  )
}

async function Pagination({
  page,
  totalPages,
  rawParams,
  basePath,
}: {
  page: number
  totalPages: number
  rawParams: RawParams
  basePath: string
}) {
  if (totalPages <= 1) return null

  const t = await getT()
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  // Desktop only: phones and tablets get "Load more" instead (LoadMoreProducts).
  return (
    <nav aria-label={t("catalog.pagination.label")} className="hidden items-center justify-center gap-1 lg:flex">
      <PageLink
        page={page - 1}
        disabled={page <= 1}
        rawParams={rawParams}
        basePath={basePath}
        label={t("catalog.pagination.previous")}
        symbol="‹"
      />
      {pages.map((p) => (
        <Link
          key={p}
          href={buildPageUrl(basePath, rawParams, p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "flex size-10 items-center justify-center rounded-(--radius-control) text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            p === page ? "bg-brand-strong font-semibold text-white" : "text-charcoal hover:bg-subtle"
          )}
        >
          {p}
        </Link>
      ))}
      <PageLink
        page={page + 1}
        disabled={page >= totalPages}
        rawParams={rawParams}
        basePath={basePath}
        label={t("catalog.pagination.next")}
        symbol="›"
      />
    </nav>
  )
}

export { Pagination }
