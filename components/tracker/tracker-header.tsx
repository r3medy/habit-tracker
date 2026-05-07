"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react"
import { formatWeekRange, formatDayFull } from "@/lib/tracker-utils"

interface TrackerHeaderProps {
  view: "week" | "day"
  onViewChange: (view: "week" | "day") => void
  selectedDate: string
  weekStart: string
  weekEnd: string
  timezone: string
  onNavigate: (direction: "prev" | "next" | "today") => void
  onAddHabit: () => void
}

export function TrackerHeader({
  view,
  onViewChange,
  selectedDate,
  weekStart,
  weekEnd,
  timezone,
  onNavigate,
  onAddHabit,
}: TrackerHeaderProps) {
  const dateLabel =
    view === "week"
      ? formatWeekRange(weekStart, weekEnd, timezone)
      : formatDayFull(selectedDate, timezone)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Habit tracker</h1>
        <p className="text-sm text-muted-foreground">Focus on small wins, every day.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-muted bg-background px-2 py-1">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{dateLabel}</span>
          <Button variant="ghost" size="icon-xs" className="size-6" onClick={() => onNavigate("prev")}>
            <ChevronLeft className="size-3" />
          </Button>
          <Button variant="ghost" size="icon-xs" className="size-6" onClick={() => onNavigate("next")}>
            <ChevronRight className="size-3" />
          </Button>
        </div>

        <Button variant="outline" size="xs" onClick={() => onNavigate("today")}>
          Today
        </Button>

        <Tabs value={view} onValueChange={(v) => onViewChange(v as "week" | "day")}>
          <TabsList className="h-8">
            <TabsTrigger value="week" className="h-6 px-3 text-xs">
              Week
            </TabsTrigger>
            <TabsTrigger value="day" className="h-6 px-3 text-xs">
              Day
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button size="sm" onClick={onAddHabit}>
          <Plus className="mr-1 size-3" />
          New habit
        </Button>
      </div>
    </div>
  )
}
