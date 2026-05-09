"use client"

import { createElement } from "react"
import { getHabitColor, getHabitIcon } from "@/lib/habit-utils"
import { formatStreak } from "@/lib/date-utils"
import type { HabitStreakStat } from "@/lib/analytics-utils"
import type { HabitRow } from "@/lib/supabase/types"

interface HabitStreaksTableProps {
  habits: HabitRow[]
  streakStats: Record<string, HabitStreakStat>
  isLoading: boolean
}

export function HabitStreaksTable({
  habits,
  streakStats,
  isLoading,
}: HabitStreaksTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-muted bg-background p-4">
        <div className="mb-4 h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="rounded-lg border border-muted bg-background p-8 text-center">
        <p className="text-sm text-muted-foreground">No habit streaks yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add habits to start tracking streaks.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-muted bg-background p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium">Habit streaks</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Current and all-time best streak by habit
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-muted text-left text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Habit</th>
              <th className="pb-2 text-right font-medium">Current</th>
              <th className="pb-2 text-right font-medium">Longest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted/50">
            {habits.map((habit) => {
              const color = getHabitColor(habit.color)
              const Icon = getHabitIcon(habit.icon)
              const stats = streakStats[habit.id] || {
                currentStreak: 0,
                longestStreak: 0,
              }

              return (
                <tr key={habit.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        {createElement(Icon, {
                          className: "size-4",
                          style: { color },
                        })}
                      </div>
                      <span className="max-w-[14rem] truncate font-medium">
                        {habit.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-muted-foreground tabular-nums">
                    {formatStreak(stats.currentStreak)}
                  </td>
                  <td className="py-3 text-right font-medium tabular-nums">
                    {formatStreak(stats.longestStreak)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
