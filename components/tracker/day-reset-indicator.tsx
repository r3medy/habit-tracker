"use client"

import { Button } from "@/components/ui/button"
import { isToday, formatDayFull } from "@/lib/tracker-utils"
import { CalendarDays } from "lucide-react"

interface DayResetIndicatorProps {
  selectedDate: string
  timezone: string
  onBackToToday: () => void
}

export function DayResetIndicator({ selectedDate, timezone, onBackToToday }: DayResetIndicatorProps) {
  if (isToday(selectedDate, timezone)) {
    return null
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-muted bg-muted/50 px-4 py-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CalendarDays className="size-4" />
        <span>Viewing {formatDayFull(selectedDate, timezone)}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={onBackToToday} className="h-7 text-xs">
        Back to today
      </Button>
    </div>
  )
}
