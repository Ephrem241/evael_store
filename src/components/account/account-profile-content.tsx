"use client"

import { FormSkeleton } from "@/components/feedback/skeletons"
import { useT } from "@/lib/i18n/provider"
import { useRequireAuth } from "@/lib/hooks/use-require-auth"
import { AccountOverview } from "@/components/account/account-overview"
import { ProfileForm } from "@/components/account/profile-form"

// /account: the overview (greeting, recent orders, shortcuts), then the
// profile form.
function AccountProfileContent() {
  const t = useT()
  const { user, ready } = useRequireAuth("/login?redirect=/account")

  if (!ready || !user) return <FormSkeleton fields={3} />

  return (
    <div className="space-y-8">
      <AccountOverview user={user} />
      <section aria-labelledby="profile-heading" className="max-w-xl rounded-card border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="mb-5 space-y-1">
          <h2 id="profile-heading" className="text-lg font-bold tracking-tight text-charcoal">
            {t("account.profile.title")}
          </h2>
          <p className="text-sm text-muted-text">{t("account.profile.subtitle")}</p>
        </div>
        <ProfileForm user={user} />
      </section>
    </div>
  )
}

export { AccountProfileContent }
