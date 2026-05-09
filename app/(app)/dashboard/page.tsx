"use client"

import { useMemo } from "react"
import { useHabits } from "@/hooks/use-habits"
import { useCompletionsRange } from "@/hooks/use-completions-range"
import { useAllStreaks } from "@/hooks/use-all-streaks"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getLastNDays } from "@/lib/date-utils"
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
import { JournalSection } from "@/components/dashboard/journal-section"

export default function DashboardPage() {
  const { profile } = useUserProfile()
  const timezone = profile?.timezone || "UTC"

  const { habits, isLoading: habitsLoading } = useHabits()

  const last14Days = useMemo(() => getLastNDays(14, timezone), [timezone])
  const startDate = last14Days[0] || ""
  const endDate = last14Days[last14Days.length - 1] || ""

  const { completions: allCompletions, isLoading: chartLoading } =
    useCompletionsRange(startDate, endDate)

  // Weekly stats (last 7 days)
  const weeklyDays = useMemo(
    () => new Set(last14Days.slice(0, 7)),
    [last14Days]
  )
  const weeklyCompletions = useMemo(
    () => (allCompletions || []).filter((c) => weeklyDays.has(c.date)),
    [allCompletions, weeklyDays]
  )

  // Heatmap
  const heatmapCompletions = useMemo(
    () =>
      (allCompletions || []).map((c) => ({
        date: c.date,
        completed: c.completed,
      })),
    [allCompletions]
  )

  // Streaks
  const streaks = useAllStreaks(habits, timezone)

  const isLoading = habitsLoading || chartLoading

  // Stats calculations
  const weeklyProgress = useMemo(
    () => getWeeklyProgress(weeklyCompletions, habits?.length || 0),
    [weeklyCompletions, habits?.length]
  )
  const bestStreak = useMemo(() => getBestStreak(streaks), [streaks])
  const totalCompletions = useMemo(
    () => getTotalCompletions(heatmapCompletions),
    [heatmapCompletions]
  )
  const dailyAverage = useMemo(
    () => getDailyAverage([weeklyCompletions]),
    [weeklyCompletions]
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track your progress and stay motivated.
        </p>
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
          completions={allCompletions || []}
          habits={habits || []}
          isLoading={chartLoading}
        />
        <WeeklyBarChart
          completions={allCompletions || []}
          habits={habits || []}
          isLoading={chartLoading}
        />
      </div>

      <JournalSection />
    </div>
  )
}
