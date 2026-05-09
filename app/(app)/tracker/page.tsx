"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useHabits } from "@/hooks/use-habits"
import { useCompletions } from "@/hooks/use-completions"
import { useCompletionsRange } from "@/hooks/use-completions-range"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getTodayInTimeZone } from "@/lib/date-utils"
import { getWeekRange, getDaysInWeek, isFuture } from "@/lib/tracker-utils"
import { TrackerHeader } from "@/components/tracker/tracker-header"
import { DayResetIndicator } from "@/components/tracker/day-reset-indicator"
import { WeeklyView } from "@/components/tracker/weekly-view"
import { DailyView } from "@/components/tracker/daily-view"
import { AddHabitDialog } from "@/components/tracker/add-habit-dialog"
import { toast } from "sonner"
import type { HabitInsert } from "@/lib/supabase/types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ListTodo } from "lucide-react"
import Link from "next/link"
import { useGoals } from "@/hooks/use-goals"
import { useAllStreaks } from "@/hooks/use-all-streaks"
import { GoalsSection } from "@/components/dashboard/goals-section"

export default function TrackerPage() {
  const router = useRouter()
  const [view, setView] = useState<"week" | "day">("week")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const { profile } = useUserProfile()
  const timezone = profile?.timezone || "UTC"
  const today = getTodayInTimeZone(timezone)

  const [selectedDate, setSelectedDate] = useState(today)

  const { habits, isLoading: habitsLoading, createHabit, isCreating } = useHabits()
  const { goals, isLoading: goalsLoading } = useGoals()

  const { start: weekStart, end: weekEnd } = useMemo(
    () => getWeekRange(selectedDate, timezone),
    [selectedDate, timezone]
  )
  const weekDays = useMemo(
    () => getDaysInWeek(weekStart, timezone),
    [weekStart, timezone]
  )

  // Weekly: single range query instead of 7 individual calls
  const {
    byDate: weeklyCompletions,
    isLoading: weeklyLoading,
    toggleCompletion,
    isToggling,
  } = useCompletionsRange(weekStart, weekEnd)

  // Daily: fetch single day (for the "day" tab view)
  const {
    completions: dailyCompletions,
    isLoading: dailyLoading,
    toggleCompletion: toggleDailyCompletion,
    isToggling: isDailyToggling,
  } = useCompletions(selectedDate, timezone)

  const isLoading = habitsLoading || weeklyLoading || dailyLoading

  // Streaks for goals
  const streaks = useAllStreaks(habits, timezone)

  // Today's incomplete todo count (head-only count, no data transfer)
  const { data: incompleteCount = 0 } = useQuery({
    queryKey: ["todos-incomplete-count", today],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("todos")
        .select("*", { count: "exact", head: true })
        .eq("date", today)
        .eq("completed", false)
      if (error) throw error
      return count || 0
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!today,
  })

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
      setSelectedDate(format(newDate, "yyyy-MM-dd"))
    },
    [selectedDate, view, today]
  )

  const handleDateSelect = useCallback(
    (date: string) => {
      router.push(`/day/${date}`)
    },
    [router]
  )

  const handleToggleWeekly = useCallback(
    (habitId: string, date: string) => {
      const current = weeklyCompletions[date]?.find(
        (c: { habit_id: string; completed: boolean }) => c.habit_id === habitId
      )
      toggleCompletion({ habitId, date, completed: !current?.completed })
    },
    [weeklyCompletions, toggleCompletion]
  )

  const handleToggleDaily = useCallback(
    (habitId: string, completed: boolean) => {
      toggleDailyCompletion({ habitId, date: selectedDate, completed })
    },
    [selectedDate, toggleDailyCompletion]
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
    <div className="mx-auto max-w-5xl space-y-8 overflow-x-hidden p-4 sm:p-6">
      <TrackerHeader
        view={view}
        onViewChange={setView}
        selectedDate={selectedDate}
        weekStart={weekStart}
        weekEnd={weekEnd}
        timezone={timezone}
        onNavigate={handleNavigate}
        onDateSelect={handleDateSelect}
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
          timezone={timezone}
        />
      ) : (
        <DailyView
          habits={habits || []}
          date={selectedDate}
          completions={dailyCompletions || []}
          streaks={{}}
          onToggle={handleToggleDaily}
          isToggling={isDailyToggling}
          isLoading={isLoading}
          isFutureDate={isFuture(selectedDate, timezone)}
        />
      )}

      {/* Todo recap */}
      {incompleteCount > 0 && (
        <div className="rounded-lg border border-muted bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="size-4 text-muted-foreground" />
              <span className="text-sm">
                {incompleteCount} todo{incompleteCount !== 1 ? "s" : ""} for today
              </span>
            </div>
            <Link href="/todos">
              <Button variant="ghost" size="xs">View</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Goals */}
      <GoalsSection
        goals={goals || []}
        habits={habits || []}
        streaks={streaks}
        isLoading={goalsLoading}
      />

      <AddHabitDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddHabit}
        isAdding={isCreating}
      />
    </div>
  )
}
