import { SLUG_RE } from "@/lib/slug"

// The little Markdown the assistant is asked to write — paragraphs, "- "
// lists, **bold** and [links](/path) — parsed into plain data that the panel
// renders as React elements. Nothing is ever inserted as HTML, so whatever
// the model writes shows up as text.
//
// A link stays a link only when it points to one of this site's own pages
// (the ones the prompt names). Anything else — another site, `javascript:`,
// a made-up address — is shown as its words, without the link.

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "link"; text: string; href: string }

export type Block = { kind: "paragraph"; inlines: Inline[] } | { kind: "list"; items: Inline[][] }

const SLUG = SLUG_RE.source.slice(1, -1) // the slug pattern without its ^…$ anchors
const SAFE_HREF = new RegExp(
  `^/(?:(?:product|category)/${SLUG}|shop|deals|categories|delivery|returns|contact|faq|cart|orders|account)$`
)

export function isSafeHref(href: string): boolean {
  return SAFE_HREF.test(href)
}

/** The product a link points to, if it is a product link. */
export function productSlugOf(href: string): string | null {
  return href.startsWith("/product/") ? href.slice("/product/".length) : null
}

const LIST_ITEM = /^\s*(?:[-*•]|\d{1,2}[.)])\s+(.*)$/
const HEADING = /^\s*#{1,6}\s+/

export function parseAssistantMarkdown(source: string): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: string[] = []

  const flushParagraph = () => {
    if (paragraph.length > 0) blocks.push({ kind: "paragraph", inlines: parseInline(paragraph.join("\n")) })
    paragraph = []
  }
  const flushList = () => {
    if (list.length > 0) blocks.push({ kind: "list", items: list.map(parseInline) })
    list = []
  }

  for (const line of source.replace(/\r\n?/g, "\n").split("\n")) {
    const item = LIST_ITEM.exec(line)
    if (item) {
      flushParagraph()
      list.push(item[1].trim())
    } else if (line.trim() === "") {
      flushParagraph()
      flushList()
    } else {
      flushList()
      // A heading the model wrote anyway reads fine as a plain line.
      paragraph.push(line.replace(HEADING, "").trim())
    }
  }
  flushParagraph()
  flushList()
  return blocks
}

const INLINE = /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*/g

export function parseInline(text: string): Inline[] {
  const out: Inline[] = []
  const pushText = (value: string) => {
    if (value === "") return
    const last = out.at(-1)
    if (last?.kind === "text") last.text += value
    else out.push({ kind: "text", text: value })
  }

  let index = 0
  for (const match of text.matchAll(INLINE)) {
    pushText(text.slice(index, match.index))
    const [whole, label, href, bold] = match
    if (bold !== undefined) {
      out.push({ kind: "bold", text: bold })
    } else {
      const words = label.replace(/\*\*/g, "")
      if (isSafeHref(href)) out.push({ kind: "link", text: words, href })
      else pushText(words)
    }
    index = match.index + whole.length
  }
  pushText(text.slice(index))
  return out
}
