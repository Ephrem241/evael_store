import { createClient } from "@/lib/supabase/client"
import { translate } from "@/lib/i18n/translate"

// Browser-side read/write of the shop's contact details (store_settings) for
// /admin/settings. Writes are refused by the database itself unless the
// caller is an admin (RLS: is_admin(), 0014).

export interface StoreContactSettings {
  phone: string
  whatsapp: string
  telegram: string
  email: string
  address: string
  hours: string
}

// Form field -> store_settings key (read by getStoreContact on the storefront).
const KEYS: Record<keyof StoreContactSettings, string> = {
  phone: "contact_phone",
  whatsapp: "contact_whatsapp",
  telegram: "contact_telegram",
  email: "contact_email",
  address: "contact_address",
  hours: "support_hours",
}

const FIELDS = Object.keys(KEYS) as (keyof StoreContactSettings)[]

export async function fetchStoreContactSettings(): Promise<StoreContactSettings> {
  const { data, error } = await createClient().from("store_settings").select("key, value").in("key", Object.values(KEYS))
  if (error) throw new Error(`Failed to load store settings: ${error.message}`) // i18n-ignore: developer-facing
  const values = new Map((data ?? []).map((row) => [row.key as string, row.value as unknown]))
  return Object.fromEntries(
    FIELDS.map((field) => {
      const value = values.get(KEYS[field])
      return [field, typeof value === "string" ? value : ""]
    })
  ) as unknown as StoreContactSettings
}

// A filled-in field is saved; an emptied one is removed, so the storefront
// stops showing it.
export async function updateStoreContactSettings(
  settings: StoreContactSettings
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createClient()
  const filled = FIELDS.filter((field) => settings[field].trim() !== "")
  const emptied = FIELDS.filter((field) => settings[field].trim() === "")

  if (filled.length > 0) {
    // .select() so a write RLS silently refused (0 rows) is detected rather
    // than reported as success.
    const { data, error } = await supabase
      .from("store_settings")
      .upsert(
        filled.map((field) => ({ key: KEYS[field], value: settings[field].trim(), updated_at: new Date().toISOString() })),
        { onConflict: "key" }
      )
      .select("key")
    if (error) return { success: false, error: translate("common.somethingWentWrong") }
    if (!data || data.length !== filled.length) return { success: false, error: translate("admin.settings.noPermission") }
  }

  if (emptied.length > 0) {
    const { error } = await supabase
      .from("store_settings")
      .delete()
      .in(
        "key",
        emptied.map((field) => KEYS[field])
      )
    if (error) return { success: false, error: translate("common.somethingWentWrong") }
  }

  return { success: true }
}
