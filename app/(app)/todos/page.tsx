"use client"

import { useState, useCallback } from "react"
import { useTodos } from "@/hooks/use-todos"
import { useUserProfile } from "@/hooks/use-user-profile"
import { useTodoCarryOver } from "@/hooks/use-todo-carry-over"
import { getTodayInTimeZone } from "@/lib/date-utils"
import { isToday } from "@/lib/tracker-utils"
import { formatDayFull } from "@/lib/tracker-utils"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { DayResetIndicator } from "@/components/tracker/day-reset-indicator"
import { TodoList } from "@/components/todos/todo-list"
import { ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react"
import { toast } from "sonner"

export default function TodoPage() {
  const { profile } = useUserProfile()
  const timezone = profile?.timezone || "UTC"
  const today = getTodayInTimeZone(timezone)
  const [selectedDate, setSelectedDate] = useState(today)
  const [newTodoText, setNewTodoText] = useState("")

  const { todos, isLoading, createTodo, updateTodo, deleteTodo, reorderTodos, isCreating } = useTodos(selectedDate)
  const { isCarrying, overdueCount } = useTodoCarryOver(selectedDate, isToday(selectedDate, timezone))

  const handleAddTodo = useCallback(async () => {
    const trimmed = newTodoText.trim()
    if (!trimmed) return
    try {
      await createTodo({
        text: trimmed,
        date: selectedDate,
        completed: false,
        carry_over: true,
        sort_order: todos?.length || 0,
      })
      setNewTodoText("")
      toast.success("Todo added")
    } catch {
      toast.error("Failed to add todo")
    }
  }, [newTodoText, selectedDate, todos?.length, createTodo])

  const handleToggle = useCallback(
    (id: string, completed: boolean) => {
      updateTodo({ id, completed })
    },
    [updateTodo]
  )

  const handleUpdateText = useCallback(
    (id: string, text: string) => {
      updateTodo({ id, text })
    },
    [updateTodo]
  )

  const handleToggleCarryOver = useCallback(
    (id: string, carry_over: boolean) => {
      updateTodo({ id, carry_over })
    },
    [updateTodo]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteTodo(id)
        toast.success("Todo deleted")
      } catch {
        toast.error("Failed to delete todo")
      }
    },
    [deleteTodo]
  )

  const handleReorder = useCallback(
    async (updates: { id: string; sort_order: number }[]) => {
      try {
        await reorderTodos(updates)
      } catch {
        toast.error("Failed to reorder")
      }
    },
    [reorderTodos]
  )

  const handleNavigate = useCallback(
    (direction: "prev" | "next" | "today") => {
      if (direction === "today") {
        setSelectedDate(today)
        return
      }
      const d = new Date(selectedDate + "T00:00:00")
      d.setDate(d.getDate() + (direction === "next" ? 1 : -1))
      setSelectedDate(d.toISOString().split("T")[0])
    },
    [selectedDate, today]
  )

  const activeCount = todos?.filter((t) => !t.completed).length || 0

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
          <p className="text-sm text-muted-foreground">
            {formatDayFull(selectedDate, timezone)} · {activeCount} active
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-muted bg-background px-2 py-1">
            <Calendar className="size-4 text-muted-foreground" />
            <Button variant="ghost" size="icon-xs" className="size-6" onClick={() => handleNavigate("prev")}>
              <ChevronLeft className="size-3" />
            </Button>
            <span className="text-sm font-medium">{formatDayFull(selectedDate, timezone)}</span>
            <Button variant="ghost" size="icon-xs" className="size-6" onClick={() => handleNavigate("next")}>
              <ChevronRight className="size-3" />
            </Button>
          </div>
          <Button variant="outline" size="xs" onClick={() => handleNavigate("today")}>Today</Button>
        </div>
      </div>

      <DayResetIndicator
        selectedDate={selectedDate}
        timezone={timezone}
        onBackToToday={() => setSelectedDate(today)}
      />

      {/* Add todo input */}
      <div className="flex gap-2">
        <InputGroup className="flex-1">
          <InputGroupInput
            placeholder="Add a todo..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTodo()
            }}
            maxLength={200}
            disabled={isCreating}
          />
        </InputGroup>
        <Button onClick={handleAddTodo} disabled={isCreating || !newTodoText.trim()}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>

      {isCarrying && (
        <div className="rounded-lg border border-muted bg-muted/30 p-3 text-center text-sm text-muted-foreground">
          Carrying over {overdueCount} todo{overdueCount !== 1 ? "s" : ""} from yesterday...
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <TodoList
          todos={todos || []}
          date={selectedDate}
          timezone={timezone}
          onToggle={handleToggle}
          onUpdateText={handleUpdateText}
          onToggleCarryOver={handleToggleCarryOver}
          onDelete={handleDelete}
          onReorder={handleReorder}
          isUpdating={isCreating}
        />
      )}
    </div>
  )
}
