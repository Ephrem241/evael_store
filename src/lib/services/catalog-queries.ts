import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import { isValidSlug } from "@/lib/slug"
import type { Category } from "@/lib/data/categories"
import {
  toProduct,
  inActiveCategories,
  listCategoriesWithCount,
  pickFeatured,
  pickPopular,
  pickFlashDeals,
  withCategory,
  isOnSale,
  listProducts,
  computeFilterFacets,
  type ProductRow,
  type ProductWithCategory,
  type CategoryWithCount,
  type GetProductsParams,
  type ProductListResult,
  type FilterFacets,
  PRODUCT_JOINS,
} from "@/lib/services/catalog"
import { applySaleEvents, runningEvents, type SaleEvent } from "@/lib/sale-events"
import type { Product } from "@/lib/data/products"

// Server-side catalog reads (Server Components). Every request reads the
// live database — an admin's edit is visible to every visitor immediately,
// which is exactly what the Phase 11 mock could NOT do (a Server Component
// could never see one browser's localStorage). That is why the hydration
// workaround the mock needed (server-passed `initial*` props until a client
// store hydrated) is gone.
//
// The public storefront only ever shows ACTIVE products (RLS also enforces
// this for anonymous visitors; the explicit filter keeps it true for a
// signed-in admin browsing the shop too).
//
// Filtering, sorting and facets run on the fetched arrays via the pure
// functions in catalog.ts. That is a deliberate MVP choice at this catalog's
// size (tens of rows) — it keeps the already-verified filter semantics
// byte-for-byte and can move into SQL later (Phase 15) without changing any
// call site.

// `cache` = memoized for the duration of ONE request. A page, its
// generateMetadata and the components under it all ask for the catalog (or the
// same product); this makes the database see each question once per request.
// Holiday / special sale events that haven't ended (running or still to
// come), read once per request. Every storefront product read lays the running
// ones over its prices (applySaleEvents), so cards, the product page, the
// cart and the assistant all show the sale price place_order will charge.
// A failed read shows regular prices rather than breaking the page.
export const getSaleEvents = cache(async (): Promise<SaleEvent[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sale_events")
    .select("*")
    .eq("is_active", true)
    .gt("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
  if (error) {
    console.error(`Failed to load sale events: ${error.message}`) // i18n-ignore: developer-facing
    return []
  }
  return (data ?? []) as SaleEvent[]
})

/** The sale events running right now, biggest discount first. */
export async function getRunningSaleEvents(): Promise<SaleEvent[]> {
  return runningEvents(await getSaleEvents(), Date.now())
}

async function withSales<T extends Product>(products: T[]): Promise<T[]> {
  const events = await getSaleEvents()
  if (events.length === 0) return products
  const now = Date.now()
  return products.map((product) => applySaleEvents(product, events, now))
}

const loadCatalog = cache(async () => {
  const supabase = await createClient()
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("products").select(`*, ${PRODUCT_JOINS}`).eq("is_active", true),
  ])

  if (categoriesResult.error) throw new Error(`Failed to load categories: ${categoriesResult.error.message}`) // i18n-ignore: developer-facing
  if (productsResult.error) throw new Error(`Failed to load products: ${productsResult.error.message}`) // i18n-ignore: developer-facing

  const categories = categoriesResult.data as Category[]
  const sortOrderById = new Map(categories.map((c) => [c.id, c.sort_order]))

  // "Recommended" = catalog order: by category, then SKU within it (this is
  // exactly the order the seed data was authored in).
  const products = (await withSales(inActiveCategories((productsResult.data as ProductRow[]).map(toProduct), categories)))
    .sort(
      (a, b) =>
        (sortOrderById.get(a.category_id) ?? 0) - (sortOrderById.get(b.category_id) ?? 0) ||
        a.sku.localeCompare(b.sku)
    )

  return { categories, products }
})

export async function getCategories(): Promise<CategoryWithCount[]> {
  const { categories, products } = await loadCatalog()
  return listCategoriesWithCount(categories, products)
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithCount | undefined> {
  if (!isValidSlug(slug)) return undefined
  return (await getCategories()).find((c) => c.slug === slug)
}

export const getProductBySlug = cache(async (slug: string): Promise<ProductWithCategory | undefined> => {
  // A slug that can't exist is "not found" — never a query (see lib/slug.ts).
  if (!isValidSlug(slug)) return undefined
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    // !inner + the filter: a product whose category is switched off is "not found" too.
    .select(`*, ${PRODUCT_JOINS}, categories!inner(name_en, name_am, slug)`)
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .maybeSingle()

  if (error) throw new Error(`Failed to load product: ${error.message}`) // i18n-ignore: developer-facing
  if (!data) return undefined

  const { categories: category, ...row } = data as ProductRow & {
    categories: { name_en: string; name_am: string; slug: string } | null
  }
  const [product] = await withSales([toProduct(row)])
  return {
    ...product,
    categoryName: category?.name_en ?? "",
    categoryNameAm: category?.name_am ?? "",
    categorySlug: category?.slug ?? "",
  }
})

export async function getFeaturedProducts(limit = 8): Promise<ProductWithCategory[]> {
  const { categories, products } = await loadCatalog()
  return pickFeatured(products, categories, limit)
}

export async function getPopularProducts(limit = 8): Promise<ProductWithCategory[]> {
  const { categories, products } = await loadCatalog()
  return pickPopular(products, categories, limit)
}

export async function getFlashDeals(limit = 8): Promise<ProductWithCategory[]> {
  const { categories, products } = await loadCatalog()
  return pickFlashDeals(products, categories, limit)
}

// The newest products first (by when they were added). Products created in
// the same moment keep the catalog order, since the sort is stable.
export async function getNewArrivals(limit = 10): Promise<ProductWithCategory[]> {
  const { categories, products } = await loadCatalog()
  return [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map((product) => withCategory(product, categories))
}

// The facts behind the homepage's "Special Deals" banner, computed from the
// products actually on sale — so "Up to N% Off" is never larger than the
// biggest real discount, and the banner disappears when nothing is on sale.
export interface DealsSummary {
  count: number
  maxDiscountPercent: number
}

export async function getDealsSummary(): Promise<DealsSummary> {
  const { products } = await loadCatalog()
  const onSale = products.filter(isOnSale)
  // Rounded exactly like the "-23%" badge on a product card (DiscountBadge), so
  // the banner's "Up to N%" is always the largest badge a shopper can see.
  const maxDiscountPercent = onSale.reduce(
    (max, product) => Math.max(max, Math.round((1 - product.price / product.compare_at_price!) * 100)),
    0
  )
  return { count: onSale.length, maxDiscountPercent }
}

// Every product a visitor can see, in catalog order — what the shopping
// assistant is told the shop sells (lib/ai/assistant-context.ts).
export async function getAllActiveProducts(): Promise<ProductWithCategory[]> {
  const { categories, products } = await loadCatalog()
  return products.map((product) => withCategory(product, categories))
}

export async function getProducts(params: GetProductsParams = {}): Promise<ProductListResult> {
  const { categories, products } = await loadCatalog()
  return listProducts(products, categories, params)
}

export async function getFilterFacets(
  params: { categorySlug?: string; query?: string } = {}
): Promise<FilterFacets> {
  const { categories, products } = await loadCatalog()
  return computeFilterFacets(products, categories, params)
}
