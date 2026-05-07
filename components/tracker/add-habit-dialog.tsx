"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { HABIT_ICONS, HABIT_COLORS } from "@/lib/constants"
import type { HabitInsert } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

interface AddHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (habit: HabitInsert) => void
  isAdding: boolean
}

type HabitIconValue = (typeof HABIT_ICONS)[number]["value"]
type HabitColorValue = (typeof HABIT_COLORS)[number]["value"]

export function AddHabitDialog({ open, onOpenChange, onAdd, isAdding }: AddHabitDialogProps) {
  const [name, setName] = useState("")
  const [icon, setIcon] = useState<HabitIconValue>(HABIT_ICONS[0].value)
  const [color, setColor] = useState<HabitColorValue>(HABIT_COLORS[0].value)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Please enter a habit name")
      return
    }
    if (name.trim().length > 50) {
      setError("Name must be 50 characters or less")
      return
    }

    onAdd({
      name: name.trim(),
      icon,
      color,
      schedule_type: "daily",
      schedule_days: null,
      sort_order: 0,
    })

    setName("")
    setIcon(HABIT_ICONS[0].value)
    setColor(HABIT_COLORS[0].value)
    setError("")
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setName("")
      setError("")
    }
  }

  const borderColor = HABIT_COLORS.find((c) => c.value === color)?.light || HABIT_COLORS[0].light
  const IconComponent = HABIT_ICONS.find((i) => i.value === icon)?.component || HABIT_ICONS[0].component

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new habit</DialogTitle>
          <DialogDescription>Create a habit to start tracking.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputGroup className={cn(error && "border-destructive")} style={!error ? { borderColor } : undefined}>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                  title="Color"
                >
                  <div className="size-4 rounded-full" style={{ backgroundColor: borderColor }} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-fit p-3" align="start" side="bottom">
                <div className="grid grid-cols-4 gap-2">
                  {HABIT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "size-8 rounded-full transition-all",
                        color === c.value ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                      )}
                      style={{ backgroundColor: c.light }}
                      title={c.name}
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
                  title="Icon"
                >
                  <IconComponent className="size-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start" side="bottom">
                <div className="grid grid-cols-4 gap-1">
                  {HABIT_ICONS.map((ic) => {
                    const Icon = ic.component
                    return (
                      <button
                        key={ic.value}
                        type="button"
                        onClick={() => setIcon(ic.value)}
                        className={cn(
                          "flex size-9 items-center justify-center rounded-md transition-all",
                          icon === ic.value
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                        title={ic.name}
                      >
                        <Icon className="size-4" />
                      </button>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>

            <InputGroupInput
              placeholder="e.g. Morning meditation"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError("")
              }}
              maxLength={50}
            />
          </InputGroup>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? "Adding..." : "Add habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
