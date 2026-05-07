"use client"

import { Checkbox } from "@/components/ui/checkbox"
import type { SubtaskRow, SubtaskCompletionRow } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

interface SubtaskListProps {
  subtasks: SubtaskRow[]
  completions: Record<string, SubtaskCompletionRow | undefined>
  onToggleSubtask: (subtaskId: string, completed: boolean) => void
  isToggling: boolean
}

export function SubtaskList({
  subtasks,
  completions,
  onToggleSubtask,
  isToggling,
}: SubtaskListProps) {

  return (
    <div className="ml-10 mt-2 space-y-1 border-l-2 border-muted pl-4">
      {subtasks.map((subtask) => {
        const completed = completions[subtask.id]?.completed ?? false
        return (
          <div key={subtask.id} className="flex items-center gap-2 py-1">
            <Checkbox
              checked={completed}
              disabled={isToggling}
              onCheckedChange={(checked) => onToggleSubtask(subtask.id, checked === true)}
              className="size-4"
            />
            <span className={cn("text-sm", completed && "text-muted-foreground line-through")}>
              {subtask.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
