"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { getTodayInTimeZone } from "@/lib/date-utils"
import { parseISO } from "date-fns"

export function useStreaks(habitId: string, timezone: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["streaks", habitId],
    queryFn: async () => {
      const { data: completions, error } = await supabase
        .from("completions")
        .select("date, completed")
        .eq("habit_id", habitId)
        .eq("completed", true)
        .order("date", { ascending: false })

      if (error) throw error

      const today = getTodayInTimeZone(timezone)
      const todayDate = parseISO(today)
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      let lastDate: Date | null = null

      const sortedDates = ((completions || []) as { date: string }[])
        .map((c) => parseISO(c.date))
        .sort((a, b) => b.getTime() - a.getTime())

      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = sortedDates[i]

        if (lastDate === null) {
          const diff = Math.abs(currentDate.getTime() - todayDate.getTime())
          const diffDays = diff / (1000 * 60 * 60 * 24)
          if (diffDays > 1) {
            break
          }
          currentStreak = 1
          tempStreak = 1
          lastDate = currentDate
          continue
        }

        const diff = Math.abs(currentDate.getTime() - lastDate.getTime())
        const diffDays = diff / (1000 * 60 * 60 * 24)

        if (diffDays === 1) {
          tempStreak++
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
          }
          tempStreak = 1
        }

        lastDate = currentDate
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }

      if (currentStreak === 0 && sortedDates.length > 0) {
        const mostRecent = sortedDates[0]
        const diff = Math.abs(mostRecent.getTime() - todayDate.getTime())
        const diffDays = diff / (1000 * 60 * 60 * 24)
        if (diffDays <= 1) {
          currentStreak = tempStreak > 0 ? tempStreak : 1
        }
      }

      return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) }
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!habitId,
  })

  return {
    currentStreak: data?.currentStreak ?? 0,
    longestStreak: data?.longestStreak ?? 0,
    isLoading,
    error,
  }
}
