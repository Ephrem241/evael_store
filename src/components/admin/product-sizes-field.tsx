"use client"

import { ArrowUp, Plus, Trash2 } from "lucide-react"

import { useT } from "@/lib/i18n/provider"
import {
  addPreset,
  MAX_SIZE_LABEL_LENGTH,
  MAX_SIZES,
  totalSizeStock,
  type ProductSize,
  type SizePreset,
} from "@/lib/product-sizes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// The product form's sizes: one row per size (its label and how many are in
// stock), in the order the shop shows them. Two quick fills add the usual
// clothing (XS–XXL) or shoe (36–45) sizes; "Add size" adds a blank row for
// anything else (One size, 42.5, 32/34...). No rows: the product isn't sold
// in sizes and the form's ordinary Stock box is used.
function ProductSizesField({
  value,
  onChange,
  error,
}: {
  value: ProductSize[]
  onChange: (next: ProductSize[]) => void
  error?: string
}) {
  const t = useT()

  function update(index: number, patch: Partial<ProductSize>) {
    onChange(value.map((size, i) => (i === index ? { ...size, ...patch } : size)))
  }

  function move(index: number, by: -1 | 1) {
    const to = index + by
    if (to < 0 || to >= value.length) return
    const next = [...value]
    ;[next[index], next[to]] = [next[to], next[index]]
    onChange(next)
  }

  const presets: { id: SizePreset; label: string }[] = [
    { id: "clothing", label: t("admin.productForm.sizes.clothing") },
    { id: "shoes", label: t("admin.productForm.sizes.shoes") },
  ]

  return (
    <fieldset className="space-y-3 rounded-card border border-border bg-surface p-4">
      <legend className="px-1 text-sm font-medium text-charcoal">{t("admin.productForm.sizes.title")}</legend>
      <p className="text-xs text-muted-text">{t("admin.productForm.sizes.hint")}</p>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant="outline"
            size="sm"
            disabled={value.length >= MAX_SIZES}
            onClick={() => onChange(addPreset(value, preset.id).slice(0, MAX_SIZES))}
          >
            <Plus aria-hidden />
            {preset.label}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={value.length >= MAX_SIZES}
          onClick={() => onChange([...value, { label: "", stock: 0 }])}
        >
          <Plus aria-hidden />
          {t("admin.productForm.sizes.add")}
        </Button>
      </div>

      {value.length > 0 && (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_6rem_auto] gap-x-2 text-xs font-medium text-muted-text">
            <span>{t("admin.productForm.sizes.size")}</span>
            <span>{t("admin.productForm.sizes.stock")}</span>
            <span className="sr-only">{t("admin.productForm.sizes.actions")}</span>
          </div>
          <ul className="space-y-2">
            {value.map((size, index) => (
              // The index is the row's identity while it is edited (two rows may briefly share a label).
              <li key={index} className="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-center gap-2">
                <Input
                  value={size.label}
                  maxLength={MAX_SIZE_LABEL_LENGTH}
                  onChange={(e) => update(index, { label: e.target.value })}
                  aria-label={t("admin.productForm.sizes.sizeN", { n: index + 1 })}
                  placeholder={t("admin.productForm.sizes.placeholder")}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={Number.isFinite(size.stock) ? size.stock : ""}
                  onChange={(e) => update(index, { stock: e.target.value === "" ? 0 : Math.max(0, Math.floor(Number(e.target.value))) })}
                  aria-label={t("admin.productForm.sizes.stockFor", { size: size.label || String(index + 1) })}
                />
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={t("admin.productForm.sizes.moveUp", { size: size.label || String(index + 1) })}
                  >
                    <ArrowUp aria-hidden className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                    aria-label={t("admin.productForm.sizes.remove", { size: size.label || String(index + 1) })}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-text">
            {t("admin.productForm.sizes.total", { count: totalSizeStock(value) })}
          </p>
        </>
      )}

      {error && <p className="text-xs text-error">{error}</p>}
    </fieldset>
  )
}

export { ProductSizesField }
