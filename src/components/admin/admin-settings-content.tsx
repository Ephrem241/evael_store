"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { useT } from "@/lib/i18n/provider"
import { useStoreContactSettings } from "@/lib/hooks/use-admin-data"
import { updateStoreContactSettings } from "@/lib/services/admin-store-settings"
import { storeSettingsSchema, type StoreSettingsValues } from "@/components/admin/store-settings-schema"
import { FormSkeleton } from "@/components/feedback/skeletons"
import { FormField } from "@/components/forms/form-field"
import { Button } from "@/components/ui/button"

// The shop's contact details: the Telegram / WhatsApp / Call buttons and the
// rest of the Contact page and footer read these.
function AdminSettingsContent() {
  const t = useT()
  const { data: settings, loading, error, reload } = useStoreContactSettings()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoreSettingsValues>({ resolver: zodResolver(storeSettingsSchema), values: settings })

  if (loading) return <FormSkeleton fields={6} />

  if (error || !settings) {
    return <p className="text-sm text-error">{t("admin.loadFailed.settings")}</p>
  }

  async function onSubmit(values: StoreSettingsValues) {
    const result = await updateStoreContactSettings(values)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(t("admin.settings.saved"))
    reload()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-8">
      <section className="space-y-4 rounded-card border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="font-medium text-charcoal">{t("admin.settings.contactTitle")}</h2>
          <p className="text-sm text-muted-text">{t("admin.settings.hint")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="phone"
            type="tel"
            label={t("admin.settings.phone")}
            registration={register("phone")}
            error={errors.phone?.message}
          />
          <FormField
            id="whatsapp"
            type="tel"
            label={t("admin.settings.whatsapp")}
            registration={register("whatsapp")}
            error={errors.whatsapp?.message}
          />
          <FormField
            id="telegram"
            label={t("admin.settings.telegram")}
            registration={register("telegram")}
            error={errors.telegram?.message}
          />
          <FormField
            id="email"
            type="email"
            label={t("admin.settings.email")}
            registration={register("email")}
            error={errors.email?.message}
          />
          <FormField id="address" label={t("admin.settings.address")} registration={register("address")} />
          <FormField id="hours" label={t("admin.settings.hours")} registration={register("hours")} />
        </div>
      </section>

      <Button type="submit" disabled={isSubmitting}>
        {t("admin.settings.save")}
      </Button>
    </form>
  )
}

export { AdminSettingsContent }
