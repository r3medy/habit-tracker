"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { HABIT_ICONS, HABIT_COLORS } from "@/lib/constants"
import type { HabitRow, CompletionRow, SubtaskRow, SubtaskCompletionRow } from "@/lib/supabase/types"
import { ChevronDown, ChevronUp, Flame } from "lucide-react"
import { SubtaskList } from "./subtask-list"

interface HabitCardProps {
  habit: HabitRow
  completion: CompletionRow | undefined
  streak: number
  subtasks: SubtaskRow[]
  subtaskCompletions: Record<string, SubtaskCompletionRow | undefined>
  onToggle: (completed: boolean) => void
  onToggleSubtask: (subtaskId: string, completed: boolean) => void
  _onToggleAllSubtasks: (completed: boolean) => void
  isToggling: boolean
}

function getHabitColor(colorValue: string) {
  return HABIT_COLORS.find((c) => c.value === colorValue)?.light || HABIT_COLORS[0].light
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
  subtasks,
  subtaskCompletions,
  onToggle,
  onToggleSubtask,
  _onToggleAllSubtasks,
  isToggling,
}: HabitCardProps) {
  const [expanded, setExpanded] = useState(false)
  const borderColor = getHabitColor(habit.color)
  const checked = completion?.completed ?? false

  return (
    <div
      className="rounded-lg border border-muted transition-colors"
      style={{ borderLeftColor: borderColor, borderLeftWidth: "3px" }}
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
          {subtasks.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
              {subtasks.length}
            </button>
          )}
          <Checkbox
            checked={checked}
            disabled={isToggling}
            onCheckedChange={(val) => onToggle(val === true)}
            className="size-5"
          />
        </div>
      </div>

      {expanded && subtasks.length > 0 && (
        <SubtaskList
          subtasks={subtasks}
          completions={subtaskCompletions}
          onToggleSubtask={onToggleSubtask}
          isToggling={isToggling}
        />
      )}
    </div>
  )
}
