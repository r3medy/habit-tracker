"use client"

import { HABIT_ICONS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {HABIT_ICONS.map((icon) => {
        const isSelected = value === icon.value
        const Icon = icon.component
        return (
          <button
            key={icon.value}
            type="button"
            onClick={() => onChange(icon.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border p-3 transition-all",
              "hover:border-primary/50 hover:bg-muted/50",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
            title={icon.name}
          >
            <Icon className="size-5" />
            <span className="text-xs">{icon.name}</span>
          </button>
        )
      })}
    </div>
  )
}
