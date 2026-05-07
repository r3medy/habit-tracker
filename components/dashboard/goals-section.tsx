"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { HABIT_ICONS, HABIT_COLORS } from "@/lib/constants"
import type { GoalRow, GoalMilestoneRow, HabitRow, GoalInsert } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"
import { useGoals } from "@/hooks/use-goals"
import { toast } from "sonner"
import { getTodayInTimeZone } from "@/lib/date-utils"
import { Plus, Trash2 } from "lucide-react"

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

function AddGoalDialog({
  open,
  onOpenChange,
  habits,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  habits: HabitRow[]
  onAdd: (goal: GoalInsert) => void
}) {
  const [habitId, setHabitId] = useState(habits[0]?.id || "")
  const [targetType, setTargetType] = useState<"streak" | "count">("streak")
  const [targetValue, setTargetValue] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseInt(targetValue, 10)
    if (!habitId) {
      setError("Please select a habit")
      return
    }
    if (!value || value < 1) {
      setError("Target must be at least 1")
      return
    }

    const today = getTodayInTimeZone("UTC")
    onAdd({
      habit_id: habitId,
      target_type: targetType,
      target_value: value,
      start_date: today,
      end_date: null,
      completed: false,
      completed_at: null,
    })

    setTargetValue("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new goal</DialogTitle>
          <DialogDescription>Set a target to stay motivated.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Habit</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={habitId}
              onChange={(e) => setHabitId(e.target.value)}
            >
              {habits.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={targetType === "streak" ? "default" : "outline"}
                size="sm"
                onClick={() => setTargetType("streak")}
              >
                Streak
              </Button>
              <Button
                type="button"
                variant={targetType === "count" ? "default" : "outline"}
                size="sm"
                onClick={() => setTargetType("count")}
              >
                Count
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target value</Label>
            <InputGroup>
              <InputGroupInput
                type="number"
                min="1"
                placeholder="e.g. 30"
                value={targetValue}
                onChange={(e) => {
                  setTargetValue(e.target.value)
                  if (error) setError("")
                }}
              />
            </InputGroup>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function GoalsSection({ goals, habits, streaks, isLoading }: GoalsSectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const { createGoal, deleteGoal } = useGoals()

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id)
      toast.success("Goal deleted")
    } catch {
      toast.error("Failed to delete goal")
    }
  }

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
        <Button size="sm" className="mt-4" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-1 size-3" />
          Add goal
        </Button>
        <AddGoalDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          habits={habits}
          onAdd={async (goal) => {
            try {
              await createGoal(goal)
              toast.success("Goal added")
            } catch {
              toast.error("Failed to add goal")
            }
          }}
        />
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-muted bg-background p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium">Goals</h3>
        <Button size="xs" variant="outline" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-1 size-3" />
          Add goal
        </Button>
      </div>

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
                    {goal.target_type === "streak" ? "Streak goal" : "Count goal"} · Target: {goal.target_value}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(goal.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>

              <Progress value={progress} className="mt-2 h-1.5" />

              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex gap-1">
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
                <span className="text-xs text-muted-foreground">
                  {current} / {goal.target_value} ({Math.round(progress)}%)
                </span>
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

    <AddGoalDialog
      open={addDialogOpen}
      onOpenChange={setAddDialogOpen}
      habits={habits}
      onAdd={async (goal) => {
        try {
          await createGoal(goal)
          toast.success("Goal added")
        } catch {
          toast.error("Failed to add goal")
        }
      }}
    />
    </>
  )
}
