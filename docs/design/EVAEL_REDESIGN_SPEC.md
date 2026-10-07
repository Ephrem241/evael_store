# Evael Store redesign spec (burgundy + gold)

Handoff spec for Claude Code. Target repo: `Ephrem241/evael_store` (Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/Radix, Supabase, Zustand).

Reference images (put both in the repo before starting):

- `docs/design/desktop-home.png` (desktop home page)
- `docs/design/mobile-screens.png` (six mobile screens: Home, Categories, Category listing, Product, Cart, Account)

---

## 0. Kickoff prompt (paste this into Claude Code)

```
Read docs/design/EVAEL_REDESIGN_SPEC.md fully, then look at both images in
docs/design/. We are redesigning the whole storefront to match them.

Start in plan mode. Do Phase 0 from the spec only: audit the current
components and routes, map each one to a section of the mockup, and list
anything in the mockup that the app has no data or feature for. Show me the
plan and your questions before you change any file.

After I approve, work one phase at a time on a branch named
redesign/burgundy-gold. At the end of each phase run typecheck, lint, unit
tests and the Playwright + axe suite, take screenshots at 390px and 1440px,
compare them against the mockups, fix differences, commit, and stop for my
review.
```

---

## 1. Ground rules

1. This is a visual redesign. Do not change business logic, Supabase queries, schemas, routes, auth, cart or checkout behaviour, or the Zustand stores unless a section below says so.
2. Keep the token architecture in `src/app/globals.css`. Every colour must come from a CSS variable. No hard-coded hex values in components.
3. Keep every string in `src/locales`. New copy gets a key in every locale, and the i18n check script must pass. Amharic must look right on every redesigned screen.
4. Accessibility stays at WCAG AA. The e2e axe audit must pass. Where the mockup breaks contrast, follow section 2, not the picture.
5. Do not invent features to match the picture. If the mockup shows something the app has no data for (wishlist, colour variants, reviews tab, Men/Women/Kids filters, saved addresses, saved payment methods), list it in Phase 0 and ask. Never render fake data.
6. Use real catalogue data. Product names, prices, ratings and counts in the mockup are placeholders.
7. Leave `/admin` structure alone. It will pick up the new colours through the shared tokens, which is fine.
8. Leave the `.dark` block alone.
9. Reuse existing components and restyle them. Create a new component only when nothing fits.

---

## 2. Colour tokens

Values below were sampled from the mockup, then adjusted where needed to pass contrast. Keep the existing variable names so components keep working, change the values, and add the new ones.

### 2.1 Replace in `:root`

| Variable | New value | Use |
|---|---|---|
| `--evael-background` | `#FBF6F0` | Page background (warm cream) |
| `--evael-surface` | `#FFFFFF` | Cards, inputs, sheets |
| `--evael-subtle` | `#F6F0EA` | Trust strip, image wells, chips, skeletons, hovers |
| `--evael-border` | `#EBE2D8` | Card and divider lines |
| `--evael-text` | `#1A1414` | Main text |
| `--evael-text-secondary` | `#66605C` | Meta text (5.5:1 on subtle) |
| `--evael-primary` | `#900018` | Hero CTA, icons, focus ring, active underline |
| `--evael-primary-strong` | `#7E061E` | Buttons, filled chips, badges, active nav |
| `--evael-primary-dark` | `#6C0C1E` | Hover and pressed, announcement bar, mobile header |
| `--evael-primary-ink` | `#7E061E` | Burgundy text on light surfaces, prices, links |
| `--evael-primary-soft` | `#F8ECEA` | Tinted backgrounds, selected rows |
| `--evael-sale` | `#B4122A` | "23% OFF" pill, flash bolt |
| `--evael-star` | `#F6A22A` | Rating stars (icon only, never text) |
| `--evael-footer` | `#18181E` | Footer and newsletter card |
| `--ring` | `var(--evael-primary)` | Focus ring |

Keep `--evael-success`, `--evael-warning`, `--evael-warning-text`, `--evael-error` and `--input` as they are.

### 2.2 Add

| Variable | Value | Use |
|---|---|---|
| `--evael-primary-deep` | `#540C18` | "Big Savings" banner, Deals tile |
| `--evael-primary-deepest` | `#420612` | Flash Deals panel, countdown boxes |
| `--evael-gold` | `#D29C4E` | Gold button fill, gold text on burgundy, logo mark |
| `--evael-gold-display` | `#B07A2A` | Gold display text on cream ("Made for Ethiopia."), 3.4:1, large text only |
| `--evael-gold-ink` | `#8A5A12` | Small gold text on light surfaces (5.5:1) |
| `--evael-gold-border` | `#CCA884` | Outline button border |

Expose them in `@theme inline` as `--color-brand-deepest`, `--color-gold`, `--color-gold-display`, `--color-gold-ink`, `--color-gold-border`. `--color-brand-deep` already exists and points at `--evael-primary-dark`; keep that, and add `--color-brand-banner` for `--evael-primary-deep`.

### 2.3 Contrast rules (these override the mockup)

- White text on any burgundy token: passes (9.6:1 or better).
- White text on gold: fails (2.4:1). Gold buttons use `--evael-primary-deepest` text. The mockup shows white, do not copy it.
- Gold `#D29C4E` as text: only on burgundy or footer backgrounds (6:1 and 7:1).
- Gold text on cream or white: `--evael-gold-display` at 24px+ bold, otherwise `--evael-gold-ink`.
- Rewrite the contrast comment block at the top of `:root` so it describes the new palette.

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Display | Playfair Display 600/700 via `next/font` | Hero headline, section titles, product title on the product page, logo wordmark, banner headlines |
| Body and UI | Existing sans (Inter) | Everything else |
| Amharic | Existing `--font-amharic` | Fallback behind both |
| Script accent | Caveat 600 | Only the two handwritten flourishes (section 7.3 and 7.12). Decorative, `aria-hidden`, hidden below `lg` |

Change `--font-display` to `var(--font-playfair), var(--font-amharic), Georgia, serif` and update the comment above it. Load only the `latin` subset. Playfair has no Ethiopic glyphs, so Amharic headings fall through to the Amharic font: check their line height and weight look deliberate.

### Scale

| Token | Desktop | Mobile | Style |
|---|---|---|---|
| Hero h1 | 60px / 1.05 | 36px / 1.1 | Display 700, tracking -0.02em |
| Banner headline | 32px / 1.1 | 24px | Display 700, uppercase |
| Section h2 | 26px / 1.2 | 20px | Display 700 |
| Product page title | 28px | 22px | Display 700 |
| Eyebrow | 12px | 11px | Sans 600, uppercase, tracking 0.18em |
| Body | 16px / 1.55 | 14px | Sans 400 |
| Card title | 14px | 14px | Sans 500, 1 line, truncate |
| Meta | 12px | 12px | Sans 400, secondary colour |
| Price | 16px | 15px | Sans 700, `primary-ink` |
| Price (product page) | 28px | 24px | Sans 700, `primary-ink` |
| Old price | 12px | 12px | Sans 400, secondary, line-through |
| Button | 14px | 14px | Sans 600 |

Prices use tabular numbers. Format: `1,850 ETB`.

---

## 4. Shape, shadow, spacing

| Token | Value |
|---|---|
| `--radius-card` | 0.75rem (12px) |
| `--radius-image` | 0.625rem (10px) |
| `--radius-hero` | 0.75rem for banners and panels. Desktop hero is full-bleed with no radius |
| Button radius | 8px standard. Full pill for hero CTAs and filter chips |
| Badge radius | Full pill |
| Card border | 1px `--border`, `--shadow-soft` at rest, `--shadow-lift` on hover |
| Container | max-width 1240px, 24px side padding (16px on mobile) |
| Section gap | 48px desktop, 28px mobile |
| Card padding | 12px |
| Grid gap | 16px desktop, 12px mobile |
| Touch targets | At least 44 by 44px |

Re-tint the two shadow tokens to a warm base: `rgb(66 6 18 / …)` in place of `rgb(23 23 23 / …)`, same opacities.

---

## 5. Shared components

Restyle the existing primitives in `src/components/ui` first, so pages inherit most of the look.

### Button variants

| Variant | Look | Used for |
|---|---|---|
| `primary` | `primary-strong` fill, white text, 8px radius, 40px tall. Hover `primary-dark`. Active scale 0.98 | Add to Cart, Buy Now, Proceed to Checkout, Subscribe |
| `hero` | `primary` fill, white text, pill, 44px tall, arrow icon right | "Shop Now" |
| `outline-gold` | Transparent, 1px `gold-border`, `gold-ink` text, pill. Hover `primary-soft` | "Explore Deals" |
| `gold` | `gold` fill, `primary-deepest` text, 8px radius, arrow icon right | "Shop Deals", "View All Deals" |
| `icon-circle` | 36px white circle, 1px border, soft shadow, dark icon | Carousel arrows, back and wishlist buttons over photos, tile arrows |
| `ghost-link` | `primary-ink` text 12px 600, arrow right, underline on hover | "View All" |

All: visible 2px focus ring with 2px offset, disabled at 50% opacity, loading state with spinner and fixed width.

### Product card (one component, used everywhere)

Top to bottom:

1. Image well: square, `subtle` background, product photo with `object-contain` and 12px padding.
2. Discount pill top-left: `primary-strong` fill, white 11px 600 text, `-23%`. Hidden when there is no discount.
3. Wishlist heart top-right: 32px, outline at rest, filled `primary` when saved, uses the existing `pop` animation. Only if wishlist exists (rule 5).
4. Name (1 line, truncate), category (meta).
5. Rating row: star icon(s), rating number, `(count)` in meta. Hidden when there are no reviews.
6. Price row: price, then old price struck through.
7. Full-width `primary` "Add to Cart" button with cart icon.

Hover on desktop: lift shadow, image scales to 1.03 over 200ms. Out of stock: button disabled, label "Out of stock", image at 60% opacity. Loading: skeleton with the existing `shimmer` animation.

### Category tile

Photo covers the tile, radius 12px, bottom gradient from transparent to `rgb(0 0 0 / 0.65)`. Bottom-left: name (white, 600, 15px) and "120+ products" (white at 85%, 12px, real count). Bottom-right: 28px white circle with a dark chevron. Hover: photo scales 1.04. The whole tile is one link.

"Deals" tile: `primary-deep` background, no photo, sale tag icon in gold, "Deals" in display font, "Save More" under it, arrow circle in gold.

### Other pieces

- **Section heading** (`section-heading.tsx`): display h2 on the left with a small 3px by 14px gold tick before it. `ghost-link` "View All" on the right.
- **Sale pill**: `sale` fill, white 11px 700, "23% OFF".
- **Filter chip**: pill, 36px tall. Selected is `primary-strong` fill with white text. Unselected is white with 1px border and dark text.
- **Quantity stepper**: 1px border, 8px radius, minus / number / plus, each cell 36px. Minus disabled at 1.
- **Colour swatch**: 24px circle. Selected gets a 2px white gap and a 2px `primary` ring. Each swatch has an accessible name.
- **Tabs**: text tabs, active is `primary-ink` 600 with a 2px underline, inactive is secondary.
- **Inputs**: white, `--input` border, 8px radius, 44px tall, burgundy focus ring.
- **Info cell**: `subtle` background, 8px radius, line icon left, 12px title, 11px meta.

Icons: keep the current icon library, 1.5px stroke, `primary` colour inside trust and feature blocks.

---

## 6. Global shell

### 6.1 Announcement bar (desktop and tablet)

`primary-dark` background, 28px tall, white 12px text. Left: truck icon, "Free delivery on orders over 2,000 ETB", a divider, "Shop now and enjoy fast, reliable delivery in Addis Ababa!". Right: language switch `EN | አማ` (keep the `font-ethiopic-system` utility on the Amharic label). Use the real free-delivery threshold from config.

### 6.2 Desktop header (`desktop-nav.tsx`, `search-bar.tsx`)

Background `--background`, 1px bottom border. Two rows.

- Row 1: logo on the left (leaf mark in gold and burgundy, "EVAEL" in display font with 0.12em tracking, "STORE" in 10px tracked caps between two hairlines, tagline "Modern Shopping. Made for Ethiopia." in 11px under it). Search in the middle, about 360px wide: white input with 8px left radius, joined to a 40px square `primary-strong` button with a white search icon. On the right: Account, Wishlist, Cart, each an outline icon with a 12px label. Cart has a count badge (16px `primary-strong` circle, white 10px number).
- Row 2: nav links Home, Fashion, Home & Living, Kitchen, Beauty, Electronics, Accessories, Deals. 13px 500. Active is `primary-ink` with a 2px underline. Take the list from the real categories.

Sticky on scroll. Row 2 may collapse when scrolled.

### 6.3 Mobile header

`primary-dark` block. Row 1: hamburger, logo (white wordmark, gold mark), then search, wishlist and cart icons in white with a count badge in `gold` with dark text. Row 2: tagline in white 11px. Row 3: white search input, 44px tall, 10px radius, placeholder "Search for products, brands and more…".

Inner pages use a plain bar: back arrow, title, actions, on `--background`. The Categories screen centres its title; other screens align it left.

The header height changes, so update `--mobile-header-height` in `globals.css` and check that sticky bars and scroll padding still line up.

### 6.4 Bottom navigation (`bottom-nav.tsx`)

White, 1px top border, safe-area padding. Five tabs: Home, Categories, Wishlist, Cart (count badge), Account. Inactive: outline icon and 10px label in secondary colour. Active: filled icon and label in `primary-strong`. If wishlist does not exist, ask what the third tab should be.

### 6.5 Footer

`--evael-footer` background, white text. Five columns on desktop, stacked accordions on mobile.

1. Logo (white and gold), tagline, four social icons in white circles.
2. Shop: Fashion, Electronics, Beauty, Home & Living, Deals.
3. Customer Care: Contact, FAQ, Shipping, Returns.
4. Company: About, Privacy, Terms.
5. Subscribe: "Get the latest updates and exclusive offers.", then a dark pill input with a round `primary-strong` arrow button.

Column titles are white 13px 600. Links are white at 70%, 12px, hover `gold`. Bottom row above a hairline: "© {current year} Evael Store. All rights reserved." on the left, "Made for Ethiopia" with a flag on the right. The year is dynamic, do not hard-code 2025. Only link to routes that exist and social accounts that are real.

---

## 7. Desktop home page, top to bottom

Likely file for each section is in brackets. Confirm by reading the code.

| # | Section | Spec |
|---|---|---|
| 7.1 | Announcement bar | Section 6.1 |
| 7.2 | Header | Section 6.2 |
| 7.3 | Hero (`hero.tsx`) | Full-bleed, about 480px tall. Photo fills the right 60%. A cream gradient from the left keeps the text readable. Eyebrow "ETHIOPIA'S FAVORITE ONLINE MARKETPLACE". H1 on two lines: "Modern Shopping." in text colour, "Made for Ethiopia." in `gold-display`. Body: "Discover fashion, electronics, beauty, home essentials and more — all in one place." Buttons: `hero` "Shop Now →" and `outline-gold` "Explore Deals". Three carousel dots bottom-left, active one `primary`. Script flourish "Shop Local, Support Ethiopia" top-right over the photo. Auto-advance every 6s, pause on hover and focus, off under reduced motion. |
| 7.4 | Trust strip (`trust-section.tsx`) | `subtle` band, four equal cells with vertical dividers. Icon, then title (13px 600) and meta (12px). Fast Delivery / Addis Ababa. Secure Shopping / Your data is safe. Cash on Delivery / Pay when you receive. Made for Ethiopia / Local support & service. |
| 7.5 | Shop by Category (`category-section.tsx`) | Section heading with "View All Categories →". Seven tiles in one row, 3:4 portrait, the last is the Deals tile. |
| 7.6 | Trending Products (`product-grid-section.tsx`, `carousel-controls.tsx`) | Section heading with "View All →". Carousel of product cards, six visible at 1440px, `icon-circle` arrows centred outside the left and right edges. |
| 7.7 | Big Savings banner (`lifestyle-banner.tsx`) | 12px radius, about 130px tall, `primary-deep` on the left fading into the photo on the right, thin gold curved line as decoration. "BIG SAVINGS. EVERY DAY." in white display caps. "Up to 40% OFF" in `gold`, 24px 700. "selected products" in white at 85%. `gold` button "Shop Deals →". Use the real maximum discount, not a fixed 40%. |
| 7.8 | Flash Deals (`deals-countdown.tsx`, `deals-row.tsx`) | `primary-deepest` panel, 12px radius, 20px padding. Left column, about 240px: bolt icon in `sale`, "FLASH DEALS" in `gold` sans 800 caps 20px, "Limited-time prices. Don't miss out." in white. Countdown: three boxes (56px, slightly lighter burgundy, white 22px 700 tabular digits) with colons between and labels Hours, Minutes, Seconds under them. `gold` button "View All Deals →". Right: horizontal scroll of compact white product cards, four visible plus a peek, `icon-circle` next arrow on the right edge. Hide the whole section when no flash deal is active. |
| 7.9 | New Arrivals (`new-arrivals.tsx`) | Section heading with "View All →". Row of six image tiles (4:3, `subtle` well, heart top-right). Show name and price on hover or under the image, so a tile is never a mystery. |
| 7.10 | Built for Ethiopian Shoppers (`shop-by-need.tsx` or new) | White card, 12px radius, 1px border. Skyline image on the left fading into the card. Display heading "Built for Ethiopian Shoppers", sub "Your trusted local marketplace, designed for your needs." Then five icon items: Addis Ababa delivery / Fast & reliable. Cash on Delivery / Pay when you receive. Ethiopian payment options / Local & convenient. Local customer support / Here to help. Easy shopping experience / Simple & secure. |
| 7.11 | Pay Your Way (`payment-methods.tsx`) | Display heading "Pay Your Way", sub "Multiple payment options for your convenience." Two groups, each with a small label pill: "Available" in success colour, "Coming Soon" in secondary. Methods are white chips with logo and name. Which methods are live comes from the app's real configuration (see section 10). |
| 7.12 | Why Shop With Evael? and newsletter (`why-evael.tsx`, `newsletter.tsx`) | Left two thirds: display heading, then four bordered cards in a row, each icon, title and one line. Secure Shopping, Fast Delivery, Quality Products, Customer Support. Right third: newsletter card on `--evael-footer`, 12px radius, mail icon, "Get the best deals first.", one line of copy, email input joined to a `primary` "Subscribe" button, photo and script flourish on the right edge. |
| 7.13 | Footer | Section 6.5 |

`deal-popup.tsx` is not in the mockup. Restyle it with the new tokens and keep its behaviour.

---

## 8. Mobile screens (390px reference)

### 8.1 Home

1. Mobile header (section 6.3).
2. Hero (`mobile-home-carousel.tsx`, `mobile-home-slides.tsx`): about 240px tall, photo on the right, cream fade on the left. Eyebrow "MODERN SHOPPING." H1 "Made for" in text colour, "Ethiopia." in `gold-display`. Three lines of body. `hero` "Shop Now →" and `outline-gold` "Explore Deals" side by side. Dots bottom-left. Swipeable.
3. Trust row: four cells in one row with dividers, icon above a two-line 11px label.
4. Shop by Category: heading with "View All →", two-column grid of landscape category tiles.
5. The remaining desktop sections follow in the same order: trending as a horizontal snap rail, the savings banner stacked, flash deals with the countdown above a product rail, new arrivals as a rail, features as a two-column grid, payment chips wrapping, newsletter full width.
6. Bottom navigation.

### 8.2 Categories (`/categories`)

Plain header with a centred title "Categories". The first two categories are full-width tiles 120px tall. The next four form a two-by-two grid. Then a full-width Deals banner: `primary-deep`, gold shopping-bag icon, "Deals" in gold display, "Save More" in white, gold circle with an arrow on the right. With more categories, continue the two-column grid.

### 8.3 Category listing (`/category/[slug]`, also `/shop`, `/search`, `/deals`)

Header: back arrow, category name, then search and cart icons. Under it a horizontally scrolling row of filter chips (All, then the real sub-filters). Then a two-column grid of product cards. Keep the existing Sort and Filter bar and restyle it. Empty state: icon, one line of copy, a button back to all categories.

### 8.4 Product (`/product/[slug]`)

1. Image: full width, square, `subtle` well. Floating `icon-circle` back button top-left and wishlist top-right. Swipe between images.
2. Thumbnails: row of 48px squares, 8px radius. The selected one has a 2px `primary` border.
3. Title in display font. Rating row: star, "4.6", "(24 reviews)", then a category chip.
4. Price row: large price, old price, sale pill.
5. "Color: Burgundy" with swatches (only when variants exist).
6. Quantity stepper beside a wide `primary` "Add to Cart" button.
7. Two info cells: Delivery / Addis Ababa (1–2 days). Cash on Delivery / Available.
8. Tabs: Description, Specifications, Reviews.
9. Sticky bottom bar with a full-width `primary` "Buy Now" button, above the safe area. The bottom navigation is hidden on this screen.

Desktop product page (not in the mockup, extend the system): two columns. Gallery on the left with vertical thumbnails. Buy box on the right with the same order as steps 3 to 7, with "Add to Cart" and an outline "Buy Now". Tabs full width below, then a related products carousel.

### 8.5 Cart (`/cart`)

Header: back arrow, "Your Cart", trash icon (clear cart, with a confirm dialog). Item cards: white, 12px radius. 72px image on the left. Name, category, "Color: …", price with old price. Sale pill top-right, heart under it, quantity stepper at the bottom. Swipe or a remove button deletes with an undo toast.

Summary: "Subtotal (2 items)", "Delivery Fee", a divider, then "Total" in 16px 700. Full-width `primary` "Proceed to Checkout". Under it "We Accept" with payment chips and a "Coming Soon" group.

Empty cart: illustration or icon, "Your cart is empty", a `primary` "Start shopping" button.

Desktop cart: items in the left two thirds, a sticky summary card on the right.

### 8.6 Account (`/account`)

Profile row: 56px avatar, name (16px 600), email (secondary), chevron. Then list rows, 52px tall, outline icon on the left, label, chevron on the right, hairline dividers. Group 1: My Orders, Wishlist, Addresses, Payment Methods, Settings. Group 2: Help & Support, About Evael Store. Then a language row with a globe icon and a dropdown. Then a brand card with the skyline image, "Modern Shopping. Made for Ethiopia." in display font and the logo. Bottom navigation with Account active. Show only rows that lead to real pages. Signed-out state: a sign-in prompt card in place of the profile row.

---

## 9. Pages not in the mockup

Apply the same system to every other storefront route: `/checkout`, `/order`, `/orders`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth`, `/search`, `/shop`, `/deals`, `/delivery`, `/returns`, `/faq`, `/contact`, `/about`, `/privacy`, `/terms`, `not-found.tsx`, `error.tsx`, `global-error.tsx`.

- Page titles in display font, cream background, white cards with 12px radius.
- Forms: one column, 44px inputs, `primary` submit button, inline error text in `--evael-error`.
- Checkout: step indicator in burgundy, order summary card matching the cart summary.
- Orders: status pills (success, warning, error tokens), order cards matching cart item cards.
- Info pages: 680px reading column, display h1, sans body.
- 404 and error pages: display heading, one line of copy, `primary` button home.
- Update `icon.tsx`, `apple-icon.tsx` and `opengraph-image.tsx` to burgundy and gold.
- Update `/style-guide` to show the new tokens, type scale, buttons, product card and category tile. This page is the Phase 1 checkpoint.

---

## 10. Things in the mockup not to copy

The mockups are concept images and contain mistakes. Follow these instead.

| Mockup shows | Do this |
|---|---|
| White text on gold buttons | `primary-deepest` text on gold (section 2.3) |
| Apple and Nike logos on products in the hero and cards | Never draw or source third-party logos. Use the store's own photos |
| Men's Sneakers at 2,850 ETB on desktop and 2,950 ETB on mobile; bag at 23% off on the card and 22% in the cart | Prices and discounts come from the database, computed in one shared helper |
| Telebirr and CBE as "Coming Soon" on desktop but accepted in the mobile cart | One source of truth for payment methods, used in both places |
| "© 2025" | Current year |
| Smudged or unreadable small text in buttons and captions | Use the copy written in this spec |
| "120+ products" style counts | Real counts, or drop the line |
| Both "Add to Cart" and "Buy Now" on mobile product page | Keep both only if "Buy Now" (straight to checkout) exists or is approved. Otherwise the sticky bar holds "Add to Cart" |

---

## 11. Assets needed

Claude Code cannot produce the photographs. List what is missing in Phase 0 and use a neutral `subtle` gradient placeholder until the real files arrive. Do not pull stock photos without asking.

- Hero slides (desktop 2400 by 960, mobile 1170 by 720), subject on the right, calm left side for text
- One photo per category tile
- Big Savings banner photo
- Addis Ababa skyline (features strip and account brand card)
- Newsletter card photo
- Logo as SVG: full colour, and white with gold for dark backgrounds
- Payment method logos, used with permission

All images go through `next/image` with correct `sizes`, with `priority` on the first hero slide only, and meaningful alt text (empty alt for decoration).

---

## 12. States and motion

Every interactive element needs default, hover, focus-visible, active, disabled and loading states. Every data section needs loading (skeleton), empty and error states.

| Element | Trigger | Motion | Duration | Easing |
|---|---|---|---|---|
| Sections | Enter viewport | Existing `fade-up` | 400ms | existing |
| Product card | Hover | Shadow lift, image scale 1.03 | 200ms | ease-out |
| Category tile | Hover | Image scale 1.04 | 300ms | ease-out |
| Button | Press | Scale 0.98 | 100ms | ease-out |
| Wishlist heart | Toggle | Existing `pop` | 300ms | existing |
| Cart badge | Count changes | `pop` | 300ms | existing |
| Hero | Auto | Cross-fade | 500ms | ease-in-out |
| Countdown | Each second | Number swap, no animation | – | – |

Keep the reduced-motion rule in `globals.css` and the `MotionConfig` setup. The countdown must not announce every second to screen readers: `aria-live="off"`, with one readable label for the remaining time.

### Responsive

| Width | Behaviour |
|---|---|
| Under 640px | Mobile layouts from section 8, two-column product grid, bottom navigation |
| 640 to 1023px | Mobile header and bottom navigation, three-column product grid, four category tiles per row |
| 1024 to 1279px | Desktop header, four to five product cards per row, category tiles scroll horizontally |
| 1280px and up | Full desktop layout from section 7 |

Edge cases: product names up to 80 characters, Amharic strings about 30% longer than English, prices up to 7 digits, cart badge "99+", zero reviews, single-image products, no active deals, slow images (well colour shows first, no layout shift).

---

## 13. Phases

Work on branch `redesign/burgundy-gold`, one commit per phase, and stop for review after each.

| Phase | Work |
|---|---|
| 0 | Read-only audit. Deliver a table mapping every mockup section to an existing component, a list of features and data the mockup assumes that do not exist, a list of missing assets, and questions |
| 1 | Tokens, fonts, shadows, radii in `globals.css` and `layout.tsx`. Update `/style-guide` |
| 2 | UI primitives: button variants, badge and pills, input, chip, tabs, stepper, swatch, product card, category tile, section heading |
| 3 | Shell: announcement bar, desktop header, mobile header, bottom navigation, footer, icons and OG image |
| 4 | Home page, desktop and mobile |
| 5 | Categories, category listing, shop, search, deals |
| 6 | Product page, desktop and mobile |
| 7 | Cart, checkout, order confirmation, orders |
| 8 | Account, auth pages, info pages, 404 and error pages |
| 9 | Full QA pass |

---

## 14. Done when

- [ ] Typecheck, lint, Vitest and Playwright pass
- [ ] The axe audit passes on every storefront route
- [ ] The i18n and secrets check scripts pass
- [ ] No hex colour appears outside `globals.css` (grep to confirm)
- [ ] No orange from the old palette remains anywhere, including icons, OG image and emails
- [ ] Screenshots at 390px and 1440px match the mockups section by section, apart from the fixes in section 10
- [ ] Every screen is checked in English and Amharic
- [ ] Keyboard-only use works for header, carousels, product page and checkout
- [ ] No layout shift on the home page while images load
- [ ] No placeholder or invented data is left in the UI
