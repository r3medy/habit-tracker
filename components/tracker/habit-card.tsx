"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { HABIT_ICONS } from "@/lib/constants"
import { getHabitColor } from "@/lib/habit-utils"
import type { HabitRow, CompletionRow } from "@/lib/supabase/types"
import { Flame } from "lucide-react"

interface HabitCardProps {
  habit: HabitRow
  completion: CompletionRow | undefined
  streak: number
  onToggle: (completed: boolean) => void
  isToggling: boolean
}

interface HabitIconProps {
  iconValue: string
  color: string
  className?: string
}

function HabitIcon({ iconValue, color, className }: HabitIconProps) {
  const Icon = HABIT_ICONS.find((i) => i.value === iconValue)?.component ?? HABIT_ICONS[0].component
  return <Icon className={className} style={{ color }} />
}

export function HabitCard({
  habit,
  completion,
  streak,
  onToggle,
  isToggling,
}: HabitCardProps) {
  const borderColor = getHabitColor(habit.color)
  const checked = completion?.completed ?? false

  return (
    <div
      className="rounded-lg border border-muted transition-colors"
    >
      <div className="flex items-center gap-3 p-3">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${borderColor}20` }}
        >
          <HabitIcon iconValue={habit.icon} color={borderColor} className="size-4" />
        </div>

        <div className="flex flex-1 items-center gap-2">
          <span className="text-sm font-medium">{habit.name}</span>
          {streak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
              <Flame className="size-3" />
              {streak}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={checked}
            disabled={isToggling}
            onCheckedChange={(val) => onToggle(val === true)}
            className="size-5"
          />
        </div>
      </div>
    </div>
  )
}
