"use client"

import { useState, useCallback, useMemo } from "react"
import { useHabits } from "@/hooks/use-habits"
import { useCompletions } from "@/hooks/use-completions"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getTodayInTimeZone } from "@/lib/date-utils"
import { getWeekRange, getDaysInWeek } from "@/lib/tracker-utils"
import { TrackerHeader } from "@/components/tracker/tracker-header"
import { DayResetIndicator } from "@/components/tracker/day-reset-indicator"
import { WeeklyView } from "@/components/tracker/weekly-view"
import { DailyView } from "@/components/tracker/daily-view"
import { AddHabitDialog } from "@/components/tracker/add-habit-dialog"
import { toast } from "sonner"
import type { HabitInsert } from "@/lib/supabase/types"

export default function TrackerPage() {
  const [view, setView] = useState<"week" | "day">("week")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const { profile } = useUserProfile()
  const timezone = profile?.timezone || "UTC"
  const today = getTodayInTimeZone(timezone)

  const [selectedDate, setSelectedDate] = useState(today)

  const { habits, isLoading: habitsLoading, createHabit, isCreating } = useHabits()

  const { start: weekStart, end: weekEnd } = useMemo(
    () => getWeekRange(selectedDate, timezone),
    [selectedDate, timezone]
  )
  const weekDays = useMemo(
    () => getDaysInWeek(weekStart, timezone),
    [weekStart, timezone]
  )

  // Weekly: fetch all 7 days
  const day0 = useCompletions(weekDays[0] || "", timezone)
  const day1 = useCompletions(weekDays[1] || "", timezone)
  const day2 = useCompletions(weekDays[2] || "", timezone)
  const day3 = useCompletions(weekDays[3] || "", timezone)
  const day4 = useCompletions(weekDays[4] || "", timezone)
  const day5 = useCompletions(weekDays[5] || "", timezone)
  const day6 = useCompletions(weekDays[6] || "", timezone)

  const weeklyCompletions = useMemo(() => ({
    [weekDays[0] || ""]: day0.completions || [],
    [weekDays[1] || ""]: day1.completions || [],
    [weekDays[2] || ""]: day2.completions || [],
    [weekDays[3] || ""]: day3.completions || [],
    [weekDays[4] || ""]: day4.completions || [],
    [weekDays[5] || ""]: day5.completions || [],
    [weekDays[6] || ""]: day6.completions || [],
  }), [weekDays, day0.completions, day1.completions, day2.completions, day3.completions, day4.completions, day5.completions, day6.completions])

  const weeklyLoading = day0.isLoading || day1.isLoading || day2.isLoading ||
    day3.isLoading || day4.isLoading || day5.isLoading || day6.isLoading

  // Daily: fetch single day
  const { completions: dailyCompletions, isLoading: dailyLoading, toggleCompletion, isToggling } = useCompletions(selectedDate, timezone)

  const isLoading = habitsLoading || weeklyLoading || dailyLoading

  const handleNavigate = useCallback(
    (direction: "prev" | "next" | "today") => {
      if (direction === "today") {
        setSelectedDate(today)
        return
      }
      const currentDate = new Date(selectedDate + "T00:00:00")
      const shift = view === "week" ? 7 : 1
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + (direction === "next" ? shift : -shift))
      setSelectedDate(newDate.toISOString().split("T")[0])
    },
    [selectedDate, view, today]
  )

  const handleToggleWeekly = useCallback(
    (habitId: string, date: string) => {
      const current = weeklyCompletions[date]?.find((c: { habit_id: string; completed: boolean }) => c.habit_id === habitId)
      toggleCompletion({ habitId, date, completed: !current?.completed })
    },
    [weeklyCompletions, toggleCompletion]
  )

  const handleToggleDaily = useCallback(
    (habitId: string, completed: boolean) => {
      toggleCompletion({ habitId, date: selectedDate, completed })
    },
    [selectedDate, toggleCompletion]
  )

  const handleAddHabit = useCallback(
    async (habit: HabitInsert) => {
      try {
        await createHabit(habit)
        setAddDialogOpen(false)
        toast.success("Habit added")
      } catch {
        toast.error("Failed to add habit")
      }
    },
    [createHabit]
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <TrackerHeader
        view={view}
        onViewChange={setView}
        selectedDate={selectedDate}
        weekStart={weekStart}
        weekEnd={weekEnd}
        timezone={timezone}
        onNavigate={handleNavigate}
        onAddHabit={() => setAddDialogOpen(true)}
      />

      <DayResetIndicator
        selectedDate={selectedDate}
        timezone={timezone}
        onBackToToday={() => setSelectedDate(today)}
      />

      {view === "week" ? (
        <WeeklyView
          habits={habits || []}
          weekDays={weekDays}
          completions={weeklyCompletions}
          onToggle={handleToggleWeekly}
          isToggling={isToggling}
          isLoading={isLoading}
        />
      ) : (
        <DailyView
          habits={habits || []}
          date={selectedDate}
          completions={dailyCompletions || []}
          streaks={{}}
          subtasks={{}}
          subtaskCompletions={{}}
          onToggle={handleToggleDaily}
          onToggleSubtask={() => {}}
          onToggleAllSubtasks={() => {}}
          isToggling={isToggling}
          isLoading={isLoading}
        />
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
