"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import type { TodoRow } from "@/lib/supabase/types"
import { GripVertical, Pin, PinOff, Trash2 } from "lucide-react"

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
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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


    </div>
  )
}
