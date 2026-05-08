"use client"
import { format } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
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
import { getHabitColor, getHabitIcon } from "@/lib/habit-utils"
import type {
  GoalRow,
  GoalMilestoneRow,
  HabitRow,
  GoalInsert,
} from "@/lib/supabase/types"
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

function AddGoalDialog({
  open,
  onOpenChange,
  habits,
  streaks,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  habits: HabitRow[]
  streaks: Record<string, number>
  onAdd: (goal: GoalInsert) => void
}) {
  const [habitId, setHabitId] = useState(habits[0]?.id || "")
  const [targetType, setTargetType] = useState<"streak" | "count">("streak")
  const [targetValue, setTargetValue] = useState("")
  const [error, setError] = useState("")

  // Sync habitId when habits load or change
  useEffect(() => {
    if (
      habits.length > 0 &&
      (!habitId || !habits.some((h) => h.id === habitId))
    ) {
      setHabitId(habits[0].id)
    }
  }, [habits, habitId])

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

    // Check if the goal is already met
    if (targetType === "streak") {
      const currentStreak = streaks[habitId] || 0
      if (currentStreak >= value) {
        toast.error(`Goal already met! Current streak is ${currentStreak}.`)
        setTargetValue("")
        setError("")
        onOpenChange(false)
        return
      }
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
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              value={habitId}
              onChange={(e) => setHabitId(e.target.value)}
            >
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function GoalsSection({
  goals,
  habits,
  streaks,
  isLoading,
}: GoalsSectionProps) {
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
  const completedGoals = useMemo(
    () => goals.filter((g) => g.completed),
    [goals]
  )

  // Fetch completion counts for count-type goals
  const countGoals = useMemo(
    () => activeGoals.filter((g) => g.target_type === "count"),
    [activeGoals]
  )

  const { data: completionCounts = {} } = useQuery({
    queryKey: ["goal-completion-counts", countGoals.map((g) => g.id)],
    queryFn: async () => {
      if (countGoals.length === 0) return {}
      const counts: Record<string, number> = {}

      for (const goal of countGoals) {
        const { count, error } = await supabase
          .from("completions")
          .select("*", { count: "exact", head: true })
          .eq("habit_id", goal.habit_id)
          .eq("completed", true)
          .gte("date", goal.start_date)

        if (!error && count !== null) {
          counts[goal.habit_id] = count
        }
      }

      return counts
    },
    enabled: countGoals.length > 0,
    staleTime: 1000 * 60 * 2,
  })

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
        <p className="mt-1 text-xs text-muted-foreground">
          Set a goal to start tracking progress
        </p>
        <Button
          size="sm"
          className="mt-4"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="mr-1 size-3" />
          Add goal
        </Button>
        <AddGoalDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          habits={habits}
          streaks={streaks}
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
          <Button
            size="xs"
            variant="outline"
            onClick={() => setAddDialogOpen(true)}
          >
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
              current = completionCounts[goal.habit_id] || 0
              progress = Math.min((current / goal.target_value) * 100, 100)
            }

            return (
              <div
                key={goal.id}
                className="rounded-lg border border-muted/50 p-3"
              >
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
                      {goal.target_type === "streak"
                        ? "Streak goal"
                        : "Count goal"}{" "}
                      — Target: {goal.target_value}
                      {goal.target_type === "count" &&
                        ` — Started: ${format(new Date(goal.start_date), "MMM d, yyyy")}`}
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

                <div className="mt-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Progress value={progress} className="h-1.5" />
                    <div className="relative mt-1 h-4">
                      {[25, 50, 75].map((threshold) => {
                        const reached = (goal.milestones || []).some(
                          (m) => m.threshold_pct === threshold && m.reached
                        )
                        return (
                          <span
                            key={threshold}
                            className={cn(
                              "absolute -translate-x-1/2 text-[10px]",
                              reached
                                ? "font-medium text-primary"
                                : "text-muted-foreground"
                            )}
                            style={{ left: `${threshold}%` }}
                          >
                            {threshold}%
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {current} / {goal.target_value} ({Math.round(progress)}%)
                  </span>
                </div>
              </div>
            )
          })}

          {completedGoals.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Completed
              </p>
              {completedGoals.map((goal) => {
                const habit = habitMap.get(goal.habit_id)
                if (!habit) return null
                const Icon = getHabitIcon(habit.icon)

                return (
                  <div
                    key={goal.id}
                    className="flex items-center gap-2 rounded-lg border border-muted/50 p-2 opacity-60"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="flex-1 text-sm text-muted-foreground line-through">
                      {habit.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Done
                    </Badge>
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
        streaks={streaks}
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
