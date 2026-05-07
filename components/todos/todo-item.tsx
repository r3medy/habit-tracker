"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { useSubtasks } from "@/hooks/use-subtasks"
import type { TodoRow, SubtaskRow, SubtaskCompletionRow } from "@/lib/supabase/types"
import { GripVertical, ChevronDown, ChevronUp, Pin, PinOff, Trash2, Plus } from "lucide-react"

interface TodoItemProps {
  todo: TodoRow
  date: string
  timezone: string
  onToggle: (id: string, completed: boolean) => void
  onUpdateText: (id: string, text: string) => void
  onToggleCarryOver: (id: string, carryOver: boolean) => void
  onDelete: (id: string) => void
  isUpdating: boolean
}

export function TodoItem({
  todo,
  date,
  timezone,
  onToggle,
  onUpdateText,
  onToggleCarryOver,
  onDelete,
  isUpdating,
}: TodoItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [newSubText, setNewSubText] = useState("")

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const { subtasks, completions, createSubtask, deleteSubtask, toggleSubtaskCompletion } = useSubtasks("", timezone, todo.id)

  const subtaskCompletionLookup: Record<string, SubtaskCompletionRow | undefined> = {}
  for (const sc of completions || []) {
    subtaskCompletionLookup[sc.subtask_id] = sc
  }

  const handleSaveText = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== todo.text) {
      onUpdateText(todo.id, trimmed)
    } else {
      setEditText(todo.text)
    }
    setEditing(false)
  }

  const handleAddSub = async () => {
    const trimmed = newSubText.trim()
    if (!trimmed) return
    try {
      await createSubtask({ name: trimmed, sort_order: 0 })
      setNewSubText("")
    } catch {
      // toast handled by hook
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={cn("rounded-lg border border-muted/50", isDragging && "opacity-50")}>
      <div className="flex items-center gap-2 p-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
        >
          <GripVertical className="size-4" />
        </button>

        <Checkbox
          checked={todo.completed}
          disabled={isUpdating}
          onCheckedChange={(checked) => onToggle(todo.id, checked === true)}
          className="size-4"
        />

        {editing ? (
          <InputGroup className="flex-1">
            <InputGroupInput
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSaveText}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveText()
                if (e.key === "Escape") { setEditText(todo.text); setEditing(false) }
              }}
              autoFocus
              maxLength={200}
            />
          </InputGroup>
        ) : (
          <span
            className={cn("flex-1 cursor-pointer text-sm", todo.completed && "text-muted-foreground line-through")}
            onClick={() => setEditing(true)}
          >
            {todo.text}
          </span>
        )}

        {subtasks && subtasks.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            {subtasks.length}
          </button>
        )}

        <Button
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onToggleCarryOver(todo.id, !todo.carry_over)}
          title={todo.carry_over ? "Will carry over" : "Won't carry over"}
        >
          {todo.carry_over ? <Pin className="size-3" /> : <PinOff className="size-3" />}
        </Button>

        <Button
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-muted/50 px-10 pb-2 pt-1">
          {subtasks?.map((sub) => {
            const subCompleted = subtaskCompletionLookup[sub.id]?.completed ?? false
            return (
              <div key={sub.id} className="flex items-center gap-2 py-1">
                <Checkbox
                  checked={subCompleted}
                  disabled={isUpdating}
                  onCheckedChange={(checked) => toggleSubtaskCompletion({ subtaskId: sub.id, date, completed: checked === true })}
                  className="size-3.5"
                />
                <span className={cn("flex-1 text-sm", subCompleted && "text-muted-foreground line-through")}>
                  {sub.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-5 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteSubtask(sub.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            )
          })}
          <div className="flex items-center gap-2 py-1">
            <InputGroup className="flex-1">
              <InputGroupInput
                placeholder="Add sub-todo..."
                value={newSubText}
                onChange={(e) => setNewSubText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSub()
                }}
                className="h-7 text-xs"
                maxLength={200}
              />
            </InputGroup>
          </div>
        </div>
      )}
    </div>
  )
}
