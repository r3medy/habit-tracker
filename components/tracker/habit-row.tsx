"use client"

import { createElement } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { getHabitColor, getHabitIcon } from "@/lib/habit-utils"
import type { HabitRow, CompletionRow } from "@/lib/supabase/types"
import { isFuture } from "@/lib/tracker-utils"
import { isHabitScheduledForDate } from "@/lib/habit-schedule-utils"
import { cn } from "@/lib/utils"

interface HabitRowProps {
  habit: HabitRow
  weekDays: string[]
  completions: Record<string, Record<string, CompletionRow | undefined>>
  onToggle: (habitId: string, date: string) => void
  isToggling: boolean
  timezone: string
}

export function HabitRow({
  habit,
  weekDays,
  completions,
  onToggle,
  isToggling,
  timezone,
}: HabitRowProps) {
  const borderColor = getHabitColor(habit.color)
  const icon = getHabitIcon(habit.icon)

  const completedCount = weekDays.filter(
    (date) =>
      completions[date]?.[habit.id]?.completed &&
      isHabitScheduledForDate(habit, date)
  ).length
  const scheduledCount = weekDays.filter((date) =>
    isHabitScheduledForDate(habit, date)
  ).length
  const progress =
    scheduledCount > 0 ? (completedCount / scheduledCount) * 100 : 0

  return (
    <div className="group flex items-center gap-2 py-2 sm:gap-3">
      <div className="flex w-28 shrink-0 items-center gap-2 sm:w-48">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${borderColor}20` }}
        >
          {createElement(icon, {
            className: "size-4",
            style: { color: borderColor },
          })}
        </div>
        <span className="truncate text-sm font-medium">{habit.name}</span>
      </div>

      <div className="flex flex-1 items-center justify-around">
        {weekDays.map((date) => {
          const completion = completions[date]?.[habit.id]
          const checked = completion?.completed ?? false
          const future = isFuture(date, timezone)
          const scheduled = isHabitScheduledForDate(habit, date)

          return (
            <div key={date} className="flex flex-col items-center gap-1">
              <Checkbox
                checked={checked}
                disabled={future || !scheduled || isToggling}
                onCheckedChange={() =>
                  !future && scheduled && onToggle(habit.id, date)
                }
                className={cn("size-5", !scheduled && "opacity-30")}
              />
            </div>
          )
        })}
      </div>

      <div className="flex w-16 shrink-0 items-center gap-2 sm:w-24">
        <Progress value={progress} className="h-1.5" />
        <span className="w-10 text-right text-xs text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}
