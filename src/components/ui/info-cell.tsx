import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

// A small fact with an icon: "Delivery / Fee shown at checkout", "Cash on
// Delivery / Available". Subtle background, 8px corner, a line icon in the
// brand colour, a 12px title over an 11px line of detail.
function InfoCell({
  icon: Icon,
  title,
  detail,
  className,
}: {
  icon: LucideIcon
  title: string
  detail?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-(--radius-control) bg-subtle px-3 py-2.5", className)}>
      <Icon aria-hidden className="size-5 shrink-0 text-brand" strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-charcoal">{title}</p>
        {detail && <p className="text-[11px] leading-snug text-muted-text">{detail}</p>}
      </div>
    </div>
  )
}

export { InfoCell }
