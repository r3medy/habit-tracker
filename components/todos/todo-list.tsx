"use client"

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TodoItem } from "./todo-item"
import type { TodoRow } from "@/lib/supabase/types"

interface TodoListProps {
  todos: TodoRow[]
  date: string
  timezone: string
  onToggle: (id: string, completed: boolean) => void
  onUpdateText: (id: string, text: string) => void
  onToggleCarryOver: (id: string, carryOver: boolean) => void
  onDelete: (id: string) => void
  onReorder: (updates: { id: string; sort_order: number }[]) => void
  isUpdating: boolean
}

export function TodoList({
  todos,
  date,
  timezone,
  onToggle,
  onUpdateText,
  onToggleCarryOver,
  onDelete,
  onReorder,
  isUpdating,
}: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = todos.findIndex((t) => t.id === active.id)
    const newIndex = todos.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...todos]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    const updates = reordered.map((t, i) => ({ id: t.id, sort_order: i }))
    onReorder(updates)
  }

  const incomplete = todos.filter((t) => !t.completed)
  const complete = todos.filter((t) => t.completed)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-2">
        <SortableContext items={incomplete.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {incomplete.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              date={date}
              timezone={timezone}
              onToggle={onToggle}
              onUpdateText={onUpdateText}
              onToggleCarryOver={onToggleCarryOver}
              onDelete={onDelete}
              isUpdating={isUpdating}
            />
          ))}
        </SortableContext>

        {complete.length > 0 && (
          <div className="pt-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Completed</p>
            {complete.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                date={date}
                timezone={timezone}
                onToggle={onToggle}
                onUpdateText={onUpdateText}
                onToggleCarryOver={onToggleCarryOver}
                onDelete={onDelete}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}
      </div>
    </DndContext>
  )
}
