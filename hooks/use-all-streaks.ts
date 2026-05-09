"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { getTodayInTimeZone } from "@/lib/date-utils"
import { parseISO, differenceInDays } from "date-fns"
import type { HabitRow } from "@/lib/supabase/types"

function calculateCurrentStreak(dates: Date[], today: Date): number {
  if (dates.length === 0) return 0

  // dates are sorted descending (newest first)
  const daysSinceMostRecent = differenceInDays(today, dates[0])
  if (daysSinceMostRecent > 1) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInDays(dates[i - 1], dates[i])
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function useAllStreaks(
  habits: HabitRow[] | undefined,
  timezone: string
) {
  const habitIds = (habits || []).map((h) => h.id)

  const { data: streaks = {} } = useQuery({
    queryKey: ["streaks", habitIds],
    queryFn: async () => {
      if (habitIds.length === 0) return {}

      const { data: completions, error } = await supabase
        .from("completions")
        .select("habit_id, date")
        .in("habit_id", habitIds)
        .eq("completed", true)
        .order("date", { ascending: false })

      if (error) throw error

      const today = parseISO(getTodayInTimeZone(timezone))
      const rows = (completions || []) as { habit_id: string; date: string }[]

      const datesByHabit = new Map<string, Date[]>()
      for (const c of rows) {
        if (!datesByHabit.has(c.habit_id)) {
          datesByHabit.set(c.habit_id, [])
        }
        datesByHabit.get(c.habit_id)!.push(parseISO(c.date))
      }

      const result: Record<string, number> = {}
      for (const id of habitIds) {
        const dates = datesByHabit.get(id) || []
        const unique = [...new Set(dates.map((d) => d.getTime()))]
          .sort((a, b) => b - a)
          .map((t) => new Date(t))
        result[id] = calculateCurrentStreak(unique, today)
      }

      return result
    },
    staleTime: 1000 * 60 * 5,
    enabled: habitIds.length > 0,
  })

  return streaks
}
