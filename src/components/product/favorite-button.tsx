"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { useFavoritesStore } from "@/lib/store/favorites"
import { useIsAdmin } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"

// The heart: a round white button over a photo (card corner, product page) or
// beside the purchase buttons. An outline at rest, filled burgundy when saved,
// with a small "pop" when the shopper toggles it (only then — not for every
// already-saved heart on page load). The state is never colour alone: the
// accessible name says what the button will do ("Add to" / "Remove from
// favorites"), and every change is announced by a toast. (No aria-pressed on
// top of a label that changes with the state: a screen reader would read
// "Remove from favorites, pressed".)
function FavoriteButton({
  productId,
  className,
}: {
  productId: string
  className?: string
}) {
  const t = useT()
  const isFavorited = useFavoritesStore((s) => s.ids.includes(productId))
  const toggle = useFavoritesStore((s) => s.toggle)
  const isAdmin = useIsAdmin()
  // Bumped on every toggle: re-mounting the icon replays the animation.
  const [pops, setPops] = useState(0)

  function handleToggle() {
    toggle(productId)
    setPops((n) => n + 1)
    toast.success(isFavorited ? t("product.favorites.removed") : t("product.favorites.added"))
  }

  // Admins don't shop (see useIsAdmin).
  if (isAdmin) return null

  return (
    <Button
      type="button"
      variant="icon-circle"
      onClick={handleToggle}
      aria-label={isFavorited ? t("product.favorites.remove") : t("product.favorites.add")}
      className={cn("hover:text-brand", className)}
    >
      <Heart
        key={pops}
        aria-hidden
        className={cn("size-[18px]", pops > 0 && "animate-pop", isFavorited && "fill-brand text-brand")}
      />
    </Button>
  )
}

export { FavoriteButton }
