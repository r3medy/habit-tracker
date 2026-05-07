"use client"

import { useMemo } from "react"
import { useHabits } from "@/hooks/use-habits"
import { useCompletionsRange } from "@/hooks/use-completions-range"
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

  // Fetch last 30 days for pie chart
  const last30Days = useMemo(() => getLastNDays(30, timezone), [timezone])
  const { completions: last30Completions, isLoading: last30Loading } = useCompletionsRange(last30Days, timezone)

  // Fetch last 7 days for weekly stats
  const last7Days = useMemo(() => getLastNDays(7, timezone), [timezone])
  const { completions: weeklyCompletions, isLoading: weeklyLoading } = useCompletionsRange(last7Days, timezone)

  // Fetch last 90 days for heatmap (balance performance/usefulness)
  const last90Days = useMemo(() => getLastNDays(90, timezone), [timezone])
  const { completions: heatmapRaw, isLoading: heatmapLoading } = useCompletionsRange(last90Days, timezone)
  const heatmapCompletions = useMemo(
    () => heatmapRaw.map((c) => ({ date: c.date, completed: c.completed })),
    [heatmapRaw]
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

  const isLoading = habitsLoading || goalsLoading || last30Loading || weeklyLoading || heatmapLoading

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
        isLoading={heatmapLoading}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CompletionPieChart
          completions={last30Completions}
          habits={habits || []}
          isLoading={last30Loading}
        />
        <WeeklyBarChart
          completions={last30Completions}
          habits={habits || []}
          isLoading={last30Loading}
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
