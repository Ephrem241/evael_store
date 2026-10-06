import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "cn"

// The title row shared by the homepage sections: a bold heading (with an
// optional icon and one-line subtitle) on the left and, optionally, a
// "View All →" link (and any extra controls, such as carousel arrows or a
// countdown) on the right.
function SectionHeading({
  id,
  title,
  subtitle,
  icon,
  href,
  linkLabel,
  actions,
  className,
}: {
  id: string
  title: string
  subtitle?: string
  /** A small decorative mark before the title (the flash-deals flame, say). */
  icon?: ReactNode
  href?: string
  linkLabel?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0 space-y-1">
        <h2
          id={id}
          className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-charcoal sm:text-[1.75rem] lg:text-3xl"
        >
          {icon}
          {title}
        </h2>
        {subtitle && <p className="text-sm text-muted-text sm:text-[15px]">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {actions}
        {href && linkLabel && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 rounded-lg py-1 text-sm font-semibold text-brand-ink transition-colors outline-none hover:text-brand-deep focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:min-h-11"
          >
            {linkLabel}
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}

export { SectionHeading }
