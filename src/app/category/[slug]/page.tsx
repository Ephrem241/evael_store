import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { parseListingParams } from "@/lib/services/catalog"
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getFilterFacets,
} from "@/lib/services/catalog-queries"
import { descriptionOf, nameOf } from "@/lib/i18n/content"
import { getT } from "@/lib/i18n/server"
import { listingSeo, pageMetadata, truncateDescription, withPageNumber } from "@/lib/seo/metadata"
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo/json-ld"
import { JsonLd } from "@/components/seo/json-ld"
import { ProductListing } from "@/components/catalog/product-listing"
import { PageHeader, SearchAndCartActions } from "@/components/layout/page-header"
import { CategoryRow } from "@/components/catalog/category-row"

type RouteProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const [category, raw, t] = await Promise.all([getCategoryBySlug(slug), searchParams, getT()])
  if (!category) return { title: t("catalog.categoryNotFound") }

  const name = nameOf(category, t.locale)
  const seo = listingSeo(raw, { allowSale: false })
  const { page } = await getProducts({ ...parseListingParams(raw), categorySlug: category.slug })
  return pageMetadata({
    locale: t.locale,
    path: `/category/${category.slug}`,
    title: withPageNumber(name, page, t),
    description: truncateDescription(descriptionOf(category, t.locale)),
    image: category.image_url ? { url: category.image_url, alt: name } : null,
    listing: { ...seo.params, page },
    indexable: seo.indexable,
  })
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const [category, t] = await Promise.all([getCategoryBySlug(slug), getT()])
  if (!category) notFound()
  const categoryName = nameOf(category, t.locale)

  const rawParams = await searchParams
  const parsed = parseListingParams(rawParams)
  const listingParams = { ...parsed, categorySlug: category.slug }

  const [result, facets, categories] = await Promise.all([
    getProducts(listingParams),
    getFilterFacets({ categorySlug: category.slug, query: parsed.query }),
    getCategories(),
  ])

  const categoryPath = `/category/${category.slug}`

  return (
    <div className="space-y-5 py-6 lg:space-y-6 lg:py-8">
      <JsonLd
        nodes={[
          breadcrumbJsonLd([
            { name: t("nav.home"), url: "/" },
            { name: categoryName, url: categoryPath },
          ]),
          collectionJsonLd({
            name: categoryName,
            description: truncateDescription(descriptionOf(category, t.locale)),
            url: categoryPath,
            inLanguage: t.locale,
          }),
        ]}
      />
      {/* Compact, as marketplace list pages are: the products start high on the screen. */}
      <PageHeader
        variant="plain"
        breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: categoryName }]}
        backHref="/categories"
        mobileActions={<SearchAndCartActions />}
        title={categoryName}
        description={descriptionOf(category, t.locale)}
      />
      {/* The marketplace row of category circles, this one ringed; it also
          carries the category's photo, which the header used to show large. */}
      <CategoryRow categories={categories} activeSlug={category.slug} />
      <ProductListing
        products={result.products}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        filters={listingParams}
        sort={parsed.sort ?? "recommended"}
        facets={facets}
        showCategoryFilter={false}
        rawParams={rawParams}
        basePath={`/category/${category.slug}`}
      />
    </div>
  )
}
