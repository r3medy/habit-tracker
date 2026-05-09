"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { HabitCard } from "./habit-card"
import type { HabitRow, CompletionRow } from "@/lib/supabase/types"

interface DailyViewProps {
  habits: HabitRow[]
  date: string
  completions: CompletionRow[]
  streaks: Record<string, number>
  onToggle: (habitId: string, completed: boolean) => void
  isToggling: boolean
  isLoading: boolean
  isFutureDate?: boolean
}

export function DailyView({
  habits,
  date: _date,
  completions,
  streaks,
  onToggle,
  isToggling,
  isLoading,
  isFutureDate = false,
}: DailyViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
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

  const completionLookup: Record<string, CompletionRow | undefined> = {}
  for (const c of completions) {
    completionLookup[c.habit_id] = c
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          completion={completionLookup[habit.id]}
          streak={streaks[habit.id] ?? 0}
          onToggle={(completed) => onToggle(habit.id, completed)}
          isToggling={isToggling}
          disabled={isFutureDate}
        />
      ))}
    </div>
  )
}
