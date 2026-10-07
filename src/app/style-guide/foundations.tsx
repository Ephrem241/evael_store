"use client"

// The style guide's first half: colours, type, shape (see page.tsx).

import { useSyncExternalStore, type ReactNode } from "react"

// Each swatch is a token from globals.css; its value is read from the page at
// runtime, so this file never repeats (and never drifts from) the palette.
const palette: { group: string; swatches: { name: string; token: string; className: string }[] }[] = [
  {
    group: "Neutrals",
    swatches: [
      { name: "Background", token: "--evael-background", className: "bg-background" },
      { name: "Surface", token: "--evael-surface", className: "bg-surface" },
      { name: "Subtle", token: "--evael-subtle", className: "bg-subtle" },
      { name: "Border", token: "--evael-border", className: "bg-border" },
      { name: "Text", token: "--evael-text", className: "bg-charcoal" },
      { name: "Secondary text", token: "--evael-text-secondary", className: "bg-muted-text" },
    ],
  },
  {
    group: "Burgundy",
    swatches: [
      { name: "Primary", token: "--evael-primary", className: "bg-brand" },
      { name: "Primary strong", token: "--evael-primary-strong", className: "bg-brand-strong" },
      { name: "Primary dark", token: "--evael-primary-dark", className: "bg-brand-deep" },
      { name: "Primary deep (banner)", token: "--evael-primary-deep", className: "bg-brand-banner" },
      { name: "Primary deepest", token: "--evael-primary-deepest", className: "bg-brand-deepest" },
      { name: "Primary ink (text)", token: "--evael-primary-ink", className: "bg-brand-ink" },
      { name: "Primary soft", token: "--evael-primary-soft", className: "bg-brand-soft" },
    ],
  },
  {
    group: "Gold",
    swatches: [
      { name: "Gold", token: "--evael-gold", className: "bg-gold" },
      { name: "Gold display (24px+)", token: "--evael-gold-display", className: "bg-gold-display" },
      { name: "Gold ink (text)", token: "--evael-gold-ink", className: "bg-gold-ink" },
      { name: "Gold border", token: "--evael-gold-border", className: "bg-gold-border" },
    ],
  },
  {
    group: "Status and accents",
    swatches: [
      { name: "Sale", token: "--evael-sale", className: "bg-sale" },
      { name: "Star (icons only)", token: "--evael-star", className: "bg-star" },
      { name: "Success", token: "--evael-success", className: "bg-success" },
      { name: "Warning", token: "--evael-warning", className: "bg-warning" },
      { name: "Warning text", token: "--evael-warning-text", className: "bg-warning-text" },
      { name: "Error", token: "--evael-error", className: "bg-error" },
      { name: "Footer", token: "--evael-footer", className: "bg-footer" },
      { name: "Input border", token: "--input", className: "bg-input" },
    ],
  },
]

// The pairings section 2.3 of the spec allows, each drawn as it will be used.
const pairings: { label: string; className: string }[] = [
  { label: "White on primary", className: "bg-brand text-white" },
  { label: "White on primary strong", className: "bg-brand-strong text-white" },
  { label: "White on primary dark", className: "bg-brand-deep text-white" },
  { label: "Gold on primary deep", className: "bg-brand-banner text-gold" },
  { label: "Gold on primary deepest", className: "bg-brand-deepest text-gold" },
  { label: "Deepest on gold (gold button)", className: "bg-gold text-brand-deepest" },
  { label: "Gold on footer", className: "bg-footer text-gold" },
  { label: "White on sale", className: "bg-sale text-white" },
  { label: "Gold ink on surface (small)", className: "bg-surface text-gold-ink border border-border" },
  { label: "Secondary on subtle", className: "bg-subtle text-muted-text" },
  { label: "Ink on primary soft", className: "bg-brand-soft text-brand-ink" },
]

const radii: { name: string; className: string }[] = [
  { name: "Card · 12px", className: "rounded-card" },
  { name: "Image · 10px", className: "rounded-image" },
  { name: "Hero / panel · 12px", className: "rounded-hero" },
  { name: "Control · 8px", className: "rounded-control" },
  { name: "Pill", className: "rounded-full" },
]

// The tokens never change while the page is open, so there is nothing to subscribe to.
const subscribeNever = () => () => {}

function TokenValue({ token }: { token: string }) {
  const value = useSyncExternalStore(
    subscribeNever,
    () => getComputedStyle(document.documentElement).getPropertyValue(token).trim().toUpperCase(),
    () => ""
  )
  return (
    <span className="font-mono text-xs text-muted-text">
      {token} {value && `· ${value}`}
    </span>
  )
}

function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-[180px_1fr] sm:items-baseline sm:gap-6">
      <span className="font-mono text-xs text-muted-text">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function Foundations() {
  return (
    <div className="space-y-16">
      <header className="space-y-2">
        <p className="type-eyebrow text-gold-ink">Evael Store design system</p>
        <h1 className="type-section text-charcoal">Burgundy and gold: style guide</h1>
        <p className="max-w-2xl text-muted-text">
          Developer reference for the redesign (docs/design/EVAEL_REDESIGN_SPEC.md). Every colour below is a
          token in globals.css; the value shown is read from the page.
        </p>
      </header>

      <section className="space-y-8">
        <h2 className="type-section text-charcoal">Colours</h2>
        {palette.map((group) => (
          <div key={group.group} className="space-y-3">
            <h3 className="type-eyebrow text-muted-text">{group.group}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {group.swatches.map((s) => (
                <div key={s.token} className="space-y-1.5">
                  <div className={`h-16 rounded-card border border-border ${s.className}`} />
                  <div className="text-sm font-medium text-charcoal">{s.name}</div>
                  <TokenValue token={s.token} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="type-section text-charcoal">Allowed pairings</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pairings.map((p) => (
            <div key={p.label} className={`rounded-card px-4 py-3 text-sm font-semibold ${p.className}`}>
              {p.label}
            </div>
          ))}
          <div className="rounded-card border border-border bg-background px-4 py-3">
            <p className="font-display text-2xl font-bold text-gold-display">Made for Ethiopia.</p>
            <p className="text-xs text-muted-text">Gold display on cream: 24px+ bold only</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="type-section text-charcoal">Type scale</h2>
        <div className="space-y-4">
          <Specimen label="type-hero · 60 / 36">
            <p className="type-hero text-charcoal">Modern Shopping.</p>
            <p className="type-hero text-gold-display">Made for Ethiopia.</p>
          </Specimen>
          <Specimen label="type-banner · 32 / 24">
            <p className="type-banner text-charcoal">Big savings. Every day.</p>
          </Specimen>
          <Specimen label="type-section · 26 / 20">
            <p className="type-section text-charcoal">Trending Products</p>
          </Specimen>
          <Specimen label="type-product-title · 28 / 22">
            <p className="type-product-title text-charcoal">Premium Ceramic Table Lamp with Elegant Pattern Shade</p>
          </Specimen>
          <Specimen label="type-eyebrow · 12 / 11">
            <p className="type-eyebrow text-charcoal">Your online marketplace in Ethiopia</p>
          </Specimen>
          <Specimen label="body · 16 / 14">
            <p className="text-sm leading-[1.55] text-charcoal lg:text-base">
              Discover fashion, electronics, beauty, home essentials and more — all in one place.
            </p>
          </Specimen>
          <Specimen label="card title · 14 / 500">
            <p className="truncate text-sm font-medium text-charcoal">
              1pc DIY Ice Cube Mold Set, Includes Storage Box And Ice Scoop, Reusable Ice Cube Mold
            </p>
          </Specimen>
          <Specimen label="meta · 12">
            <p className="text-xs text-muted-text">Kitchen</p>
          </Specimen>
          <Specimen label="type-price / type-old-price">
            <p className="flex items-baseline gap-2">
              <span className="type-price text-brand-ink">1,850 ETB</span>
              <span className="type-old-price text-muted-text">2,400 ETB</span>
            </p>
          </Specimen>
          <Specimen label="type-price-lg · 28 / 24">
            <p className="type-price-lg text-brand-ink">18,050 ETB</p>
          </Specimen>
          <Specimen label="button · 14 / 600">
            <p className="text-sm font-semibold text-charcoal">Add to Cart</p>
          </Specimen>
          <Specimen label="script (lg+, decorative)">
            <p className="font-script text-3xl font-semibold text-gold-display">Shop Local, Support Ethiopia</p>
          </Specimen>
          <Specimen label="Amharic in display">
            <p className="type-hero text-charcoal">ዘመናዊ ግብይት።</p>
            <p className="type-section text-charcoal">በመታየት ላይ ያሉ ምርቶች</p>
          </Specimen>
          <Specimen label="Amharic body">
            <p className="text-sm leading-[1.55] text-charcoal lg:text-base">
              ፋሽን፣ ኤሌክትሮኒክስ፣ የውበት ምርቶች፣ የቤት ቁሳቁሶች እና ሌሎችንም — ሁሉንም በአንድ ቦታ ያግኙ።
            </p>
          </Specimen>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="type-section text-charcoal">Shape and shadow</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {radii.map((r) => (
            <div key={r.name} className="space-y-1.5">
              <div className={`h-16 border border-border bg-surface shadow-soft ${r.className}`} />
              <p className="text-xs text-muted-text">{r.name}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-card border border-border bg-surface p-6 text-sm text-charcoal shadow-soft">shadow-soft (rest)</div>
          <div className="rounded-card border border-border bg-surface p-6 text-sm text-charcoal shadow-lift">shadow-lift (hover)</div>
        </div>
      </section>
    </div>
  )
}
