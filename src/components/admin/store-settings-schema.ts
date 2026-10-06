import { z } from "zod"

import "@/lib/i18n/zod" // translated fallbacks for zod's default messages

import { translate } from "@/lib/i18n/translate"
import { telegramLink, telLink, whatsappLink } from "@/lib/contact-links"

// Every field is optional (empty = hidden on the storefront); a filled-in one
// must be something the storefront can turn into a working link.
const optional = (valid: (value: string) => boolean, message: () => string) =>
  z
    .string()
    .trim()
    .max(200)
    .refine((value) => value === "" || valid(value), { error: message })

export const storeSettingsSchema = z.object({
  phone: optional((v) => telLink(v) !== null, () => translate("admin.settings.invalidPhone")),
  whatsapp: optional((v) => whatsappLink(v) !== null, () => translate("admin.settings.invalidPhone")),
  telegram: optional((v) => telegramLink(v) !== null, () => translate("admin.settings.invalidTelegram")),
  email: optional((v) => /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(v), () => translate("admin.settings.invalidEmail")),
  address: z.string().trim().max(200),
  hours: z.string().trim().max(200),
})

export type StoreSettingsValues = z.infer<typeof storeSettingsSchema>
