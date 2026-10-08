import type { ReactNode } from "react"

// The three steps over the checkout form, in burgundy: numbered circles
// joined by a gold hairline, each a jump link to its card (the whole checkout
// is one page, so this is a map of it, not a wizard). The numbers repeat the
// cards' own and are hidden from assistive technology.
function CheckoutSteps({ label, steps }: { label: string; steps: string[] }) {
  return (
    <nav aria-label={label}>
      <ol className="flex items-start">
        {steps.map((title, i) => (
          <li key={title} className="relative flex flex-1 justify-center">
            {i > 0 && <span aria-hidden className="absolute top-3.5 right-1/2 h-px w-full bg-gold-border" />}
            <a
              href={`#checkout-section-${i + 1}`}
              className="group relative z-10 flex flex-col items-center gap-1.5 rounded-sm px-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden
                className="flex size-7 items-center justify-center rounded-full bg-brand-strong text-xs font-semibold text-white ring-4 ring-background"
              >
                {i + 1}
              </span>
              <span className="text-xs leading-tight font-medium text-charcoal group-hover:text-brand-ink sm:text-sm">
                {title}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

// One numbered card of the checkout: 1 Delivery, 2 Payment, 3 Review. The number
// is decoration — the heading carries the meaning — so it is hidden from
// assistive technology. The step map above links to each card (scroll-mt
// keeps it clear of the sticky header).
function CheckoutStep({
  number,
  title,
  action,
  children,
}: {
  number: number
  title: string
  /** A small link at the right of the heading (the review's "Edit cart"). */
  action?: ReactNode
  children: ReactNode
}) {
  const headingId = `checkout-step-${number}`

  return (
    <section
      id={`checkout-section-${number}`}
      aria-labelledby={headingId}
      className="scroll-mt-20 space-y-5 rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6 lg:scroll-mt-40"
    >
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-strong text-sm font-semibold text-white"
        >
          {number}
        </span>
        <h2 id={headingId} className="font-display text-xl font-bold text-charcoal">
          {title}
        </h2>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  )
}

export { CheckoutStep, CheckoutSteps }
