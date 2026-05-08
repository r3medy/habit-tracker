import { supabase } from "@/lib/supabase/client"
import {
  getTodayInTimeZone,
  hasDayChanged,
  getLastNDays,
} from "@/lib/date-utils"

const LAST_VISITED_KEY = "habit-tracker-last-visited"

export function getLastVisitedDate(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(LAST_VISITED_KEY)
}

export function setLastVisitedDate(date: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(LAST_VISITED_KEY, date)
}

export function checkAndResetIfNeeded(timezone: string): boolean {
  const lastVisited = getLastVisitedDate()
  const today = getTodayInTimeZone(timezone)

  if (hasDayChanged(lastVisited, timezone)) {
    setLastVisitedDate(today)
    return true
  }

  return false
}

export function setupAutoReset(
  timezone: string,
  onReset: () => void
): () => void {
  checkAndResetIfNeeded(timezone)

  const interval = setInterval(
    () => {
      const needsReset = checkAndResetIfNeeded(timezone)
      if (needsReset) {
        onReset()
      }
    },
    5 * 60 * 1000
  )

  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      const needsReset = checkAndResetIfNeeded(timezone)
      if (needsReset) {
        onReset()
      }
    }
  }

  document.addEventListener("visibilitychange", handleVisibility)

  return () => {
    clearInterval(interval)
    document.removeEventListener("visibilitychange", handleVisibility)
  }
}

export async function getTodayCompletions(timezone: string) {
  const today = getTodayInTimeZone(timezone)
  const { data, error } = await supabase
    .from("completions")
    .select("*")
    .eq("date", today)

  if (error) throw error
  return data
}
