"use client"

import { HABIT_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {HABIT_COLORS.map((color) => {
        const isSelected = value === color.value
        return (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all",
              "hover:border-primary/50 hover:bg-muted/50",
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border"
            )}
            title={color.name}
          >
            <div
              className="size-8 rounded-full border-2 border-border"
              style={{ backgroundColor: color.light }}
            />
            <span className="text-xs text-muted-foreground">{color.name}</span>
          </button>
        )
      })}
    </div>
  )
}
