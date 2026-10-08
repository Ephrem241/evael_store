"use client"

import { Fragment, useMemo } from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { parseAssistantMarkdown, productSlugOf, type Inline } from "@/lib/ai/assistant-markdown"
import type { AssistantProduct } from "@/lib/ai/types"
import { useT } from "@/lib/i18n/provider"
import type { AssistantMessage } from "@/lib/store/assistant"
import { ImagePlaceholder } from "@/components/product/image-placeholder"
import { Price } from "@/components/product/price"
import { Button } from "@/components/ui/button"

// One message of the conversation. The shopper's question is plain text; a
// reply is the assistant's little Markdown (lib/ai/assistant-markdown.ts),
// rendered as elements — never as HTML — followed by cards for the products
// it linked to. Once a reply is finished, a product link the server could not
// match to a real product (the model made it up) is shown as plain words.
function AssistantMessageView({
  message,
  isLast,
  onRetry,
  onNavigate,
}: {
  message: AssistantMessage
  isLast: boolean
  onRetry: (id: string) => void
  onNavigate: () => void
}) {
  const t = useT()

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-strong px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white">
          <span className="sr-only">{t("assistant.you")}: </span>
          {message.text}
        </p>
      </div>
    )
  }

  const streaming = message.status === "streaming"
  return (
    <div className="flex flex-col items-start gap-2" aria-busy={streaming || undefined}>
      <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-subtle px-3.5 py-2.5 text-sm leading-relaxed text-charcoal">
        <span className="sr-only">{t("assistant.assistantName")}: </span>
        {message.text ? (
          <ReplyText text={message.text} products={message.products} streaming={streaming} onNavigate={onNavigate} />
        ) : streaming ? (
          <TypingDots label={t("assistant.thinking")} />
        ) : null}
        {message.status === "stopped" && <p className="mt-1 text-xs text-muted-text italic">{t("assistant.stopped")}</p>}
        {message.status === "error" && (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p role="alert" className="text-xs text-error">
              {t(`assistant.errors.${message.error ?? "generic"}`)}
            </p>
            {isLast && (
              <Button variant="outline" size="xs" onClick={() => onRetry(message.id)}>
                {t("common.retry")}
              </Button>
            )}
          </div>
        )}
      </div>
      {message.products && message.products.length > 0 && (
        <ul aria-label={t("assistant.productsLabel")} className="flex w-full max-w-[92%] flex-col gap-2">
          {message.products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ReplyText({
  text,
  products,
  streaming,
  onNavigate,
}: {
  text: string
  products: AssistantProduct[] | undefined
  streaming: boolean
  onNavigate: () => void
}) {
  const blocks = useMemo(() => parseAssistantMarkdown(text), [text])
  const known = useMemo(() => new Set((products ?? []).map((p) => p.slug)), [products])
  const linkable = (href: string) => {
    const slug = productSlugOf(href)
    return slug === null || streaming || known.has(slug)
  }

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, index) =>
        block.kind === "paragraph" ? (
          <p key={index} className="whitespace-pre-line">
            <Inlines inlines={block.inlines} linkable={linkable} onNavigate={onNavigate} />
          </p>
        ) : (
          <ul key={index} className="flex list-disc flex-col gap-1 pl-5 marker:text-brand-ink">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Inlines inlines={item} linkable={linkable} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}

function Inlines({
  inlines,
  linkable,
  onNavigate,
}: {
  inlines: Inline[]
  linkable: (href: string) => boolean
  onNavigate: () => void
}) {
  return inlines.map((inline, index) => {
    if (inline.kind === "bold") return <strong key={index} className="font-semibold">{inline.text}</strong>
    if (inline.kind === "link" && linkable(inline.href)) {
      return (
        <Link
          key={index}
          href={inline.href}
          onClick={onNavigate}
          className="font-semibold text-brand-ink underline underline-offset-2 hover:text-brand-deep"
        >
          {inline.text}
        </Link>
      )
    }
    return <Fragment key={index}>{inline.text}</Fragment>
  })
}

function ProductCard({ product, onNavigate }: { product: AssistantProduct; onNavigate: () => void }) {
  const t = useT()
  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2 pr-3 shadow-(--shadow-soft) transition-colors outline-none hover:border-brand focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ImagePlaceholder
        seed={product.id}
        icon={ShoppingBag}
        label={product.name}
        imageUrl={product.imageUrl}
        sizes="56px"
        decorative
        className="size-14 shrink-0 [&>svg]:size-6"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 text-sm font-medium text-charcoal">{product.name}</span>
        <span className="flex flex-wrap items-baseline gap-x-2">
          <Price amount={product.price} t={t} className="text-sm" />
          {product.compareAtPrice != null && <Price amount={product.compareAtPrice} t={t} variant="compare" />}
        </span>
        {!product.inStock && <span className="text-xs font-medium text-error">{t("product.stock.out")}</span>}
      </span>
    </Link>
  )
}

function TypingDots({ label }: { label: string }) {
  return (
    <span className="flex h-5 items-center gap-1" role="status">
      <span className="sr-only">{label}</span>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          aria-hidden
          className="size-1.5 animate-bounce rounded-full bg-brand-ink/60 motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

export { AssistantMessageView }
