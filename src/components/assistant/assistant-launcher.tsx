"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { Sparkles } from "lucide-react"

import { useT } from "@/lib/i18n/provider"

// The panel (the chat, its store and the Markdown reader) is only downloaded
// when a shopper opens it, or points at the button; pages ship just the button.
const loadPanel = () => import("@/components/assistant/assistant-panel").then((m) => m.AssistantPanel)
const AssistantPanel = dynamic(loadPanel, { ssr: false })

// The round "Ask Evael" button, bottom right on every shop page. The root
// layout renders it only when the assistant is configured (GEMINI_API_KEY).
//
// On phones and tablets it floats above whichever bar is pinned to the bottom
// of the screen — BottomNav, or the product page's buy bar in its place — at
// the same height the toasts use. It stays off the checkout, where nothing
// should distract from finishing the order.
function AssistantLauncher() {
  const t = useT()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (pathname === "/checkout") return null

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        onClick={() => {
          setLoaded(true)
          setOpen(true)
        }}
        className="fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 flex size-14 items-center justify-center gap-2 rounded-full bg-brand-strong text-white shadow-lift ring-1 ring-gold/40 transition-colors outline-none hover:bg-brand-deep focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] lg:right-6 lg:bottom-6 lg:h-12 lg:w-auto lg:px-5"
      >
        <Sparkles aria-hidden className="size-6 text-gold lg:size-5" />
        <span className="sr-only text-sm font-semibold lg:not-sr-only">{t("assistant.open")}</span>
      </button>
      {loaded && <AssistantPanel open={open} onOpenChange={setOpen} />}
    </>
  )
}

export { AssistantLauncher }
