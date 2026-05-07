"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from "lucide-react"
import { formatWeekRange, formatDayFull } from "@/lib/tracker-utils"
import { parseISO } from "date-fns"

interface TrackerHeaderProps {
  view: "week" | "day"
  onViewChange: (view: "week" | "day") => void
  selectedDate: string
  weekStart: string
  weekEnd: string
  timezone: string
  onNavigate: (direction: "prev" | "next" | "today") => void
  onDateSelect: (date: string) => void
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
  onDateSelect,
  onAddHabit,
}: TrackerHeaderProps) {
  const dateLabel =
    view === "week"
      ? formatWeekRange(weekStart, weekEnd, timezone)
      : formatDayFull(selectedDate, timezone)

  const calendarDate = parseISO(selectedDate)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Habit tracker</h1>
        <p className="text-sm text-muted-foreground">Focus on small wins, every day.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 rounded-lg border border-muted bg-background px-2 py-1 hover:bg-muted/50 transition-colors">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{dateLabel}</span>
              <Button variant="ghost" size="icon-xs" className="size-6" onClick={(e) => { e.stopPropagation(); onNavigate("prev") }}>
                <ChevronLeft className="size-3" />
              </Button>
              <Button variant="ghost" size="icon-xs" className="size-6" onClick={(e) => { e.stopPropagation(); onNavigate("next") }}>
                <ChevronRight className="size-3" />
              </Button>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={(d) => d && onDateSelect(d.toISOString().split("T")[0])}
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>

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
