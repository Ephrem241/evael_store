import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

// A page that is only a message: the 404s and the error page. Centred on the
// cream page (no card): a large gold "404" — or an icon disc for the other
// cases — the gold tick, the heading in the display face, one line of help,
// and the way on (a primary button, maybe a quieter link beside it). No hooks,
// so server and client pages (error.tsx) can both use it.
function StatusPage({
  code,
  icon: Icon,
  title,
  description,
  actions,
}: {
  /** A big decorative code ("404"); the heading says it in words. */
  code?: string
  icon?: LucideIcon
  title: string
  description: string
  actions: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-14 text-center sm:py-20">
      {code ? (
        <p aria-hidden className="font-display text-7xl leading-none font-bold text-gold-display sm:text-8xl">
          {code}
        </p>
      ) : (
        Icon && (
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft ring-8 ring-brand-soft/40">
            <Icon aria-hidden className="size-8 text-brand" strokeWidth={1.5} />
          </span>
        )
      )}
      <span aria-hidden className="h-0.5 w-10 rounded-full bg-gold" />
      <div className="space-y-2">
        <h1 className="font-display text-3xl leading-tight font-bold text-charcoal sm:text-4xl">{title}</h1>
        <p className="leading-relaxed text-muted-text">{description}</p>
      </div>
      <div className="flex flex-col items-center gap-x-6 gap-y-3 sm:flex-row">{actions}</div>
    </div>
  )
}

export { StatusPage }
