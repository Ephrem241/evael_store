import type { ReactNode } from "react"

// The top of every admin page (spec section 4.3): the title in the display
// face (28px from `md` up), one line of help under it, and the page's own
// actions on the right (below the title on phones). No hooks, so server
// pages can use it.
function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="font-display text-2xl leading-tight font-bold text-charcoal md:text-[1.75rem]">{title}</h1>
        {description && <p className="text-sm text-muted-text md:text-[0.9375rem]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export { AdminPageHeader }
