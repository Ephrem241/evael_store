"use client"

import { TableSkeleton } from "@/components/feedback/skeletons"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { Ban, PackageX, Pencil, Trash2 } from "lucide-react"

import { nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import { useAdminCategories, useAdminProducts } from "@/lib/hooks/use-admin-data"
import {
  deleteProduct,
  setProductActive,
  setProductDiscount,
  setProductFeatured,
  setProductFlashSale,
  setProductStock,
} from "@/lib/services/admin-catalog"
import type { Product } from "@/lib/data/products"
import { discountPercent, MAX_DISCOUNT_PERCENT } from "@/lib/discount"
import { getCategoryIcon } from "@/components/product/category-icons"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { formatPrice } from "@/lib/currency"
import { EmptyState } from "@/components/feedback/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

// A small number box in a table row that saves when the admin leaves it or
// presses Enter — and only if the number actually changed. Remounted (key) on
// every reload, so it always starts from the saved value.
function QuickNumberInput({
  value,
  min,
  max,
  label,
  suffix,
  onCommit,
}: {
  value: number
  min: number
  max?: number
  label: string
  suffix?: string
  onCommit: (next: number) => void
}) {
  const [draft, setDraft] = useState(String(value))

  function commit() {
    const next = draft.trim() === "" ? min : Number(draft)
    if (!Number.isFinite(next) || next < min || (max != null && next > max)) {
      setDraft(String(value))
      return
    }
    if (Math.round(next) !== value) onCommit(Math.round(next))
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={draft}
        aria-label={label}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
        className="h-8 w-16 px-2"
      />
      {suffix && <span className="text-xs text-muted-text">{suffix}</span>}
    </div>
  )
}

function AdminProductsContent() {
  const t = useT()
  const { data: products, loading: productsLoading, reload } = useAdminProducts()
  const { data: categories, loading: categoriesLoading } = useAdminCategories()

  if (productsLoading || categoriesLoading) return <TableSkeleton columns={10} />

  if (!products || !categories) {
    return <p className="text-sm text-error">{t("admin.loadFailed.products")}</p>
  }

  // The "Add product" button lives in the list's header below, which this
  // early return skips — so the empty state must offer it too, or a shop with
  // no products has no way to create its first one.
  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageX}
        title={t("admin.products.empty")}
        action={
          <Button asChild>
            <Link href="/admin/products/new">{t("admin.products.add")}</Link>
          </Button>
        }
      />
    )
  }

  async function handleToggleActive(id: string, next: boolean) {
    const result = await setProductActive(id, next)
    if (!result.success) toast.error(result.error)
    reload()
  }

  async function handleToggleFeatured(id: string, next: boolean) {
    const result = await setProductFeatured(id, next)
    if (!result.success) toast.error(result.error)
    reload()
  }

  async function handleToggleFlashSale(id: string, next: boolean) {
    const result = await setProductFlashSale(id, next)
    if (!result.success) toast.error(result.error)
    reload()
  }

  async function handleDiscount(product: Product, percent: number) {
    const result = await setProductDiscount(product, percent)
    if (result.success) toast.success(t("admin.products.discountUpdated"))
    else toast.error(result.error)
    reload()
  }

  async function handleStock(id: string, stock: number, name?: string) {
    const result = await setProductStock(id, stock)
    if (result.success) {
      toast.success(stock === 0 && name ? t("admin.products.markedSoldOut", { name }) : t("admin.products.stockUpdated"))
    } else {
      toast.error(result.error)
    }
    reload()
  }

  async function handleDelete(id: string, name: string) {
    const result = await deleteProduct(id)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(t("admin.products.deleted", { name }))
    reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/products/new">{t("admin.products.add")}</Link>
        </Button>
      </div>

      <Table label={t("admin.products.title")}>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.products.columns.product")}</TableHead>
            <TableHead>{t("admin.products.columns.sku")}</TableHead>
            <TableHead>{t("admin.products.columns.category")}</TableHead>
            <TableHead>{t("admin.products.columns.price")}</TableHead>
            <TableHead>{t("admin.products.columns.discount")}</TableHead>
            <TableHead>{t("admin.products.columns.stock")}</TableHead>
            <TableHead>{t("admin.products.columns.flashSale")}</TableHead>
            <TableHead>{t("admin.products.columns.featured")}</TableHead>
            <TableHead>{t("admin.products.columns.active")}</TableHead>
            <TableHead>
              <span className="sr-only">{t("common.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const category = categories.find((c) => c.id === product.category_id)
            const productName = nameOf(product, t.locale)
            const percent = discountPercent(product.price, product.compare_at_price)
            const soldOut = product.stock <= 0
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="size-10 shrink-0">
                      <ImagePlaceholder
                        seed={product.id}
                        icon={getCategoryIcon(category?.slug ?? "")}
                        label={productName}
                        decorative
                        imageUrl={product.image_url}
                        sizes="40px"
                      />
                    </div>
                    <span className="max-w-40 truncate font-medium">{productName}</span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{product.sku}</TableCell>
                <TableCell className="whitespace-nowrap">{category ? nameOf(category, t.locale) : "—"}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <div>{formatPrice(product.price, t)}</div>
                  {percent > 0 && (
                    <div className="text-xs text-muted-text line-through">{formatPrice(product.compare_at_price!, t)}</div>
                  )}
                </TableCell>
                <TableCell>
                  <QuickNumberInput
                    key={`discount-${product.id}-${percent}`}
                    value={percent}
                    min={0}
                    max={MAX_DISCOUNT_PERCENT}
                    suffix="%"
                    label={t("admin.products.discountFor", { name: productName })}
                    onCommit={(next) => handleDiscount(product, next)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <QuickNumberInput
                      key={`stock-${product.id}-${product.stock}`}
                      value={product.stock}
                      min={0}
                      label={t("admin.products.stockFor", { name: productName })}
                      onCommit={(next) => handleStock(product.id, next)}
                    />
                    {soldOut ? (
                      <Badge variant="destructive">{t("admin.products.soldOut")}</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={t("admin.products.markSoldOut", { name: productName })}
                        aria-label={t("admin.products.markSoldOut", { name: productName })}
                        onClick={() => handleStock(product.id, 0, productName)}
                      >
                        <Ban className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Switch
                      checked={product.is_flash_sale ?? false}
                      onCheckedChange={(checked) => handleToggleFlashSale(product.id, checked)}
                      aria-label={t("admin.products.toggleFlashSale", { name: productName })}
                    />
                    {product.is_flash_sale && percent === 0 && (
                      <span className="text-xs whitespace-nowrap text-warning-text">
                        {t("admin.products.flashNeedsDiscount")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.is_featured}
                    onCheckedChange={(checked) => handleToggleFeatured(product.id, checked)}
                    aria-label={t("admin.products.toggleFeatured")}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.is_active}
                    onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                    aria-label={t("admin.products.toggleActive")}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" aria-label={t("admin.products.edit")} asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("admin.products.delete")}
                      onClick={() => handleDelete(product.id, productName)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export { AdminProductsContent }
