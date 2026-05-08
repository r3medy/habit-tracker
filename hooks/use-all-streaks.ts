"use client"

import { useStreaks } from "@/hooks/use-streaks"
import type { HabitRow } from "@/lib/supabase/types"

export function useAllStreaks(habits: HabitRow[] | undefined, timezone: string) {
  const habit0 = habits?.[0]
  const habit1 = habits?.[1]
  const habit2 = habits?.[2]
  const habit3 = habits?.[3]
  const habit4 = habits?.[4]

  const s0 = useStreaks(habit0?.id || "", timezone)
  const s1 = useStreaks(habit1?.id || "", timezone)
  const s2 = useStreaks(habit2?.id || "", timezone)
  const s3 = useStreaks(habit3?.id || "", timezone)
  const s4 = useStreaks(habit4?.id || "", timezone)

  const streaks: Record<string, number> = {}
  if (habit0) streaks[habit0.id] = s0.longestStreak
  if (habit1) streaks[habit1.id] = s1.longestStreak
  if (habit2) streaks[habit2.id] = s2.longestStreak
  if (habit3) streaks[habit3.id] = s3.longestStreak
  if (habit4) streaks[habit4.id] = s4.longestStreak

  return streaks
}
