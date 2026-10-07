import { cn } from "cn"

// The Ethiopian flag, small and decorative (it sits beside the words "Made for
// Ethiopia", which say it): green, yellow and red bands with the blue disc and
// yellow star. Drawn inline because a flag emoji shows as the letters "ET" on
// Windows. The colours are tokens in globals.css.
function EthiopiaFlag({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 12" className={cn("h-3 w-6 shrink-0 rounded-[2px]", className)}>
      <rect width="24" height="4" className="fill-flag-green" />
      <rect y="4" width="24" height="4" className="fill-flag-yellow" />
      <rect y="8" width="24" height="4" className="fill-flag-red" />
      <circle cx="12" cy="6" r="3.3" className="fill-flag-blue" />
      <polygon
        points="12.00,3.40 12.62,5.15 14.47,5.20 13.00,6.32 13.53,8.10 12.00,7.05 10.47,8.10 11.00,6.32 9.53,5.20 11.38,5.15"
        className="fill-flag-yellow"
      />
    </svg>
  )
}

export { EthiopiaFlag }
