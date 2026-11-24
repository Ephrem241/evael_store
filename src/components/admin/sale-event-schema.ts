import { z } from "zod"

import "@/lib/i18n/zod" // translated fallbacks for zod's default messages

import { translate } from "@/lib/i18n/translate"
import { MAX_DISCOUNT_PERCENT } from "@/lib/discount"
import { fromAddisInput } from "@/lib/sale-events"

// The admin's sale-event form. Dates are the datetime-local values, in Addis
// Ababa time (see fromAddisInput); `category_id` "" means the whole shop.
// The same limits as the sale_events table (migration 0029), so the database
// never has to refuse what the form let through.
export const saleEventSchema = z
  .object({
    name_en: z.string().trim().min(2, { error: () => translate("admin.validation.saleName") }).max(60, {
      error: () => translate("admin.validation.saleName"),
    }),
    name_am: z.string().trim().min(2, { error: () => translate("admin.validation.saleName") }).max(60, {
      error: () => translate("admin.validation.saleName"),
    }),
    tagline_en: z.string().trim().max(160, { error: () => translate("admin.validation.saleTagline") }),
    tagline_am: z.string().trim().max(160, { error: () => translate("admin.validation.saleTagline") }),
    discount_percent: z
      .number({ error: () => translate("admin.validation.salePercent", { max: MAX_DISCOUNT_PERCENT }) })
      .int({ error: () => translate("admin.validation.salePercent", { max: MAX_DISCOUNT_PERCENT }) })
      .min(1, { error: () => translate("admin.validation.salePercent", { max: MAX_DISCOUNT_PERCENT }) })
      .max(MAX_DISCOUNT_PERCENT, { error: () => translate("admin.validation.salePercent", { max: MAX_DISCOUNT_PERCENT }) }),
    category_id: z.string(),
    starts_at: z.string().refine((v) => fromAddisInput(v) !== "", { error: () => translate("admin.validation.saleDate") }),
    ends_at: z.string().refine((v) => fromAddisInput(v) !== "", { error: () => translate("admin.validation.saleDate") }),
    is_active: z.boolean(),
  })
  .refine((v) => !fromAddisInput(v.starts_at) || !fromAddisInput(v.ends_at) || fromAddisInput(v.ends_at) > fromAddisInput(v.starts_at), {
    path: ["ends_at"],
    error: () => translate("admin.validation.saleEndsAfter"),
  })

export type SaleEventValues = z.infer<typeof saleEventSchema>
