import { describe, expect, it } from "vitest"

import { isSafeHref, parseAssistantMarkdown, parseInline, productSlugOf } from "@/lib/ai/assistant-markdown"

describe("isSafeHref", () => {
  it.each(["/product/classic-leather-bag", "/category/fashion", "/shop", "/deals", "/categories", "/delivery", "/returns", "/contact", "/faq", "/cart", "/orders", "/account"])(
    "allows this site's page %s",
    (href) => {
      expect(isSafeHref(href)).toBe(true)
    }
  )

  it.each([
    "javascript:alert(1)",
    "https://evil.example/product/x",
    "//evil.example",
    "/product/",
    "/product/Bad_Slug",
    "/product/a/b",
    "/admin",
    "/shop?q=x",
    "/login",
    "product/x",
  ])("refuses %s", (href) => {
    expect(isSafeHref(href)).toBe(false)
  })
})

describe("productSlugOf", () => {
  it("reads the product a link points to", () => {
    expect(productSlugOf("/product/silk-scarf")).toBe("silk-scarf")
    expect(productSlugOf("/category/fashion")).toBeNull()
  })
})

describe("parseInline", () => {
  it("reads bold text and links among plain text", () => {
    expect(parseInline("Try the **Silk Scarf**: [see it](/product/silk-scarf)!")).toEqual([
      { kind: "text", text: "Try the " },
      { kind: "bold", text: "Silk Scarf" },
      { kind: "text", text: ": " },
      { kind: "link", text: "see it", href: "/product/silk-scarf" },
      { kind: "text", text: "!" },
    ])
  })

  it("shows an unsafe link as its words only", () => {
    expect(parseInline("Click [here](javascript:alert(1)) or [there](https://evil.example).")).toEqual([
      { kind: "text", text: "Click here) or there." },
    ])
  })

  it("never treats HTML as anything but text", () => {
    expect(parseInline('<img src=x onerror="alert(1)">')).toEqual([{ kind: "text", text: '<img src=x onerror="alert(1)">' }])
  })

  it("drops bold markers inside a link's words", () => {
    expect(parseInline("[**Bag**](/product/bag)")).toEqual([{ kind: "link", text: "Bag", href: "/product/bag" }])
  })
})

describe("parseAssistantMarkdown", () => {
  it("splits paragraphs on blank lines and keeps single line breaks", () => {
    expect(parseAssistantMarkdown("Hello!\nWelcome.\n\nBye.")).toEqual([
      { kind: "paragraph", inlines: [{ kind: "text", text: "Hello!\nWelcome." }] },
      { kind: "paragraph", inlines: [{ kind: "text", text: "Bye." }] },
    ])
  })

  it("reads -, * and numbered lists", () => {
    const blocks = parseAssistantMarkdown("Picks:\n- One\n* Two\n3. Three\nAfter")
    expect(blocks.map((b) => b.kind)).toEqual(["paragraph", "list", "paragraph"])
    expect(blocks[1]).toEqual({
      kind: "list",
      items: [[{ kind: "text", text: "One" }], [{ kind: "text", text: "Two" }], [{ kind: "text", text: "Three" }]],
    })
  })

  it("turns a heading into a plain line", () => {
    expect(parseAssistantMarkdown("## Gift ideas")).toEqual([{ kind: "paragraph", inlines: [{ kind: "text", text: "Gift ideas" }] }])
  })

  it("handles Windows line endings and an empty reply", () => {
    expect(parseAssistantMarkdown("A\r\n\r\nB")).toHaveLength(2)
    expect(parseAssistantMarkdown("")).toEqual([])
  })
})
