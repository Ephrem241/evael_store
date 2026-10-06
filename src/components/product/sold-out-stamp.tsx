import { cn } from "cn"

// A rubber-stamp "SOLD OUT" laid across the middle of a product photo. It is
// shown whenever the admin has marked the product sold out (stock 0). Plain
// markup, no hooks, so server and client components can both render it.
//
// Decorative: the sold-out state is already announced in text next to the
// photo (the Add to Cart button, the stock line), so screen readers skip it.
function SoldOutStamp({
  label,
  size = "sm",
  className,
}: {
  label: string
  size?: "sm" | "lg"
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-white/35",
        className
      )}
    >
      <span
        className={cn(
          "-rotate-12 rounded-md border-error bg-white/80 font-extrabold tracking-widest whitespace-nowrap text-error uppercase shadow-soft backdrop-blur-[1px]",
          size === "lg"
            ? "border-[6px] border-double px-6 py-2 text-3xl sm:text-4xl"
            : "border-4 border-double px-3 py-1 text-sm max-lg:px-2 max-lg:text-xs"
        )}
      >
        {label}
      </span>
    </div>
  )
}

export { SoldOutStamp }
