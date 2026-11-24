import { createClient } from "@/lib/supabase/client"
import type { Category } from "@/lib/data/categories"
import {
  toProduct,
  PRODUCT_JOINS,
  type ProductRow,
  type ProductWithCategory,
} from "@/lib/services/catalog"
import { applySaleEvents, salePrice, bestEventFor, type SaleEvent } from "@/lib/sale-events"
import { UUID_RE } from "@/lib/uuid"

// Browser-side catalog reads, for client components that only know product
// ids (cart lines, favorites, checkout) or need type-ahead (search bar).
// Server Components use catalog-queries.ts instead.

type ProductWithCategoryJoin = ProductRow & {
  categories: { name_en: string; name_am: string; slug: string } | null
}

function toProductWithCategory(row: ProductWithCategoryJoin): ProductWithCategory {
  const { categories: category, ...productRow } = row
  return {
    ...toProduct(productRow),
    categoryName: category?.name_en ?? "",
    categoryNameAm: category?.name_am ?? "",
    categorySlug: category?.slug ?? "",
  }
}

// !inner, with the categories.is_active filter below: products of a switched-off
// category count as unavailable (cart, favorites), like deactivated ones.
const PRODUCT_SELECT = `*, ${PRODUCT_JOINS}, categories!inner(name_en, name_am, slug)`

// Sale events that haven't ended, as on the server (catalog-queries.ts): the
// cart and checkout show the same sale prices place_order charges. A failed
// read means regular prices, never a broken cart.
export async function fetchSaleEvents(): Promise<SaleEvent[]> {
  const { data, error } = await createClient()
    .from("sale_events")
    .select("*")
    .eq("is_active", true)
    .gt("ends_at", new Date().toISOString())
  if (error) {
    console.error(`Failed to load sale events: ${error.message}`) // i18n-ignore: developer-facing
    return []
  }
  return (data ?? []) as SaleEvent[]
}

// Active products only, matching what a shopper can actually buy. An id that
// no longer resolves (deleted or deactivated product) is simply absent, which
// callers already treat as "no longer available" (cart, favorites).
export async function fetchProductsByIds(ids: string[]): Promise<ProductWithCategory[]> {
  // Carts saved before real accounts used slug-style ids that aren't UUIDs;
  // asking Postgres for one is an error, not an empty result.
  const validIds = ids.filter((id) => UUID_RE.test(id))
  if (validIds.length === 0) return []

  const [{ data, error }, events] = await Promise.all([
    createClient()
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", validIds)
      .eq("is_active", true)
      .eq("categories.is_active", true),
    fetchSaleEvents(),
  ])

  if (error) throw new Error(`Failed to load products: ${error.message}`) // i18n-ignore: developer-facing
  const now = Date.now()
  return (data as ProductWithCategoryJoin[]).map((row) => applySaleEvents(toProductWithCategory(row), events, now))
}

export interface SearchSuggestions {
  products: {
    id: string
    slug: string
    name_en: string
    name_am: string
    price: number
    /** The first photo (by sort order), if the product has one. */
    image_url: string | null
  }[]
  categories: { id: string; slug: string; name_en: string; name_am: string }[]
}

// Escape the characters PostgREST/LIKE treat specially so a shopper typing
// "50%" or "a_b" searches for those literal characters.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

// Inside a PostgREST `or=(...)` filter a value containing commas or
// parentheses must be double-quoted, and within the quotes `\` and `"` are
// escape characters themselves (so LIKE's own backslashes are doubled).
function quoteForOr(pattern: string): string {
  return `"${pattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}

// Matches either language, so an Amharic shopper can type Amharic and an
// English one English, regardless of which language the page is shown in.
export async function searchSuggestions(query: string): Promise<SearchSuggestions> {
  const quoted = quoteForOr(`%${escapeLike(query.trim())}%`)
  const nameMatches = `name_en.ilike.${quoted},name_am.ilike.${quoted}`
  const supabase = createClient()

  const [productsResult, categoriesResult, events] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name_en, name_am, price, category_id, product_images(image_url, sort_order), categories!inner(is_active)")
      .eq("is_active", true)
      .eq("categories.is_active", true)
      .or(nameMatches)
      .limit(5),
    supabase
      .from("categories")
      .select("id, slug, name_en, name_am")
      .eq("is_active", true)
      .or(nameMatches)
      .limit(3),
    fetchSaleEvents(),
  ])
  const now = Date.now()

  return {
    products: (productsResult.data ?? []).map(({ id, slug, name_en, name_am, price, category_id, product_images }) => ({
      id,
      slug,
      name_en,
      name_am,
      price: salePrice(Number(price), bestEventFor(category_id, events, now)?.discount_percent ?? 0),
      image_url: [...(product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ?? null,
    })),
    categories: (categoriesResult.data as Pick<Category, "id" | "slug" | "name_en" | "name_am">[] | null) ?? [],
  }
}
