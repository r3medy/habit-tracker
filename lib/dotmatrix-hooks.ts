"use client"

import { useState, useCallback } from "react"

type DotMatrixPhase = "idle" | "collapse" | "hoverRipple" | "loadingRipple"

export function useDotMatrixPhases({
  animated,
  hoverAnimated,
  speed,
}: {
  animated: boolean
  hoverAnimated: boolean
  speed: number
}) {
  const [phase, setPhase] = useState<DotMatrixPhase>("idle")

  const onMouseEnter = useCallback(() => {
    if (hoverAnimated) setPhase("hoverRipple")
  }, [hoverAnimated])

  const onMouseLeave = useCallback(() => {
    if (hoverAnimated) setPhase("idle")
  }, [hoverAnimated])

  return { phase, onMouseEnter, onMouseLeave }
}

export function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useState(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      setReducedMotion(mq.matches)
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  })

  return reducedMotion
}
