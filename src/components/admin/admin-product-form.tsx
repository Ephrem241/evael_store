"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { nameOf } from "@/lib/i18n/content"
import { useT } from "@/lib/i18n/provider"
import { useAdminCategories } from "@/lib/hooks/use-admin-data"
import { createProduct, updateProduct } from "@/lib/services/admin-catalog"
import { applyDiscount, discountPercent, MAX_DISCOUNT_PERCENT } from "@/lib/discount"
import { productSchema, type ProductValues } from "@/components/admin/product-schema"
import { FormField } from "@/components/forms/form-field"
import { ProductImagesField } from "@/components/admin/product-images-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/data/products"

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function toDefaultValues(product?: Product): ProductValues {
  return {
    name_en: product?.name_en ?? "",
    name_am: product?.name_am ?? "",
    slug: product?.slug ?? "",
    description_en: product?.description_en ?? "",
    description_am: product?.description_am ?? "",
    price: product?.price ?? 0,
    compare_at_price: product?.compare_at_price ?? null,
    stock: product?.stock ?? 0,
    sku: product?.sku ?? "",
    category_id: product?.category_id ?? "",
    image_urls: product?.image_urls ?? (product?.image_url ? [product.image_url] : []),
    is_featured: product?.is_featured ?? false,
    is_popular: product?.is_popular ?? false,
    is_active: product?.is_active ?? true,
    is_flash_sale: product?.is_flash_sale ?? false,
  }
}

function AdminProductForm({ product }: { product?: Product }) {
  const t = useT()
  const router = useRouter()
  const { data: categories = [] } = useAdminCategories()
  const [slugTouched, setSlugTouched] = useState(!!product)
  const [discount, setDiscount] = useState(() =>
    product ? String(discountPercent(product.price, product.compare_at_price) || "") : ""
  )

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: toDefaultValues(product),
  })

  const stock = useWatch({ control, name: "stock" })

  // Rewrites price / compare-at price for `value`% off the original price.
  function handleDiscountChange(value: string) {
    setDiscount(value)
    const percent = value === "" ? 0 : Number(value)
    if (!Number.isFinite(percent) || percent < 0) return
    const next = applyDiscount({ price: getValues("price"), compare_at_price: getValues("compare_at_price") }, percent)
    setValue("price", next.price, { shouldValidate: true, shouldDirty: true })
    setValue("compare_at_price", next.compare_at_price, { shouldValidate: true, shouldDirty: true })
  }

  function handleSoldOutChange(soldOut: boolean) {
    if (soldOut) setValue("stock", 0, { shouldValidate: true, shouldDirty: true })
    else setFocus("stock")
  }

  function handleNameChange(value: string) {
    if (!slugTouched) {
      setValue("slug", slugify(value))
    }
  }

  async function onSubmit(values: ProductValues) {
    const result = product ? await updateProduct(product.id, values) : await createProduct(values)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(product ? t("admin.products.updated") : t("admin.products.created"))
    router.push("/admin/products")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="name_en"
          label={t("admin.productForm.nameEn")}
          registration={register("name_en", { onChange: (e) => handleNameChange(e.target.value) })}
          error={errors.name_en?.message}
        />
        <FormField
          id="name_am"
          label={t("admin.productForm.nameAm")}
          registration={register("name_am")}
          error={errors.name_am?.message}
        />
      </div>

      <FormField
        id="slug"
        label={t("admin.productForm.slug")}
        registration={register("slug", { onChange: () => setSlugTouched(true) })}
        error={errors.slug?.message}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="description_en" className="text-sm font-medium text-charcoal">
            {t("admin.productForm.descriptionEn")}
          </label>
          <Textarea id="description_en" {...register("description_en")} />
          {errors.description_en && <p className="text-xs text-error">{errors.description_en.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="description_am" className="text-sm font-medium text-charcoal">
            {t("admin.productForm.descriptionAm")}
          </label>
          <Textarea id="description_am" {...register("description_am")} />
          {errors.description_am && <p className="text-xs text-error">{errors.description_am.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          id="price"
          label={t("admin.productForm.price")}
          type="number"
          registration={register("price", { valueAsNumber: true })}
          error={errors.price?.message}
        />
        <FormField
          id="compare_at_price"
          label={t("admin.productForm.compareAt")}
          type="number"
          registration={register("compare_at_price", {
            setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
          })}
          error={errors.compare_at_price?.message}
        />
        <FormField
          id="stock"
          label={t("admin.productForm.stock")}
          type="number"
          registration={register("stock", { valueAsNumber: true })}
          error={errors.stock?.message}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="discount_percent" className="text-sm font-medium text-charcoal">
            {t("admin.productForm.discountPercent")}
          </label>
          <Input
            id="discount_percent"
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_DISCOUNT_PERCENT}
            step={1}
            value={discount}
            onChange={(e) => handleDiscountChange(e.target.value)}
            aria-describedby="discount_percent-hint"
          />
          <p id="discount_percent-hint" className="text-xs text-muted-text">
            {t("admin.productForm.discountHint")}
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-charcoal">
            <Switch checked={Number(stock) === 0} onCheckedChange={handleSoldOutChange} aria-describedby="sold_out-hint" />
            {t("admin.productForm.soldOut")}
          </label>
          <p id="sold_out-hint" className="text-xs text-muted-text">
            {t("admin.productForm.soldOutHint")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="sku" label={t("admin.productForm.sku")} registration={register("sku")} error={errors.sku?.message} />
        <div className="space-y-1.5">
          <label htmlFor="category_id" className="text-sm font-medium text-charcoal">
            {t("admin.productForm.category")}
          </label>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <select
                id="category_id"
                value={field.value}
                onChange={field.onChange}
                aria-invalid={!!errors.category_id}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-charcoal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
              >
                <option value="">{t("admin.productForm.selectCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {nameOf(c, t.locale)}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.category_id && <p className="text-xs text-error">{errors.category_id.message}</p>}
        </div>
      </div>

      <Controller
        name="image_urls"
        control={control}
        render={({ field }) => (
          <ProductImagesField
            id="image_urls"
            value={field.value}
            onChange={field.onChange}
            error={errors.image_urls?.message ?? errors.image_urls?.find?.((item) => item?.message)?.message}
          />
        )}
      />

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <Controller name="is_active" control={control} render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )} />
          {t("admin.productForm.active")}
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <Controller name="is_featured" control={control} render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )} />
          {t("admin.productForm.featured")}
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <Controller name="is_popular" control={control} render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )} />
          {t("admin.productForm.popular")}
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <Controller name="is_flash_sale" control={control} render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} aria-describedby="flash_sale-hint" />
          )} />
          {t("admin.productForm.flashSale")}
        </label>
      </div>
      <p id="flash_sale-hint" className="text-xs text-muted-text">
        {t("admin.productForm.flashSaleHint")}
      </p>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {product ? t("admin.productForm.save") : t("admin.productForm.create")}
        </Button>
      </div>
    </form>
  )
}

export { AdminProductForm }
