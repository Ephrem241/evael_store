"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Image from "next/image"
import { Pause, Play } from "lucide-react"
import { cn } from "cn"

import { useT } from "@/lib/i18n/provider"
import { Container } from "@/components/layout/container"

const INTERVAL_MS = 6000
const SWIPE_PX = 40

export interface HeroPhoto {
  src: string
  /** CSS object-position: where the subject is, so phones keep it in frame. */
  position: string
}

// The hero's photographs behind the (server-rendered) copy: they cross-fade
// every 6 seconds. The words and buttons never change — only the picture —
// so the photos are decorative (empty alt).
//
// Stops while the pointer is over the hero or focus is inside it, for good
// once the shopper presses pause (WCAG 2.2.2), and never starts for anyone
// whose system asks for reduced motion. On touch screens a swipe moves to the
// next or previous photo. The dots (bottom left, under the text) jump to a
// photo; only the first photo is loaded eagerly.
function HeroSlideshow({
  photos,
  labelledBy,
  flourish,
  children,
}: {
  photos: HeroPhoto[]
  labelledBy: string
  /** The handwritten note over the photo (decorative, desktop only). */
  flourish: string
  children: ReactNode
}) {
  const t = useT()
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStart = useRef<number | null>(null)
  const many = photos.length > 1

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  const playing = many && !stopped && !reducedMotion && !hovered && !focused

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % photos.length), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [playing, photos.length])

  const go = (step: 1 | -1) => setIndex((i) => (i + step + photos.length) % photos.length)

  return (
    <section
      aria-labelledby={labelledBy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current
        const end = event.changedTouches[0]?.clientX
        touchStart.current = null
        if (!many || start == null || end == null || Math.abs(end - start) < SWIPE_PX) return
        go(end < start ? 1 : -1)
      }}
      className="relative isolate left-1/2 flex min-h-[300px] w-screen -translate-x-1/2 items-center overflow-hidden bg-background lg:min-h-[480px]"
    >
      {photos.map((photo, i) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt=""
          fill
          sizes="100vw"
          preload={i === 0}
          loading={i === 0 ? undefined : "lazy"}
          style={{ objectPosition: photo.position }}
          className={cn(
            "-z-20 object-cover transition-opacity duration-500 ease-in-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      {/* The cream rises from the left, so the words always sit on the page colour. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-background from-30% via-background/80 via-50% to-transparent to-75% lg:from-25% lg:via-background/70 lg:via-40% lg:to-60%"
      />
      <p
        aria-hidden
        className="pointer-events-none absolute top-10 right-[7%] hidden -rotate-6 font-script text-[2rem] leading-tight font-semibold text-brand-deep lg:block"
      >
        {flourish}
      </p>

      <Container className="py-8 lg:py-14">{children}</Container>

      {many && (
        <Container className="absolute inset-x-0 bottom-3 flex items-center gap-1 lg:bottom-6">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("home.hero.showPhoto", { index: i + 1, total: photos.length })}
              aria-current={i === index ? "true" : undefined}
              className="group flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden
                className={cn(
                  "block h-2 rounded-full transition-[width,background-color] duration-300",
                  i === index ? "w-5 bg-brand" : "w-2 bg-charcoal/25 group-hover:bg-charcoal/45"
                )}
              />
            </button>
          ))}
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setStopped((value) => !value)}
              aria-label={stopped ? t("home.hero.play") : t("home.hero.pause")}
              className="ml-1 flex size-6 items-center justify-center rounded-full text-charcoal/60 outline-none hover:text-charcoal focus-visible:ring-2 focus-visible:ring-ring"
            >
              {stopped ? <Play aria-hidden className="size-3" /> : <Pause aria-hidden className="size-3" />}
            </button>
          )}
        </Container>
      )}
    </section>
  )
}

export { HeroSlideshow }
