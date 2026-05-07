"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { getTodayInTimeZone } from "@/lib/date-utils"
import { parseISO, differenceInDays, format } from "date-fns"

function calculateLongestStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInDays(dates[i - 1], dates[i])
    if (diff === 1) {
      current++
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }

  return longest
}

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

      const uniqueDates = [...new Set(((completions || []) as { date: string }[]).map((c) => c.date))]
        .map((d) => parseISO(d))
        .sort((a, b) => b.getTime() - a.getTime())

      if (uniqueDates.length === 0) {
        return { currentStreak: 0, longestStreak: 0 }
      }

      const mostRecent = uniqueDates[0]
      const daysSinceMostRecent = differenceInDays(todayDate, mostRecent)

      if (daysSinceMostRecent > 1) {
        return { currentStreak: 0, longestStreak: calculateLongestStreak(uniqueDates) }
      }

      let currentStreak = 1
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = uniqueDates[i - 1]
        const currDate = uniqueDates[i]
        const diff = differenceInDays(prevDate, currDate)
        if (diff === 1) {
          currentStreak++
        } else {
          break
        }
      }

      const longestStreak = calculateLongestStreak(uniqueDates)

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
