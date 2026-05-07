"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { HabitCard } from "./habit-card"
import type { HabitRow, CompletionRow, SubtaskRow, SubtaskCompletionRow } from "@/lib/supabase/types"

interface DailyViewProps {
  habits: HabitRow[]
  date: string
  completions: CompletionRow[]
  streaks: Record<string, number>
  subtasks: Record<string, SubtaskRow[]>
  subtaskCompletions: Record<string, SubtaskCompletionRow[]>
  onToggle: (habitId: string, completed: boolean) => void
  onToggleSubtask: (habitId: string, subtaskId: string, completed: boolean) => void
  onToggleAllSubtasks: (habitId: string, completed: boolean) => void
  isToggling: boolean
  isLoading: boolean
}

export function DailyView({
  habits,
  date: _date,
  completions,
  streaks,
  subtasks,
  subtaskCompletions,
  onToggle,
  onToggleSubtask,
  onToggleAllSubtasks,
  isToggling,
  isLoading,
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

  const subtaskCompletionLookup: Record<string, Record<string, SubtaskCompletionRow | undefined>> = {}
  for (const habitId of Object.keys(subtaskCompletions)) {
    subtaskCompletionLookup[habitId] = {}
    for (const sc of subtaskCompletions[habitId]) {
      subtaskCompletionLookup[habitId][sc.subtask_id] = sc
    }
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          completion={completionLookup[habit.id]}
          streak={streaks[habit.id] ?? 0}
          subtasks={subtasks[habit.id] ?? []}
          subtaskCompletions={subtaskCompletionLookup[habit.id] ?? {}}
          onToggle={(completed) => onToggle(habit.id, completed)}
          onToggleSubtask={(subtaskId, completed) => onToggleSubtask(habit.id, subtaskId, completed)}
          _onToggleAllSubtasks={(completed) => onToggleAllSubtasks(habit.id, completed)}
          isToggling={isToggling}
        />
      ))}
    </div>
  )
}
