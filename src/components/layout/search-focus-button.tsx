"use client"

import { Search } from "lucide-react"

import { useT } from "@/lib/i18n/provider"
import { Button } from "@/components/ui/button"

// The search icon in the phone header's top row: it moves focus to the search
// field just below it (which opens the keyboard).
function SearchFocusButton({ inputId }: { inputId: string }) {
  const t = useT()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      aria-label={t("search.label")}
      onClick={() => document.getElementById(inputId)?.focus()}
      className="text-white hover:bg-white/10 hover:text-white focus-visible:ring-gold"
    >
      <Search aria-hidden className="size-[22px]" strokeWidth={1.75} />
    </Button>
  )
}

export { SearchFocusButton }
