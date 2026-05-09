"use client"

import { useMemo } from "react"
import { useHabits } from "@/hooks/use-habits"
import { useCompletionsRange } from "@/hooks/use-completions-range"
import { useHabitStreakStats } from "@/hooks/use-habit-streak-stats"
import { usePerfectDayStreak } from "@/hooks/use-perfect-day-streak"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getLastNDays } from "@/lib/date-utils"
import {
  getScheduledProgress,
  getTotalCompletions,
  getDailyAverage,
} from "@/lib/analytics-utils"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { HeatmapView } from "@/components/dashboard/heatmap-view"
import { CompletionPieChart } from "@/components/dashboard/completion-pie-chart"
import { WeeklyBarChart } from "@/components/dashboard/weekly-bar-chart"
import { HabitStreaksTable } from "@/components/dashboard/habit-streaks-table"
import { JournalSection } from "@/components/dashboard/journal-section"

export default function DashboardPage() {
  const { profile } = useUserProfile()
  const timezone = profile?.timezone || "UTC"

  const { habits, isLoading: habitsLoading } = useHabits()

  const heatmapDays = useMemo(() => getLastNDays(365, timezone), [timezone])
  const startDate = heatmapDays[0] || ""
  const endDate = heatmapDays[heatmapDays.length - 1] || ""

  const { completions: allCompletions, isLoading: chartLoading } =
    useCompletionsRange(startDate, endDate)

  const last14Days = useMemo(() => heatmapDays.slice(-14), [heatmapDays])

  // Weekly stats (last 7 days)
  const last7Days = useMemo(() => last14Days.slice(-7), [last14Days])
  const weeklyDays = useMemo(() => new Set(last7Days), [last7Days])
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
  const last14Completions = useMemo(
    () => (allCompletions || []).filter((c) => last14Days.includes(c.date)),
    [allCompletions, last14Days]
  )

  // Streaks
  const { bestStreak, isLoading: streakLoading } = usePerfectDayStreak(
    habits,
    timezone
  )
  const { streakStats, isLoading: habitStreaksLoading } = useHabitStreakStats(
    habits,
    timezone
  )

  const isLoading = habitsLoading || chartLoading || streakLoading

  // Stats calculations
  const weeklyProgress = useMemo(
    () => getScheduledProgress(weeklyCompletions, habits || [], last7Days),
    [weeklyCompletions, habits, last7Days]
  )
  const totalCompletions = useMemo(
    () => getTotalCompletions(last14Completions),
    [last14Completions]
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

      <HabitStreaksTable
        habits={habits || []}
        streakStats={streakStats}
        isLoading={habitsLoading || habitStreaksLoading}
      />

      <JournalSection />
    </div>
  )
}
