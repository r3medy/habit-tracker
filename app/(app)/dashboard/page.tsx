"use client"

import { useMemo } from "react"
import { useHabits } from "@/hooks/use-habits"
import { useCompletions } from "@/hooks/use-completions"
import { useStreaks } from "@/hooks/use-streaks"
import { useGoals } from "@/hooks/use-goals"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getTodayInTimeZone, getLastNDays } from "@/lib/date-utils"
import {
  getWeeklyProgress,
  getBestStreak,
  getTotalCompletions,
  getDailyAverage,
} from "@/lib/analytics-utils"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { HeatmapView } from "@/components/dashboard/heatmap-view"
import { CompletionPieChart } from "@/components/dashboard/completion-pie-chart"
import { WeeklyBarChart } from "@/components/dashboard/weekly-bar-chart"
import { GoalsSection } from "@/components/dashboard/goals-section"
import { JournalSection } from "@/components/dashboard/journal-section"

export default function DashboardPage() {
  const { profile } = useUserProfile()
  const timezone = profile?.timezone || "UTC"

  const { habits, isLoading: habitsLoading } = useHabits()
  const { goals, isLoading: goalsLoading } = useGoals()

  // Fetch last 14 days for charts and stats
  const last14Days = useMemo(() => getLastNDays(14, timezone), [timezone])
  const d0 = useCompletions(last14Days[0] || "", timezone)
  const d1 = useCompletions(last14Days[1] || "", timezone)
  const d2 = useCompletions(last14Days[2] || "", timezone)
  const d3 = useCompletions(last14Days[3] || "", timezone)
  const d4 = useCompletions(last14Days[4] || "", timezone)
  const d5 = useCompletions(last14Days[5] || "", timezone)
  const d6 = useCompletions(last14Days[6] || "", timezone)
  const d7 = useCompletions(last14Days[7] || "", timezone)
  const d8 = useCompletions(last14Days[8] || "", timezone)
  const d9 = useCompletions(last14Days[9] || "", timezone)
  const d10 = useCompletions(last14Days[10] || "", timezone)
  const d11 = useCompletions(last14Days[11] || "", timezone)
  const d12 = useCompletions(last14Days[12] || "", timezone)
  const d13 = useCompletions(last14Days[13] || "", timezone)

  const allDays = [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13]
  const allCompletions = useMemo(
    () => allDays.flatMap((d) => d.completions || []),
    [allDays]
  )
  const chartLoading = allDays.some((d) => d.isLoading)

  // Weekly stats (last 7 days)
  const weeklyCompletions = useMemo(
    () => allDays.slice(0, 7).flatMap((d) => d.completions || []),
    [allDays]
  )

  // Heatmap (last 14 days for now, expandable later)
  const heatmapCompletions = useMemo(
    () => allDays.map((d) => (d.completions || []).map((c) => ({ date: c.date, completed: c.completed }))).flat(),
    [allDays]
  )

  // Streaks
  const streaks: Record<string, number> = {}
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

  if (habit0) streaks[habit0.id] = s0.longestStreak
  if (habit1) streaks[habit1.id] = s1.longestStreak
  if (habit2) streaks[habit2.id] = s2.longestStreak
  if (habit3) streaks[habit3.id] = s3.longestStreak
  if (habit4) streaks[habit4.id] = s4.longestStreak

  const isLoading = habitsLoading || goalsLoading || chartLoading

  // Stats calculations
  const weeklyProgress = useMemo(
    () => getWeeklyProgress(weeklyCompletions, habits?.length || 0),
    [weeklyCompletions, habits?.length]
  )
  const bestStreak = useMemo(() => getBestStreak(streaks), [streaks])
  const totalCompletions = useMemo(() => getTotalCompletions(heatmapCompletions), [heatmapCompletions])
  const dailyAverage = useMemo(() => getDailyAverage([weeklyCompletions]), [weeklyCompletions])

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Track your progress and stay motivated.</p>
      </div>

      <StatsOverview
        weeklyProgress={weeklyProgress}
        bestStreak={bestStreak}
        activeHabits={habits?.length || 0}
        totalHabits={habits?.length || 0}
        totalCompletions={totalCompletions}
        dailyAverage={dailyAverage}
        isLoading={isLoading}
      />

      <HeatmapView
        completions={heatmapCompletions}
        timezone={timezone}
        isLoading={chartLoading}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CompletionPieChart
          completions={allCompletions}
          habits={habits || []}
          isLoading={chartLoading}
        />
        <WeeklyBarChart
          completions={allCompletions}
          habits={habits || []}
          isLoading={chartLoading}
        />
      </div>

      <GoalsSection
        goals={goals || []}
        habits={habits || []}
        streaks={streaks}
        isLoading={goalsLoading}
      />

      <JournalSection />
    </div>
  )
}
