"use client"

import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HABIT_ICONS, HABIT_COLORS } from "@/lib/constants"
import type { HabitInsert } from "@/lib/supabase/types"
import { Trash2 } from "lucide-react"

interface DraftHabit {
  key: string
  name: string
  icon: string
  color: string
  schedule_type: "daily"
  schedule_days: null
  sort_order: number
}

interface StepHabitsProps {
  onNext: (habits: HabitInsert[]) => void
  isCreating: boolean
}

function freshHabit(index: number): DraftHabit {
  return {
    key: crypto.randomUUID(),
    name: "",
    icon: HABIT_ICONS[0].value,
    color: HABIT_COLORS[0].value,
    schedule_type: "daily",
    schedule_days: null,
    sort_order: index,
  }
}

function getHabitColor(colorValue: string) {
  return HABIT_COLORS.find((c) => c.value === colorValue)?.light || HABIT_COLORS[0].light
}

function getHabitIcon(iconValue: string) {
  return HABIT_ICONS.find((i) => i.value === iconValue)?.component || HABIT_ICONS[0].component
}

function HabitRow({
  draft,
  onUpdate,
  onDelete,
  canDelete,
  error,
}: {
  draft: DraftHabit
  onUpdate: (field: keyof DraftHabit, value: string) => void
  onDelete: () => void
  canDelete: boolean
  error?: string
}) {
  const borderColor = getHabitColor(draft.color)
  const IconComponent = getHabitIcon(draft.icon)

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <InputGroup
          className={cn("transition-colors", error && "border-destructive")}
          style={!error ? { borderColor } : undefined}
        >
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Color"
              >
                <div className="size-4 rounded-full" style={{ backgroundColor: borderColor }} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-3" align="start" side="bottom">
              <div className="grid grid-cols-4 gap-2">
                {HABIT_COLORS.map((color) => {
                  const isSelected = draft.color === color.value
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => onUpdate("color", color.value)}
                      className={cn(
                        "size-8 rounded-full transition-all",
                        isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                      )}
                      style={{ backgroundColor: color.light }}
                      title={color.name}
                    />
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-foreground"
                title="Icon"
              >
                <IconComponent className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start" side="bottom">
              <div className="grid grid-cols-4 gap-1">
                {HABIT_ICONS.map((icon) => {
                  const isSelected = draft.icon === icon.value
                  const Icon = icon.component
                  return (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => onUpdate("icon", icon.value)}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-md transition-all",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                      title={icon.name}
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
            value={draft.name}
            onChange={(e) => onUpdate("name", e.target.value)}
            maxLength={50}
          />
        </InputGroup>

        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            title="Remove habit"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive pl-1">{error}</p>
      )}
    </div>
  )
}

export function StepHabits({ onNext, isCreating }: StepHabitsProps) {
  const [drafts, setDrafts] = useState<DraftHabit[]>([freshHabit(0)])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validCount = drafts.filter((d) => d.name.trim()).length
  const canContinue = validCount >= 3

  const addHabit = () => {
    setDrafts([...drafts, freshHabit(drafts.length)])
  }

  const removeHabit = (key: string) => {
    if (drafts.length <= 1) return
    setDrafts(drafts.filter((d) => d.key !== key))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const updateHabit = (key: string, field: keyof DraftHabit, value: string) => {
    setDrafts(drafts.map((d) => (d.key === key ? { ...d, [field]: value } : d)))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validDrafts = drafts.filter((d) => d.name.trim())

    const habits: HabitInsert[] = validDrafts.map((d) => ({
      name: d.name.trim(),
      icon: d.icon,
      color: d.color,
      schedule_type: d.schedule_type,
      schedule_days: null,
      sort_order: d.sort_order,
    }))

    onNext(habits)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="space-y-3">
        {drafts.map((draft) => (
          <HabitRow
            key={draft.key}
            draft={draft}
            onUpdate={(field, value) => updateHabit(draft.key, field, value)}
            onDelete={() => removeHabit(draft.key)}
            canDelete={drafts.length > 1}
            error={errors[draft.key]}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addHabit}
        className="w-full"
      >
        <span className="mr-1">+</span>
        Add another habit
      </Button>

      <div className="flex flex-col items-end gap-2">
        {!canContinue && (
          <p className="text-sm text-muted-foreground">
            Add at least 3 habits to continue ({validCount}/3)
          </p>
        )}
        <Button type="submit" disabled={!canContinue || isCreating}>
          {isCreating ? "Creating..." : "Continue"}
          <span className="ml-1">→</span>
        </Button>
      </div>
    </form>
  )
}
