"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { getBestPerfectDayStreak } from "@/lib/analytics-utils"
import { getTodayInTimeZone } from "@/lib/date-utils"
import type { HabitRow } from "@/lib/supabase/types"

export function usePerfectDayStreak(
  habits: HabitRow[] | undefined,
  timezone: string
) {
  const habitIds = (habits || []).map((habit) => habit.id)
  const today = getTodayInTimeZone(timezone)

  const { data: bestStreak = 0, isLoading } = useQuery({
    queryKey: ["perfect-day-streak", habitIds, today],
    queryFn: async () => {
      if (!habits || habits.length === 0) return 0

      const { data, error } = await supabase
        .from("completions")
        .select("habit_id, date, completed")
        .in("habit_id", habitIds)
        .lte("date", today)
        .order("date", { ascending: true })

      if (error) throw error

      return getBestPerfectDayStreak(
        (data || []) as {
          habit_id: string
          date: string
          completed: boolean
        }[],
        habits
      )
    },
    enabled: habitIds.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  return { bestStreak, isLoading }
}
