"use client"

import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { Button } from "@/components/ui/button"

// Shares the product page: the phone's own share sheet where there is one
// (most phones), otherwise the link is copied and a toast says so.
function ShareButton({ title, className }: { title: string; className?: string }) {
  const t = useT()

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // Closing the share sheet without choosing is not an error worth reporting.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t("product.share.copied"))
    } catch {
      toast.error(t("product.share.failed"))
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={share}
      aria-label={t("product.share.label")}
      className={cn("size-12 shrink-0 rounded-full max-lg:size-12", className)}
    >
      <Share2 className="size-[18px]" />
    </Button>
  )
}

export { ShareButton }
