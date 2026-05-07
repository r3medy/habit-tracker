"use client"

import { useMemo } from "react"
import { useCompletions } from "./use-completions"
import type { CompletionRow } from "@/lib/supabase/types"

export function useCompletionsRange(dates: string[], timezone: string) {
  const results = dates.map((date) => useCompletions(date, timezone))

  const completions = useMemo(
    () => results.flatMap((r) => r.completions || []),
    [results]
  )

  const isLoading = results.some((r) => r.isLoading)
  const error = results.find((r) => r.error)?.error || null

  return { completions, isLoading, error }
}
