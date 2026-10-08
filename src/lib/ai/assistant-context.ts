import { BRAND_NAME } from "@/lib/brand"
import { buildSystemPrompt } from "@/lib/ai/assistant-prompt"
import { getDictionary } from "@/lib/i18n/server"
import { createTranslator } from "@/lib/i18n/translator"
import type { Locale } from "@/lib/i18n/config"
import type { ProductWithCategory } from "@/lib/services/catalog"
import { getAllActiveProducts, getCategories } from "@/lib/services/catalog-queries"
import { paymentMethods } from "@/lib/services/payment"
import { getDeliveryFees, getReturnWindowDays, getStoreContact } from "@/lib/services/store-info"
import { getFreeDeliveryThreshold } from "@/lib/services/store-settings"

// Server side: gathers what the assistant is told about the shop, from the
// same live sources the pages read (the catalog, `store_settings`,
// `delivery_fees`, the payment list), and builds the system prompt from it.
// The products come back too: the route checks the reply's product links
// against them.
export async function buildAssistantContext(locale: Locale): Promise<{
  system: string
  products: ProductWithCategory[]
}> {
  const [products, categories, freeDeliveryThreshold, deliveryFees, returnWindowDays, contact, english] =
    await Promise.all([
      getAllActiveProducts(),
      getCategories(),
      getFreeDeliveryThreshold(),
      getDeliveryFees(),
      getReturnWindowDays(),
      getStoreContact(),
      getDictionary("en"),
    ])

  // The model reads English; a method's name is a dictionary key or a proper noun.
  const t = createTranslator("en", english)
  const methods = paymentMethods.map((method) => ({
    name: "key" in method.label ? t(method.label.key) : method.label.name,
    available: method.available,
  }))

  const system = buildSystemPrompt({
    brand: BRAND_NAME,
    locale,
    today: todayInEthiopia(),
    products,
    categories,
    store: { paymentMethods: methods, freeDeliveryThreshold, deliveryFees, returnWindowDays, contact },
  })
  return { system, products }
}

function todayInEthiopia(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Addis_Ababa" }).format(new Date())
}
