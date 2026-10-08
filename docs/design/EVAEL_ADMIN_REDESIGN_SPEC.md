# Evael Store admin redesign spec

Handoff spec for Claude Code. Companion to `EVAEL_REDESIGN_SPEC.md` (the storefront spec). This file replaces rule 7 of that spec ("leave `/admin` alone").

Reference image (put it in the repo before starting): `docs/design/admin-dashboard.png`

Run this after Phases 1 and 2 of the storefront spec, because the admin uses the same colour tokens, fonts and UI primitives.

---

## 0. Kickoff prompt (paste this into Claude Code)

```
Read docs/design/EVAEL_ADMIN_REDESIGN_SPEC.md fully, then look at
docs/design/admin-dashboard.png. We are redesigning the admin area to match.

Start in plan mode. Do Phase A0 only: read src/app/admin, src/components/admin
and src/lib/admin, map each part of the mockup to existing code, and list every
part of the mockup that needs a feature or database table we do not have. Show
me the plan and your questions before you change any file.

After I approve, work one phase at a time on the redesign/burgundy-gold branch.
At the end of each phase run typecheck, lint, unit tests and Playwright + axe,
take a screenshot at 1536px and 390px, compare with the mockup, commit, and
stop for my review.
```

---

## 1. What exists today and what the mockup adds

Current admin routes: Dashboard, Products, Categories, Orders, Customers, Homepage, Messages, Settings.
Current dashboard (`admin-dashboard-content.tsx`): four plain stat cards (today's sales, monthly sales, total orders, total customers), a low-stock list and a recent-orders list, fed by `computeDashboardStats`.

| Mockup element | Status | Action |
|---|---|---|
| Dark sidebar, top bar, page layout | Restyle | `admin-shell.tsx`, `admin-nav.tsx` |
| KPI cards with trend and sparkline | Data exists, logic is new | Extend `computeDashboardStats` |
| Sales Overview chart | Data exists, no chart library | Build from orders |
| Order Status donut | Data exists | Build from orders |
| Recent Orders table | Exists as a list | Turn into a table |
| Top Selling Products | Data exists if order items are stored | Build from order items |
| Low Stock Alert | Exists | Restyle |
| Recent Customers | Data exists | Build from profiles and orders |
| Quick Stats, Quick Actions | Partly | Show only real items |
| Notification bell | Exists (`order-alerts-bell.tsx`) | Restyle |
| Language switch | Exists | Restyle |
| Date range picker ("Last 7 days") | New | Build, client-side filter |
| Flash Deals list and "Create Flash Deal" panel | Check how deals are stored today | Likely a new feature, ask first |
| Coupons | Not in the app | New feature, ask first |
| Inventory page | Not in the app | New page, ask first |
| Analytics page | Not in the app | New page, ask first |
| Marketing menu | Not in the app | Ask what it should contain |
| Light/dark toggle | The `.dark` theme is not designed | Leave out until a dark theme is specified |
| Homepage and Messages | In the app, missing from the mockup | Keep both in the sidebar |

Rule: never show a menu item, card or number that has no real data behind it. If a feature is not approved, leave it out. No "coming soon" pages unless asked.

---

## 2. Ground rules

1. Keep all admin logic, hooks, schemas, Supabase queries and auth checks working. Restyle and extend, do not rewrite.
2. All colours come from tokens. All strings go through `useT()` with keys in every locale.
3. Every number comes from the database. The values in the mockup (128,450 ETB, 342 orders, the names, the dates) are placeholders.
4. New database tables or columns need a migration file and my approval before they are applied. Include row-level security so only admins can read and write.
5. Adding a dependency needs approval. The only one expected is a chart library.
6. The admin must work on a phone (section 8). The mockup shows desktop only.
7. WCAG AA stays. The axe audit must pass on admin pages too.

---

## 3. Admin tokens

Add to `:root` in `globals.css` and map the existing shadcn sidebar variables to them. Values are sampled from the mockup.

| Variable | Value | Use |
|---|---|---|
| `--sidebar` | `#2A0A10` | Sidebar background |
| `--sidebar-foreground` | `#FFFFFF` | Sidebar text and icons (sub-items at 75% opacity) |
| `--sidebar-accent` | `#5A161E` | Active and hover item background |
| `--sidebar-accent-foreground` | `#FFFFFF` | Active item text |
| `--sidebar-border` | `rgb(255 255 255 / 0.10)` | Dividers inside the sidebar |
| `--sidebar-primary` | `var(--evael-gold)` | Gold button in the sidebar |
| `--sidebar-primary-foreground` | `var(--evael-primary-deepest)` | Text on that button |
| `--sidebar-ring` | `var(--evael-gold)` | Focus ring on the dark sidebar |
| `--evael-admin-bg` | `var(--evael-subtle)` | Admin page background |
| `--chart-1` | `var(--evael-primary)` | Sales line, Shipped |
| `--chart-2` | `var(--evael-gold)` | Orders line, Pending |
| `--chart-3` | `#E0862E` | Processing |
| `--chart-4` | `#2F9E7E` | Delivered |
| `--chart-5` | `#8A8F98` | Cancelled |
| `--evael-info` | `#5430A2` | Purple accent for the fourth KPI icon |

Cards are `--card` (white) on the admin background, 1px `--border`, `--radius-card`, `--shadow-soft`.

Status pills: reuse the existing `OrderStatus` component and restyle it. Tinted background with dark text of the same hue, 4.5:1 minimum. The mockup's pale text on pale pills is too faint, do not copy it.

| Status | Background | Text |
|---|---|---|
| Pending | `--evael-subtle` | `--evael-text-secondary` |
| Processing | warning tint | `--evael-warning-text` |
| Shipped | success tint | `--evael-success` |
| Delivered | success tint | `--evael-success` |
| Cancelled | error tint | `--evael-error` |

Use the app's real status list if it differs.

---

## 4. Shell

### 4.1 Sidebar (`admin-nav.tsx`, `admin-shell.tsx`)

252px wide, full height, fixed, `--sidebar` background, scrolls on its own when the menu is long.

Top to bottom:

1. Logo: white wordmark, gold mark, "STORE" in tracked caps, tagline in 10px.
2. Menu. Each row is 44px tall, 8px radius, 20px outline icon, 14px 500 label, 12px side margin.
   - Active row: `--sidebar-accent` background, 600 weight, filled icon.
   - Hover: `--sidebar-accent` at 60%.
   - Groups have a chevron on the right and expand in place. Sub-items are indented 44px, 13px text, with a thin vertical guide line on the left. The open state is remembered.
3. Menu order: Dashboard. Products (All Products, Add Product, Categories, then Flash Deals and Inventory if approved). Orders. Customers. Messages. Homepage. Then Coupons, Analytics and Marketing if approved. Settings.
4. A "New" badge (pill, `--evael-sale` background, white 10px text) can mark a newly added item.
5. Promo card near the bottom: skyline photo on top, "Grow Your Business", "Manage your store, track sales and reach more customers.", gold button "View Insights →" linking to Analytics. Show it only if Analytics exists.
6. User block pinned to the bottom: 40px avatar, name, role ("Admin"), chevron opening a small menu.
7. Logout row with icon.

Keyboard: arrow keys move between rows, Enter opens a group, `aria-current="page"` on the active link, `aria-expanded` on groups.

### 4.2 Top bar

64px tall, admin background, 1px bottom border, sticky.

- Left: search input, max 620px, 44px tall, white, 10px radius, search icon inside, placeholder "Search products, orders, customers…". It searches those three and shows grouped results in a dropdown. If global search is out of scope, ask before building it.
- Right, in order: notification bell with a count badge (existing order alerts), language select with flag, today's date in the user's locale (real date), then nothing else. No theme toggle.

### 4.3 Page header

Display-font title, 28px ("Welcome back, {first name}!" on the dashboard, the page name elsewhere). One line of secondary text under it. On the right: page actions. On the dashboard that is the date range select: Today, Last 7 days, Last 30 days, This month.

---

## 5. Dashboard layout (1536px reference)

Main column plus a 290px right rail. 16px gaps.

```
[ KPI ] [ KPI ] [ KPI ] [ KPI ]            | Quick Actions
[ Sales Overview (60%) ] [ Order Status ]  | Recent Flash Deals
[ Recent Orders (60%)  ] [ Top Selling  ]  |
[ Low Stock ] [ Recent Customers ] [ Quick Stats ]
```

### 5.1 KPI cards

Four cards: Total Sales, Total Orders, New Customers, Total Products. Each: 40px round tinted icon on the left, label (13px secondary), value (24px 600, tabular numbers), a trend line ("↑ 12.5%" in success colour or "↓" in error colour, then "vs. last week" in 11px secondary), and a small sparkline bottom-right in the icon's colour.

- Icon tints in order: burgundy, gold, green, purple (`--evael-info`).
- The trend compares the selected range with the range before it. The label follows the range ("vs. previous 7 days"). With no earlier data, show "–" and no arrow.
- Total Products is a count, so its trend is products added in the range.
- Add `previousPeriod` values and daily series to `computeDashboardStats`, with unit tests.

### 5.2 Sales Overview

Card with title, legend on the right (Sales in `--chart-1`, Orders in `--chart-2`). Line chart, one point per day in the range, soft area fill under the sales line, light horizontal grid lines, y-axis in short form (10K, 20K), x-axis as short dates. Hover or focus on a point shows a tooltip card: date, "Sales: 42,350 ETB", "Orders: 87".

Sales and orders have very different scales. Use two y-axes (sales left, orders right), unlike the mockup, so the orders line is not flat.

### 5.3 Order Status

Donut chart, total in the centre ("342" in 22px 600, "Total Orders" under it). Legend on the right as a table: colour dot, status, count, percentage. Segment colours from section 3.

### 5.4 Recent Orders

Table, five rows, "View all →" link in the header. Columns: product thumbnail (36px, 8px radius), Order # (burgundy, 600, links to the order), Customer, Total, Status pill, Date, and a small outline "View" button. Header row is 12px secondary text. Row hover is `--evael-subtle`. Rows are 48px tall.

### 5.5 Top Selling Products

Five rows, "View All →". Each row: rank in a 24px circle (rank 1 in gold fill, others in subtle), 44px thumbnail, name, category, revenue in the range, discount pill if on sale, and a "⋮" menu (View, Edit). Rank is 1 to 5 in order. The "33" in the mockup is a typo.

### 5.6 Bottom row

- **Low Stock Alert**: warning triangle icon, title, "3 products are running low on stock." Then up to three products side by side: thumbnail, name, "Stock: 3" in warning text, outline "Restock" button that opens the product's stock field. Uses the existing low-stock data.
- **Recent Customers**: four rows. Avatar (initials if no photo), name, city, "Last order: 2 hours ago" on the right as relative time.
- **Quick Stats**: rows of icon, label and number. Total Products and Low Stock always. Active Flash Deals and Total Coupons only if those features exist.

### 5.7 Right rail

- **Quick Actions**: stacked 44px outline buttons with a burgundy icon on the left. Add New Product, View Orders, plus Create Flash Deal and Manage Coupons if approved.
- **Recent Flash Deals** (if approved): product thumbnail with discount pill, name, deal price and old price, and a countdown chip ("2d 6h 43m") with a clock icon.

### 5.8 States

- Loading: update `DashboardSkeleton` to match the new layout.
- Empty: each card has its own short empty message and, where useful, an action ("No orders yet").
- Error: keep the existing load-failed message, per card, with a retry button.
- Charts with a single data point show the number as text, not a one-dot chart.

---

## 6. Charts

The repo has no chart library. Preferred: `recharts`, loaded only in admin with `next/dynamic` so the storefront bundle does not grow. Ask before installing. Sparklines can be hand-written SVG.

- Colours come from the `--chart-*` tokens.
- Each chart has a text summary for screen readers and a visually hidden data table.
- Points are reachable with the keyboard, and the tooltip shows on focus.
- No animation under reduced motion.

---

## 7. Create Flash Deal panel (only if the feature is approved)

A side sheet from the right, 380px wide (full width on mobile), opened by the "Create Flash Deal" quick action or from the Flash Deals page. Header bar in `--evael-primary-deep`: bolt icon in gold, "Create Flash Deal" in white display font, close button. Focus is trapped while open and Escape closes it.

| Field | Control | Rules |
|---|---|---|
| Product | Search-select over products | Required |
| Discount Type | Two-option segmented control: Percentage (%) and Fixed Amount (ETB). Selected is burgundy fill with white text | Required |
| Discount Value | Number input with the unit on the right | Percentage 1 to 90. Fixed amount below the product price |
| Start Date & Time | Date-time picker | Required |
| End Date & Time | Date-time picker | After the start |
| Stock Limit (Optional) | Number input, helper text "Leave empty for no limit" | Whole number, 1 or more, not above current stock |

Below the fields, a live Product Preview: thumbnail, name, old price struck through, new price in burgundy with "(25% OFF)". Footer: outline "Cancel" and burgundy "Create Flash Deal", equal width. The submit button shows a spinner while saving, then a success toast (`sonner`) and the sheet closes.

Use React Hook Form and Zod like the other admin forms, with a `flash-deal-schema.ts` and tests. Times are stored in UTC and shown in Africa/Addis_Ababa time. A product can have only one active deal at a time. The storefront Flash Deals section and countdown must read from the same data.

---

## 8. Responsive

| Width | Behaviour |
|---|---|
| 1440px and up | Layout from section 5 |
| 1024 to 1439px | Right rail moves under the main column as a row of cards |
| 768 to 1023px | Sidebar collapses to a 64px icon rail with tooltips. KPI cards two per row. Two-column rows stack |
| Under 768px | Sidebar becomes a drawer opened by a menu button in the top bar. Search collapses to an icon. KPI cards two per row. Tables become stacked cards (order number, customer, total, status, date). Charts keep a 220px height and scroll if needed |

---

## 9. Other admin pages

Apply the same shell and components to Products, Product edit, Categories, Orders, Order detail, Customers, Messages, Message detail, Homepage and Settings.

- List pages: page header with a burgundy primary action on the right ("Add Product"), a filter row (search, status select), then a table in a white card with the same row style as Recent Orders, and pagination below.
- Forms: grouped into white cards with a 16px 600 section title, labels above inputs, 44px inputs, a sticky footer bar with Cancel and Save.
- Image upload fields: dashed border well, burgundy icon, thumbnails with a remove button.
- Detail pages: two columns, main content left, a summary card on the right.
- Destructive actions use the error colour and a confirm dialog.

---

## 10. Things in the mockup not to copy

| Mockup shows | Do this |
|---|---|
| Fixed numbers, names and "Apr 28, 2025" | Real data and today's date |
| Rank "33" in Top Selling | Ranks 1 to 5 |
| Two theme toggles in the top bar | None, until a dark theme is designed |
| Pale text on pale status pills | Dark text on tinted pills (section 3) |
| Sales and orders on one y-axis | Two y-axes |
| Menu without Homepage and Messages | Keep both |
| Coupons, Analytics, Marketing, Flash Deals, Inventory shown as if they exist | Only after approval, one at a time |

---

## 11. Phases

| Phase | Work |
|---|---|
| A0 | Read-only audit. Mapping table, missing features, proposed migrations, questions |
| A1 | Admin tokens, sidebar, top bar, page header, responsive shell |
| A2 | Dashboard built on existing data: KPI cards, both charts, Recent Orders, Top Selling, Low Stock, Recent Customers, Quick Stats, Quick Actions, date range |
| A3 | Restyle all existing admin pages (section 9) |
| A4 | Approved new features, one per commit, each with migration, admin page, tests and storefront wiring: Flash Deals, then Inventory, Coupons, Analytics, Marketing |

## 12. Done when

- [ ] Typecheck, lint, Vitest and Playwright + axe pass, admin routes included
- [ ] `check:i18n` passes and the admin is checked in English and Amharic
- [ ] Every number on the dashboard matches a manual query for the same range
- [ ] New stats logic in `src/lib/admin` has unit tests, including empty and single-day ranges
- [ ] The sidebar, sheet, tables and charts work with the keyboard only
- [ ] The admin is usable at 390px
- [ ] The chart library is not in the storefront bundle
- [ ] No menu item or card points at a feature that does not exist
- [ ] Non-admin users still cannot open any admin route or read admin data
