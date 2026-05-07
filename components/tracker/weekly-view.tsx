"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { HabitRow } from "./habit-row"
import type { HabitRow as HabitRowType, CompletionRow } from "@/lib/supabase/types"
import { formatDayShort } from "@/lib/tracker-utils"

interface WeeklyViewProps {
  habits: HabitRowType[]
  weekDays: string[]
  completions: Record<string, CompletionRow[]>
  onToggle: (habitId: string, date: string) => void
  isToggling: boolean
  isLoading: boolean
}

export function WeeklyView({
  habits,
  weekDays,
  completions,
  onToggle,
  isToggling,
  isLoading,
}: WeeklyViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 py-2">
          <Skeleton className="h-8 w-48" />
          <div className="flex flex-1 justify-around">
            {weekDays.map((d) => (
              <Skeleton key={d} className="size-5" />
            ))}
          </div>
          <Skeleton className="h-1.5 w-24" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-8 w-48" />
            <div className="flex flex-1 justify-around">
              {weekDays.map((d) => (
                <Skeleton key={d} className="size-5" />
              ))}
            </div>
            <Skeleton className="h-1.5 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No habits yet.</p>
        <p className="text-sm text-muted-foreground">Add your first habit to get started.</p>
      </div>
    )
  }

  // Build completion lookup: date -> habit_id -> CompletionRow
  const completionLookup: Record<string, Record<string, CompletionRow | undefined>> = {}
  for (const date of weekDays) {
    completionLookup[date] = {}
    for (const c of completions[date] || []) {
      completionLookup[date][c.habit_id] = c
    }
  }

  // Calculate daily completion percentages
  const dailyTotals = weekDays.map((date) => {
    const dayCompletions = completions[date] || []
    const completed = dayCompletions.filter((c) => c.completed).length
    return habits.length > 0 ? (completed / habits.length) * 100 : 0
  })

  return (
    <div className="rounded-lg border border-muted">
      {/* Header row */}
      <div className="flex items-center gap-3 border-b border-muted px-4 py-2 bg-muted/30">
        <div className="w-48 shrink-0 text-xs font-medium text-muted-foreground">Habit</div>
        <div className="flex flex-1 items-center justify-around">
          {weekDays.map((date) => (
            <div key={date} className="flex flex-col items-center">
              <span className="text-xs font-medium text-muted-foreground">
                {formatDayShort(date, "UTC")}
              </span>
            </div>
          ))}
        </div>
        <div className="w-24 shrink-0 text-xs font-medium text-muted-foreground text-right">
          Progress
        </div>
      </div>

      {/* Habit rows */}
      <div className="divide-y divide-muted/50">
        {habits.map((habit) => (
          <div key={habit.id} className="px-4">
            <HabitRow
              habit={habit}
              weekDays={weekDays}
              completions={completionLookup}
              onToggle={onToggle}
              isToggling={isToggling}
            />
          </div>
        ))}
      </div>

      {/* Daily completion row */}
      <div className="flex items-center gap-3 border-t border-muted px-4 py-2 bg-muted/30">
        <div className="w-48 shrink-0 text-xs text-muted-foreground">Daily completion</div>
        <div className="flex flex-1 items-center justify-around">
          {dailyTotals.map((pct, i) => (
            <span key={i} className="text-xs font-medium">
              {Math.round(pct)}%
            </span>
          ))}
        </div>
        <div className="w-24 shrink-0 text-right text-xs text-muted-foreground">
          Weekly avg.{" "}
          <span className="font-medium">
            {habits.length > 0
              ? Math.round(dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length)
              : 0}
            %
          </span>
        </div>
      </div>
    </div>
  )
}
