"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { getHabitStreakStats } from "@/lib/analytics-utils"
import { getTodayInTimeZone } from "@/lib/date-utils"
import type { HabitRow } from "@/lib/supabase/types"

export function useHabitStreakStats(
  habits: HabitRow[] | undefined,
  timezone: string
) {
  const habitIds = (habits || []).map((habit) => habit.id)
  const today = getTodayInTimeZone(timezone)

  const { data: streakStats = {}, isLoading } = useQuery({
    queryKey: ["habit-streak-stats", habitIds, today],
    queryFn: async () => {
      if (!habits || habits.length === 0) return {}

      const { data, error } = await supabase
        .from("completions")
        .select("habit_id, date, completed")
        .in("habit_id", habitIds)
        .lte("date", today)
        .eq("completed", true)
        .order("date", { ascending: false })

      if (error) throw error

      return getHabitStreakStats(
        (data || []) as {
          habit_id: string
          date: string
          completed: boolean
        }[],
        habits,
        today
      )
    },
    enabled: habitIds.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  return { streakStats, isLoading }
}
