"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Sparkles } from "lucide-react"

import { nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import { MAX_DISCOUNT_PERCENT } from "@/lib/discount"
import { SALE_PRESETS } from "@/lib/data/sale-presets"
import { saleEventSchema, type SaleEventValues } from "@/components/admin/sale-event-schema"
import { FormField } from "@/components/forms/form-field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import type { Category } from "@/lib/data/categories"

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-2.5 text-sm text-charcoal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:h-11 max-lg:text-base"

// Create or edit one sale event. "Holiday" fills in the names and tagline of
// a common occasion (Genna, Timket, Fasika...) in both languages; the admin
// still sets the discount and the dates, which are Addis Ababa time.
function SaleEventForm({
  initialValues,
  categories,
  onSubmit,
  onCancel,
}: {
  initialValues: SaleEventValues
  categories: Category[]
  onSubmit: (values: SaleEventValues) => Promise<void>
  onCancel: () => void
}) {
  const t = useT()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SaleEventValues>({ resolver: zodResolver(saleEventSchema), defaultValues: initialValues })

  function applyPreset(id: string) {
    const preset = SALE_PRESETS.find((p) => p.id === id)
    if (!preset) return
    const options = { shouldValidate: true, shouldDirty: true }
    setValue("name_en", preset.name_en, options)
    setValue("name_am", preset.name_am, options)
    setValue("tagline_en", preset.tagline_en, options)
    setValue("tagline_am", preset.tagline_am, options)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="sale_preset" className="flex items-center gap-1.5 text-sm font-medium text-charcoal">
          <Sparkles aria-hidden className="size-4 text-gold-ink" />
          {t("admin.sales.form.preset")}
        </label>
        <select id="sale_preset" defaultValue="" onChange={(e) => applyPreset(e.target.value)} className={selectClass}>
          <option value="">{t("admin.sales.form.presetNone")}</option>
          {SALE_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {nameOf(preset, t.locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="name_en" label={t("admin.sales.form.nameEn")} registration={register("name_en")} error={errors.name_en?.message} />
        <FormField id="name_am" label={t("admin.sales.form.nameAm")} registration={register("name_am")} error={errors.name_am?.message} />
        <FormField
          id="tagline_en"
          label={t("admin.sales.form.taglineEn")}
          registration={register("tagline_en")}
          error={errors.tagline_en?.message}
        />
        <FormField
          id="tagline_am"
          label={t("admin.sales.form.taglineAm")}
          registration={register("tagline_am")}
          error={errors.tagline_am?.message}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="discount_percent" className="text-sm font-medium text-charcoal">
            {t("admin.sales.form.percent")}
          </label>
          <Input
            id="discount_percent"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_DISCOUNT_PERCENT}
            step={1}
            aria-invalid={!!errors.discount_percent}
            aria-describedby="discount_percent-hint"
            {...register("discount_percent", { valueAsNumber: true })}
          />
          <p id="discount_percent-hint" className="text-xs text-muted-text">
            {t("admin.sales.form.percentHint")}
          </p>
          {errors.discount_percent && <p className="text-xs text-error">{errors.discount_percent.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="category_id" className="text-sm font-medium text-charcoal">
            {t("admin.sales.form.appliesTo")}
          </label>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <select id="category_id" value={field.value} onChange={field.onChange} className={selectClass}>
                <option value="">{t("admin.sales.form.wholeShop")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {nameOf(c, t.locale)}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="starts_at"
          type="datetime-local"
          label={t("admin.sales.form.startsAt")}
          registration={register("starts_at")}
          error={errors.starts_at?.message}
        />
        <FormField
          id="ends_at"
          type="datetime-local"
          label={t("admin.sales.form.endsAt")}
          registration={register("ends_at")}
          error={errors.ends_at?.message}
        />
      </div>
      <p className="text-xs text-muted-text">{t("admin.sales.form.timeZoneHint")}</p>

      <label className="flex items-center gap-2 text-sm text-charcoal">
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
        />
        {t("admin.sales.form.active")}
      </label>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {t("admin.sales.form.save")}
        </Button>
      </div>
    </form>
  )
}

export { SaleEventForm }
