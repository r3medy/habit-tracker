"use client"

import { useParams, useRouter } from "next/navigation"
import { useHabits } from "@/hooks/use-habits"
import { useCompletions } from "@/hooks/use-completions"
import { useSubtasks } from "@/hooks/use-subtasks"
import { useStreaks } from "@/hooks/use-streaks"
import { useUserProfile } from "@/hooks/use-user-profile"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { HABIT_ICONS, HABIT_COLORS } from "@/lib/constants"
import { formatDayFull } from "@/lib/tracker-utils"
import { cn } from "@/lib/utils"
import { ArrowLeft, Flame } from "lucide-react"
import { JournalSection } from "@/components/dashboard/journal-section"

function getHabitColor(colorValue: string) {
  return HABIT_COLORS.find((c) => c.value === colorValue)?.light || HABIT_COLORS[0].light
}

function getHabitIcon(iconValue: string) {
  return HABIT_ICONS.find((i) => i.value === iconValue)?.component || HABIT_ICONS[0].component
}

export default function DayDetailPage() {
  const params = useParams()
  const router = useRouter()
  const date = params.date as string

  const { profile } = useUserProfile()
  const timezone = profile?.timezone || "UTC"

  const { habits, isLoading: habitsLoading } = useHabits()
  const { completions, isLoading: completionsLoading, toggleCompletion, isToggling } = useCompletions(date, timezone)

  const completionLookup = new Map<string, boolean>()
  for (const c of completions || []) {
    completionLookup.set(c.habit_id, c.completed)
  }

  const isLoading = habitsLoading || completionsLoading

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-xs" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {formatDayFull(date, timezone)}
          </h1>
          <p className="text-sm text-muted-foreground">Daily overview</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {habits?.map((habit) => {
            const Icon = getHabitIcon(habit.icon)
            const borderColor = getHabitColor(habit.color)
            const completed = completionLookup.get(habit.id) || false

            return (
              <div
                key={habit.id}
                className="flex items-center gap-3 rounded-lg border border-muted p-3"
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${borderColor}20` }}
                >
                  <Icon className="size-4" style={{ color: borderColor }} />
                </div>
                <span className="flex-1 text-sm font-medium">{habit.name}</span>
                <Checkbox
                  checked={completed}
                  disabled={isToggling}
                  onCheckedChange={() => toggleCompletion({ habitId: habit.id, date, completed: !completed })}
                  className="size-5"
                />
              </div>
            )
          })}
        </div>
      )}

      <JournalSection date={date} />
    </div>
  )
}
