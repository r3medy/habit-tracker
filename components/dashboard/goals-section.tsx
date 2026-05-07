"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HABIT_ICONS, HABIT_COLORS } from "@/lib/constants"
import type { GoalRow, GoalMilestoneRow, HabitRow } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

interface GoalsSectionProps {
  goals: (GoalRow & { milestones?: GoalMilestoneRow[] })[]
  habits: HabitRow[]
  streaks: Record<string, number>
  isLoading: boolean
}

function getHabitColor(colorValue: string) {
  return HABIT_COLORS.find((c) => c.value === colorValue)?.light || HABIT_COLORS[0].light
}

function getHabitIcon(iconValue: string) {
  return HABIT_ICONS.find((i) => i.value === iconValue)?.component || HABIT_ICONS[0].component
}

export function GoalsSection({ goals, habits, streaks, isLoading }: GoalsSectionProps) {
  const habitMap = useMemo(() => {
    const map = new Map<string, HabitRow>()
    for (const h of habits) map.set(h.id, h)
    return map
  }, [habits])

  const activeGoals = useMemo(() => goals.filter((g) => !g.completed), [goals])
  const completedGoals = useMemo(() => goals.filter((g) => g.completed), [goals])

  if (isLoading) {
    return (
      <div className="rounded-lg border border-muted bg-background p-4">
        <div className="h-20 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-lg border border-muted bg-background p-8 text-center">
        <p className="text-sm text-muted-foreground">No active goals</p>
        <p className="mt-1 text-xs text-muted-foreground">Set a goal to start tracking progress</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-muted bg-background p-4">
      <h3 className="mb-4 text-sm font-medium">Goals</h3>

      <div className="space-y-3">
        {activeGoals.map((goal) => {
          const habit = habitMap.get(goal.habit_id)
          if (!habit) return null

          const Icon = getHabitIcon(habit.icon)
          const borderColor = getHabitColor(habit.color)

          let progress = 0
          let current = 0

          if (goal.target_type === "streak") {
            current = streaks[goal.habit_id] || 0
            progress = Math.min((current / goal.target_value) * 100, 100)
          } else {
            current = 0
            progress = 0
          }

          return (
            <div key={goal.id} className="rounded-lg border border-muted/50 p-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex size-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${borderColor}20` }}
                >
                  <Icon className="size-3" style={{ color: borderColor }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {goal.target_type === "streak" ? "Streak goal" : "Count goal"} · {goal.target_value} target
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(progress)}%
                </Badge>
              </div>

              <Progress value={progress} className="mt-2 h-1.5" />

              <div className="mt-2 flex gap-1">
                {[25, 50, 75].map((threshold) => {
                  const reached = (goal.milestones || []).some(
                    (m) => m.threshold_pct === threshold && m.reached
                  )
                  return (
                    <span
                      key={threshold}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs",
                        reached
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {threshold}%
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}

        {completedGoals.length > 0 && (
          <div className="pt-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Completed</p>
            {completedGoals.map((goal) => {
              const habit = habitMap.get(goal.habit_id)
              if (!habit) return null
              const Icon = getHabitIcon(habit.icon)

              return (
                <div key={goal.id} className="flex items-center gap-2 rounded-lg border border-muted/50 p-2 opacity-60">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="flex-1 text-sm line-through text-muted-foreground">{habit.name}</span>
                  <Badge variant="secondary" className="text-xs">Done</Badge>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
