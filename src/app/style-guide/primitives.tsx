"use client"

// The style guide's interactive primitives (see page.tsx): every button
// variant and state, inputs, pills, chips, tabs, the stepper, info cells,
// skeletons and the overlays.

import { useState, type ReactNode } from "react"
import { ArrowRight, Banknote, ChevronLeft, ChevronRight, Heart, ShoppingCart, Truck } from "lucide-react"
import { toast } from "sonner"

import { useT } from "@/lib/i18n/provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Chip } from "@/components/ui/chip"
import { InfoCell } from "@/components/ui/info-cell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DiscountBadge } from "@/components/product/discount-badge"
import { QuantitySelector } from "@/components/product/quantity-selector"
import { ProductCardSkeleton } from "@/components/product/product-grid-skeleton"

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="type-section text-charcoal">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, children, dark = false }: { label: string; children: ReactNode; dark?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-xs text-muted-text">{label}</p>
      <div className={dark ? "flex flex-wrap items-center gap-3 rounded-card bg-brand-deepest p-4" : "flex flex-wrap items-center gap-3"}>
        {children}
      </div>
    </div>
  )
}

export function Primitives({ sample }: { sample?: { price: number; compareAtPrice: number | null } }) {
  const t = useT()
  const [quantity, setQuantity] = useState(1)
  const [chip, setChip] = useState("all")
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-16">
      <Group title="Buttons">
        <Row label="primary (default) · hero · outline-gold">
          <Button>
            <ShoppingCart aria-hidden />
            Add to Cart
          </Button>
          <Button variant="hero">
            Shop Now
            <ArrowRight aria-hidden />
          </Button>
          <Button variant="outline-gold">Explore Deals</Button>
        </Row>
        <Row label="gold (on primary-deepest)" dark>
          <Button variant="gold">
            View All Deals
            <ArrowRight aria-hidden />
          </Button>
        </Row>
        <Row label="icon-circle · ghost-link">
          <Button variant="icon-circle" aria-label="Previous">
            <ChevronLeft />
          </Button>
          <Button variant="icon-circle" aria-label="Next">
            <ChevronRight />
          </Button>
          <Button variant="icon-circle" aria-label="Save">
            <Heart />
          </Button>
          <Button variant="ghost-link">
            View All
            <ArrowRight aria-hidden className="size-3.5" />
          </Button>
        </Row>
        <Row label="outline · soft · secondary · ghost · destructive · link">
          <Button variant="outline">Outline</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Row>
        <Row label="sizes · disabled · loading (click)">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 1500)
            }}
          >
            Proceed to Checkout
          </Button>
        </Row>
      </Group>

      <Group title="Inputs">
        <div className="grid max-w-xl gap-3">
          <Input placeholder="Search for products, brands and more…" aria-label="Search" />
          <Input placeholder="Invalid field" aria-label="Invalid field" aria-invalid />
          <Textarea placeholder="Message" aria-label="Message" />
        </div>
      </Group>

      <Group title="Pills">
        <Row label="discount (card) · sale (product page, cart)">
          {sample ? (
            <>
              <DiscountBadge price={sample.price} compareAtPrice={sample.compareAtPrice} t={t} />
              <DiscountBadge price={sample.price} compareAtPrice={sample.compareAtPrice} t={t} variant="sale" />
            </>
          ) : (
            <p className="text-sm text-muted-text">No discounted product in the catalogue.</p>
          )}
        </Row>
      </Group>

      <Group title="Filter chips">
        <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
          {["all", "On sale", "In stock", "Under 500 ETB"].map((label) => (
            <Chip key={label} selected={chip === label} aria-pressed={chip === label} onClick={() => setChip(label)}>
              {label === "all" ? "All" : label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Tabs">
        <Tabs defaultValue="description" className="max-w-xl">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="text-sm text-muted-text">Description panel.</TabsContent>
          <TabsContent value="specifications" className="text-sm text-muted-text">Specifications panel.</TabsContent>
          <TabsContent value="reviews" className="text-sm text-muted-text">Reviews panel.</TabsContent>
        </Tabs>
      </Group>

      <Group title="Stepper and info cells">
        <div className="flex flex-wrap items-center gap-4">
          <QuantitySelector value={quantity} onChange={setQuantity} max={5} />
          <InfoCell icon={Truck} title="Delivery" detail="Fee shown at checkout" className="w-56" />
          <InfoCell icon={Banknote} title="Cash on Delivery" detail="Available" className="w-56" />
        </div>
      </Group>

      <Group title="Skeletons">
        <div className="grid max-w-xl grid-cols-2 gap-3">
          <ProductCardSkeleton />
          <div className="space-y-2">
            <Skeleton className="h-28 w-full rounded-card" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </Group>

      <Group title="Modal, drawer and toast">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear your cart?</DialogTitle>
                <DialogDescription>Every item will be removed.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>Clear cart</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open drawer</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Price, availability, offers.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Button variant="outline" onClick={() => toast.success("Added to your cart.")}>
            Fire toast
          </Button>
        </div>
      </Group>
    </div>
  )
}
