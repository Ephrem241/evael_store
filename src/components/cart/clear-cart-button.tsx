"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { useCartStore } from "@/lib/store/cart"
import { useIsAdmin } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Empties the cart, after asking. "icon": the trash in the phone's cart bar;
// "text": a small link-like button over the items on desktop. Shown only when
// there is something to clear (and never before the saved cart has been read,
// or for an admin, who has no cart).
function ClearCartButton({ variant = "icon", className }: { variant?: "icon" | "text"; className?: string }) {
  const t = useT()
  const count = useCartStore((s) => s.items.length)
  const hasHydrated = useCartStore((s) => s.hasHydrated)
  const clearCart = useCartStore((s) => s.clearCart)
  const isAdmin = useIsAdmin()
  const [open, setOpen] = useState(false)

  if (!hasHydrated || count === 0 || isAdmin) return null

  function confirm() {
    clearCart()
    setOpen(false)
    toast.success(t("cart.cleared"))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="icon-lg" aria-label={t("cart.clear")} className={cn("text-charcoal", className)}>
            <Trash2 aria-hidden className="size-[22px]" strokeWidth={1.75} />
          </Button>
        ) : (
          <Button variant="ghost-link" className={cn("text-sm text-muted-text hover:text-brand-ink", className)}>
            <Trash2 aria-hidden className="size-4" />
            {t("cart.clear")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("cart.clearTitle")}</DialogTitle>
          <DialogDescription>{t("cart.clearText")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={confirm}>{t("cart.clear")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ClearCartButton }
