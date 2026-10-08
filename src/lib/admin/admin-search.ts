import type { Product } from "@/lib/data/products"
import type { AdminProfile } from "@/lib/services/admin-customers"
import type { OrderRecord } from "@/lib/types/orders"

export const MIN_SEARCH_LENGTH = 2
export const MAX_RESULTS_PER_GROUP = 5

export interface AdminSearchData {
  products?: Product[]
  orders?: OrderRecord[]
  profiles?: AdminProfile[]
}

export interface AdminSearchResults {
  products: Product[]
  orders: OrderRecord[]
  customers: AdminProfile[]
}

const NOTHING: AdminSearchResults = { products: [], orders: [], customers: [] }

function normalize(text: string): string {
  return text.normalize("NFKC").toLocaleLowerCase().trim()
}

// The admin's top-bar search, over the same lists the admin pages load (RLS
// decides what those contain). Plain "contains" matching, ignoring case; a
// leading "#" on an order number is ignored, as the dashboard writes them
// with one. Each group keeps the order it was given (newest first) and stops
// at MAX_RESULTS_PER_GROUP.
export function searchAdmin(query: string, data: AdminSearchData): AdminSearchResults {
  const needle = normalize(query).replace(/^#/, "")
  if (needle.length < MIN_SEARCH_LENGTH) return NOTHING

  const matches = (...fields: (string | null | undefined)[]) =>
    fields.some((field) => !!field && normalize(field).includes(needle))
  const nameOfUser = new Map((data.profiles ?? []).map((profile) => [profile.id, profile.fullName]))

  return {
    products: (data.products ?? [])
      .filter((product) => matches(product.name_en, product.name_am, product.sku))
      .slice(0, MAX_RESULTS_PER_GROUP),
    orders: (data.orders ?? [])
      .filter((order) =>
        matches(order.order_number, nameOfUser.get(order.user_id), order.delivery_address?.full_name, order.delivery_address?.phone)
      )
      .slice(0, MAX_RESULTS_PER_GROUP),
    customers: (data.profiles ?? [])
      .filter((profile) => matches(profile.fullName, profile.email, profile.phone))
      .slice(0, MAX_RESULTS_PER_GROUP),
  }
}
