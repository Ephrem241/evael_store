import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "cn"

import { buttonVariants } from "@/components/ui/button"

// The title row shared by the homepage sections: the display heading with a
// small gold tick before it (and an optional one-line subtitle) on the left
// and, optionally, a small "View All →" link (and any extra controls, such
// as carousel arrows) on the right.
function SectionHeading({
  id,
  title,
  subtitle,
  href,
  linkLabel,
  actions,
  className,
}: {
  id: string
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0 space-y-1">
        <h2 id={id} className="flex items-center gap-2.5 type-section text-charcoal">
          <span aria-hidden className="h-3.5 w-[3px] shrink-0 rounded-full bg-gold" />
          {title}
        </h2>
        {subtitle && <p className="text-sm text-muted-text">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {actions}
        {href && linkLabel && (
          <Link href={href} className={cn(buttonVariants({ variant: "ghost-link" }), "group")}>
            {linkLabel}
            <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}

export { SectionHeading }
