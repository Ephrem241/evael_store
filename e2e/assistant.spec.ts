import type { Page, Route } from "@playwright/test"

import { encodeEvent } from "@/lib/ai/ndjson"
import type { AssistantStreamEvent, AssistantTurn } from "@/lib/ai/types"
import { en } from "@/locales/en"

import type { CatalogProduct } from "./support/db"
import { expect, test } from "./support/fixtures"
import { etb } from "./support/ui"

// The shopping assistant (components/assistant). Gemini is never called: the
// browser's request to /api/assistant is answered here with a scripted
// stream, so these tests check the shop's side — the panel, links and cards,
// the conversation kept for the visit, errors — not what a model writes.
//
// The button exists only when the server has a GEMINI_API_KEY (any value
// will do, since nothing reaches Google); without one these tests are skipped.

const launcher = (page: Page) => page.getByRole("button", { name: en.assistant.open })
const panel = (page: Page) => page.getByRole("dialog", { name: en.assistant.title })

async function openShop(page: Page, path = "/") {
  await page.goto(path)
  const button = launcher(page)
  test.skip((await button.count()) === 0, "The server has no GEMINI_API_KEY, so the assistant is switched off.")
  // Wait for React to wire the button up before clicking it.
  await button.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        const ready = () => Object.keys(element).some((key) => key.startsWith("__reactProps"))
        const check = () => (ready() ? resolve() : setTimeout(check, 50))
        check()
      })
  )
  return button
}

/** Answers every question with `reply`, and records what the browser sent. */
async function fakeAssistant(page: Page, reply: (route: Route) => Promise<void>) {
  const sent: AssistantTurn[][] = []
  await page.route("**/api/assistant", async (route) => {
    sent.push((route.request().postDataJSON() as { messages: AssistantTurn[] }).messages)
    await reply(route)
  })
  return sent
}

function stream(events: AssistantStreamEvent[]) {
  return (route: Route) =>
    route.fulfill({ status: 200, contentType: "application/x-ndjson", body: events.map(encodeEvent).join("") })
}

function recommending(product: CatalogProduct): AssistantStreamEvent[] {
  return [
    { type: "text", text: "Here is a good pick:\n\n- " },
    { type: "text", text: `[${product.name_en}](/product/${product.slug}) for ${etb(product.price)}` },
    {
      type: "products",
      items: [
        {
          id: product.id,
          slug: product.slug,
          name: product.name_en,
          price: product.price,
          compareAtPrice: null,
          imageUrl: null,
          inStock: true,
        },
      ],
    },
  ]
}

test.describe("Shopping assistant", () => {
  test("answers with a product link and card, and keeps the conversation while browsing", async ({ page, catalog, problems }) => {
    const product = catalog[0]
    const sent = await fakeAssistant(page, stream(recommending(product)))
    const button = await openShop(page)

    await test.step("the button opens the chat with example questions", async () => {
      await button.click()
      await expect(panel(page)).toBeVisible()
      await expect(panel(page).getByText(en.assistant.welcomeTitle)).toBeVisible()
    })

    await test.step("an example question is sent and the reply streams in with a card", async () => {
      await panel(page).getByRole("button", { name: en.assistant.suggestions.gift }).click()
      await expect(panel(page).getByRole("log")).toContainText("Here is a good pick")
      expect(sent[0]).toEqual([{ role: "user", text: en.assistant.suggestions.gift }])
      const cards = panel(page).getByRole("list", { name: en.assistant.productsLabel })
      await expect(cards.getByRole("link")).toContainText(product.name_en)
      await expect(cards).toContainText(etb(product.price))
    })

    await test.step("the card opens the product and closes the chat", async () => {
      await panel(page).getByRole("list", { name: en.assistant.productsLabel }).getByRole("link").click()
      await expect(page).toHaveURL(`/product/${product.slug}`)
      await expect(panel(page)).toBeHidden()
    })

    await test.step("the conversation is still there on the next page, and follow-ups carry it", async () => {
      await launcher(page).click()
      await expect(panel(page).getByRole("log")).toContainText(en.assistant.suggestions.gift)
      await panel(page).getByRole("textbox", { name: en.assistant.inputLabel }).fill("Is it in stock?")
      await page.keyboard.press("Enter")
      await expect.poll(() => sent.length).toBe(2)
      expect(sent[1].map((turn) => turn.role)).toEqual(["user", "model", "user"])
      expect(sent[1][1].text).toContain(`/product/${product.slug}`)
      expect(sent[1][2]).toEqual({ role: "user", text: "Is it in stock?" })
    })

    await test.step("the conversation survives a reload, and Clear empties it", async () => {
      await page.reload()
      await launcher(page).click()
      await expect(panel(page).getByRole("log")).toContainText("Is it in stock?")
      await panel(page).getByRole("button", { name: en.assistant.clear }).click()
      await expect(panel(page).getByText(en.assistant.welcomeTitle)).toBeVisible()
    })

    expect(problems.errors).toEqual([])
  })

  test("a product link the shop doesn't have is shown as plain words", async ({ page }) => {
    await fakeAssistant(
      page,
      stream([
        { type: "text", text: "Try the [Golden Teapot](/product/no-such-teapot) or our [Deals](/deals)." },
        { type: "products", items: [] },
      ])
    )
    await (await openShop(page)).click()
    await panel(page).getByRole("textbox", { name: en.assistant.inputLabel }).fill("Teapots?")
    await panel(page).getByRole("button", { name: en.assistant.send }).click()

    const log = panel(page).getByRole("log")
    await expect(log).toContainText("Golden Teapot")
    await expect(log.getByRole("link", { name: "Golden Teapot" })).toHaveCount(0)
    await expect(log.getByRole("link", { name: "Deals" })).toHaveAttribute("href", "/deals")
  })

  test("too many questions: says so and offers to try again", async ({ page, catalog }) => {
    let calls = 0
    await fakeAssistant(page, async (route) => {
      calls++
      if (calls === 1) await route.fulfill({ status: 429, contentType: "application/json", body: '{"code":"too_many"}' })
      else await stream(recommending(catalog[0]))(route)
    })
    await (await openShop(page)).click()
    await panel(page).getByRole("button", { name: en.assistant.suggestions.deals }).click()
    await expect(panel(page).getByRole("alert")).toHaveText(en.assistant.errors.tooMany)

    await panel(page).getByRole("button", { name: en.common.retry }).click()
    await expect(panel(page).getByRole("list", { name: en.assistant.productsLabel })).toContainText(catalog[0].name_en)
    await expect(panel(page).getByRole("alert")).toHaveCount(0)
  })

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

    test("the button sits above the bottom bar, and the chat fills the screen", async ({ page, catalog }) => {
      const button = await openShop(page)
      const nav = page.getByRole("navigation", { name: en.nav.primaryMobile })
      const [buttonBox, navBox] = [await button.boundingBox(), await nav.boundingBox()]
      expect(buttonBox!.y + buttonBox!.height).toBeLessThanOrEqual(navBox!.y)

      // On a product page the buy bar is pinned to the bottom in the nav's place.
      await page.goto(`/product/${catalog[0].slug}`)
      await expect(page.getByRole("button", { name: en.product.buyNow }).first()).toBeVisible()
      const buyBoxes = await Promise.all((await page.getByRole("button", { name: en.product.buyNow }).all()).map((b) => b.boundingBox()))
      const buyBar = buyBoxes.filter((box) => box !== null).sort((a, b) => b.y - a.y)[0]
      const onProduct = await launcher(page).boundingBox()
      expect(onProduct!.y + onProduct!.height).toBeLessThanOrEqual(buyBar.y)

      await launcher(page).click()
      await expect(panel(page)).toBeVisible()
      expect((await panel(page).boundingBox())!.width).toBeGreaterThanOrEqual(389)
    })
  })
})
