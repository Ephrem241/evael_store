"use client"

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { ArrowUp, Sparkles, Square, Trash2, XIcon } from "lucide-react"

import { ASSISTANT_LIMITS } from "@/lib/ai/limits"
import { useT } from "@/lib/i18n/provider"
import type { MessageKey } from "@/lib/i18n/translator"
import { AssistantMessageView } from "@/components/assistant/assistant-message"
import { useAssistantChat } from "@/components/assistant/use-assistant-chat"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

const SUGGESTIONS: MessageKey[] = [
  "assistant.suggestions.gift",
  "assistant.suggestions.deals",
  "assistant.suggestions.delivery",
]

// The chat itself: a panel from the right (the whole screen on a phone) with
// the conversation, three example questions while it is empty, and the input.
// Loaded only when the shopper first opens it (AssistantLauncher), and kept
// mounted after that so a reply goes on arriving while it is closed.
function AssistantPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useT()
  const { messages, busy, ask, retry, stop, clear } = useAssistantChat()
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  // Follow the reply as it grows, unless the shopper has scrolled up to read.
  const followRef = useRef(true)

  useEffect(() => {
    const log = logRef.current
    if (log && followRef.current) log.scrollTop = log.scrollHeight
  }, [messages, open])

  const send = (text: string) => {
    if (busy || text.trim() === "") return
    followRef.current = true
    ask(text)
    setDraft("")
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    send(draft)
  }

  // Enter sends, Shift+Enter starts a new line. Not while an input method is
  // still composing a character (Amharic keyboards compose syllables).
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send(draft)
    }
  }

  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        // A phone's keyboard would cover the panel the moment it opens; on a
        // computer, go straight to the input.
        onOpenAutoFocus={(event) => {
          if (window.matchMedia("(min-width: 1024px)").matches) {
            event.preventDefault()
            inputRef.current?.focus()
          }
        }}
      >
        <SheetHeader className="flex-row items-center gap-3 bg-brand-deep pt-[max(1rem,env(safe-area-inset-top))] text-white">
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Sparkles className="size-5 text-gold" />
          </span>
          <div className="min-w-0 flex-1">
            <SheetTitle className="font-display text-lg leading-tight font-bold text-white">
              {t("assistant.title")}
            </SheetTitle>
            <SheetDescription className="text-xs text-white/80">{t("assistant.subtitle")}</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
              <XIcon aria-hidden />
              <span className="sr-only">{t("common.close")}</span>
            </Button>
          </SheetClose>
        </SheetHeader>

        <div
          ref={logRef}
          role="log"
          aria-label={t("assistant.conversation")}
          aria-busy={busy || undefined}
          tabIndex={0}
          onScroll={(event) => {
            const log = event.currentTarget
            followRef.current = log.scrollHeight - log.scrollTop - log.clientHeight < 80
          }}
          className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          {messages.length === 0 ? (
            <div className="my-auto flex flex-col items-center gap-4 px-2 py-6 text-center">
              <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-brand-soft">
                <Sparkles className="size-7 text-brand-ink" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-display text-xl font-bold text-charcoal">{t("assistant.welcomeTitle")}</p>
                <p className="text-sm text-muted-text">{t("assistant.welcomeText")}</p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-text uppercase">
                  {t("assistant.suggestionsLabel")}
                </p>
                {SUGGESTIONS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => send(t(key))}
                    className="min-h-11 rounded-xl border border-border bg-surface px-4 py-2.5 text-left text-sm text-charcoal transition-colors outline-none hover:border-brand hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <AssistantMessageView
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                onRetry={retry}
                onNavigate={close}
              />
            ))
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-2 border-t border-border bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              aria-label={t("assistant.inputLabel")}
              placeholder={t("assistant.placeholder")}
              maxLength={ASSISTANT_LIMITS.maxUserChars}
              rows={1}
              enterKeyHint="send"
              className="field-sizing-content max-h-32 min-h-11 resize-none py-2.5"
            />
            {busy ? (
              <Button type="button" size="icon" variant="outline" onClick={stop} className="rounded-full">
                <Square aria-hidden className="fill-current" />
                <span className="sr-only">{t("assistant.stop")}</span>
              </Button>
            ) : (
              <Button type="submit" size="icon" className="rounded-full" disabled={draft.trim() === ""}>
                <ArrowUp aria-hidden />
                <span className="sr-only">{t("assistant.send")}</span>
              </Button>
            )}
          </div>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] leading-4 text-muted-text">{t("assistant.disclaimer")}</p>
            {messages.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  clear()
                  inputRef.current?.focus()
                }}
                className="shrink-0 text-muted-text max-lg:min-h-11"
              >
                <Trash2 aria-hidden />
                {t("assistant.clear")}
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export { AssistantPanel }
