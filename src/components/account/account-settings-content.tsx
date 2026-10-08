"use client"

import { FormSkeleton } from "@/components/feedback/skeletons"
import Link from "next/link"

import { useT } from "@/lib/i18n/provider"
import { useRequireAuth } from "@/lib/hooks/use-require-auth"
import { formatOrderDate } from "@/lib/date"
import { ChangePasswordForm } from "@/components/account/change-password-form"
import { ProfileForm } from "@/components/account/profile-form"

const card = "rounded-card border border-border bg-surface p-5 shadow-soft sm:p-6"

// Settings: the profile (name and phone; the account menu's profile row leads
// here), the password, and when the account was opened.
function AccountSettingsContent() {
  const t = useT()
  const { user, ready } = useRequireAuth("/login?redirect=/account/settings")

  if (!ready || !user) return <FormSkeleton fields={3} />

  return (
    <div className="max-w-xl space-y-6">
      <section aria-labelledby="profile-heading" className={card}>
        <div className="mb-5 space-y-1">
          <h2 id="profile-heading" className="font-display text-xl font-bold text-charcoal">
            {t("account.profile.title")}
          </h2>
          <p className="text-sm text-muted-text">{t("account.profile.subtitle")}</p>
        </div>
        <ProfileForm user={user} />
      </section>

      <section aria-labelledby="password-heading" className={`space-y-4 ${card}`}>
        <h2 id="password-heading" className="font-display text-xl font-bold text-charcoal">
          {t("account.settings.password")}
        </h2>
        {user.hasPassword ? (
          <ChangePasswordForm userId={user.id} />
        ) : (
          // Changing a password means proving the current one, and this
          // account has none — it only ever signed in with Google.
          <p className="text-sm text-muted-text">
            {t("account.settings.googleOnly")}{" "}
            <Link
              href="/forgot-password"
              className="rounded-sm font-semibold text-brand-ink underline underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("auth.login.forgot")}
            </Link>
          </p>
        )}
      </section>

      <div className="space-y-1 rounded-card border border-border bg-subtle px-5 py-4 text-sm">
        <p className="text-charcoal">
          {t("account.settings.memberSince", { date: formatOrderDate(user.createdAt, t.locale) })}
        </p>
        <p className="text-charcoal">
          {t("account.settings.role", {
            role: user.role === "admin" ? t("account.settings.roleAdmin") : t("account.settings.roleCustomer"),
          })}
        </p>
      </div>
    </div>
  )
}

export { AccountSettingsContent }
