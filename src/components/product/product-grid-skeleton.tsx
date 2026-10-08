import { Skeleton } from "@/components/ui/skeleton"

// Shaped like ProductCard (photo, name, category, price, button), so nothing
// jumps when the real grid arrives.
function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <Skeleton className="mt-3 h-11 w-full rounded-(--radius-control) lg:h-10" />
      </div>
    </div>
  )
}

function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export { ProductGridSkeleton, ProductCardSkeleton }
