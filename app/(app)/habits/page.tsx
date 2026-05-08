"use client"

import { useState } from "react"
import { useHabits } from "@/hooks/use-habits"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { AddHabitDialog } from "@/components/tracker/add-habit-dialog"
import { HABIT_ICONS, HABIT_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { getHabitColor, getHabitIcon } from "@/lib/habit-utils"
import type { HabitRow, HabitInsert } from "@/lib/supabase/types"
import { Pencil, Trash2, Check, X, Plus } from "lucide-react"
import { toast } from "sonner"

export default function HabitsPage() {
  const { habits, isLoading, updateHabit, deleteHabit, createHabit, isCreating, isUpdating, isDeleting } = useHabits()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editIcon, setEditIcon] = useState("")
  const [editColor, setEditColor] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const startEdit = (habit: HabitRow) => {
    setEditingId(habit.id)
    setEditName(habit.name)
    setEditIcon(habit.icon)
    setEditColor(habit.color)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return
    try {
      await updateHabit({ id, name: editName.trim(), icon: editIcon, color: editColor })
      setEditingId(null)
      toast.success("Habit updated")
    } catch {
      toast.error("Failed to update habit")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteHabit(id)
      toast.success("Habit deleted")
    } catch {
      toast.error("Failed to delete habit")
    }
  }

  const handleAddHabit = async (habit: HabitInsert) => {
    try {
      await createHabit(habit)
      setAddDialogOpen(false)
      toast.success("Habit added")
    } catch {
      toast.error("Failed to add habit")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
          <p className="text-sm text-muted-foreground">Manage your habits — rename, recolor, or remove.</p>
        </div>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-1 size-3" />
          New habit
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : habits?.length === 0 ? (
        <div className="rounded-lg border border-muted bg-background p-8 text-center">
          <p className="text-sm text-muted-foreground">No habits yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Add your first habit to get started.</p>
          <Button size="sm" className="mt-4" onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-1 size-3" />
            Add habit
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {habits?.map((habit) => {
            const IconComponent = getHabitIcon(habit.icon)
            const borderColor = getHabitColor(habit.color)
            const isEditing = editingId === habit.id

            return (
              <div
                key={habit.id}
                className="rounded-lg border border-muted bg-background p-3"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <InputGroup className="flex-1" style={{ borderColor }}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <div className="size-4 rounded-full" style={{ backgroundColor: borderColor }} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit p-3" align="start">
                          <div className="grid grid-cols-4 gap-2">
                            {HABIT_COLORS.map((c) => (
                              <button
                                key={c.value}
                                type="button"
                                onClick={() => setEditColor(c.value)}
                                className={cn(
                                  "size-8 rounded-full transition-all",
                                  editColor === c.value ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                                )}
                                style={{ backgroundColor: c.light }}
                              />
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
                          >
                            <IconComponent className="size-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" align="start">
                          <div className="grid grid-cols-4 gap-1">
                            {HABIT_ICONS.map((ic) => {
                              const Icon = ic.component
                              return (
                                <button
                                  key={ic.value}
                                  type="button"
                                  onClick={() => setEditIcon(ic.value)}
                                  className={cn(
                                    "flex size-9 items-center justify-center rounded-md transition-all",
                                    editIcon === ic.value
                                      ? "bg-primary/10 text-primary"
                                      : "text-muted-foreground hover:bg-muted"
                                  )}
                                >
                                  <Icon className="size-4" />
                                </button>
                              )
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>

                      <InputGroupInput
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(habit.id)
                          if (e.key === "Escape") cancelEdit()
                        }}
                        autoFocus
                        maxLength={50}
                      />
                    </InputGroup>

                    <Button variant="ghost" size="icon-xs" onClick={() => saveEdit(habit.id)} disabled={isUpdating}>
                      <Check className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={cancelEdit}>
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${borderColor}20` }}
                    >
                      <IconComponent className="size-4" style={{ color: borderColor }} />
                    </div>
                    <span className="flex-1 text-sm font-medium">{habit.name}</span>
                    <Button variant="ghost" size="icon-xs" onClick={() => startEdit(habit)} className="text-muted-foreground hover:text-foreground">
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(habit.id)}
                      disabled={isDeleting}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <AddHabitDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddHabit}
        isAdding={isCreating}
      />
    </div>
  )
}
