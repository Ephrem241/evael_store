import type { ReactNode } from "react"

import { BrandMark } from "@/components/layout/logo"

// The frame every sign-in/sign-up/reset page sits in: the bag mark, the title
// in the display face and a white card for the form (the site header above
// already carries the full logo).
function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-8 sm:py-12">
      <div className="space-y-3 text-center">
        <BrandMark className="mx-auto size-12" />
        <h1 className="font-display text-3xl font-bold text-charcoal">{title}</h1>
        {description && <p className="text-sm leading-relaxed text-muted-text">{description}</p>}
      </div>
      <div className="rounded-card border border-border bg-surface p-6 shadow-soft sm:p-8">{children}</div>
      {footer && <div className="space-y-1 text-center text-sm text-muted-text">{footer}</div>}
    </div>
  )
}

export { AuthCard }
