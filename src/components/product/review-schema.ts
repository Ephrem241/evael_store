import { z } from "zod"

import "@/lib/i18n/zod" // translated fallbacks for zod's default messages

import { translate } from "@/lib/i18n/translate"

// The comment limit is the same one the database applies (0026).
export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, { error: () => translate("product.reviews.errors.rating") })
    .max(5),
  comment: z
    .string()
    .trim()
    .min(3, { error: () => translate("product.reviews.errors.comment") })
    .max(1000, { error: () => translate("validation.tooLong", { max: 1000 }) }),
})

export type ReviewValues = z.infer<typeof reviewSchema>
