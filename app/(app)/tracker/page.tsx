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
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import type { TodoRow } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { ListTodo } from "lucide-react"
import Link from "next/link"
import { useGoals } from "@/hooks/use-goals"
import { useStreaks } from "@/hooks/use-streaks"
import { GoalsSection } from "@/components/dashboard/goals-section"

export default function TrackerPage() {
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

  // Streaks for goals
  const streaks: Record<string, number> = {}
  const habit0 = habits?.[0]
  const habit1 = habits?.[1]
  const habit2 = habits?.[2]
  const habit3 = habits?.[3]
  const habit4 = habits?.[4]
  const s0 = useStreaks(habit0?.id || "", timezone)
  const s1 = useStreaks(habit1?.id || "", timezone)
  const s2 = useStreaks(habit2?.id || "", timezone)
  const s3 = useStreaks(habit3?.id || "", timezone)
  const s4 = useStreaks(habit4?.id || "", timezone)
  if (habit0) streaks[habit0.id] = s0.longestStreak
  if (habit1) streaks[habit1.id] = s1.longestStreak
  if (habit2) streaks[habit2.id] = s2.longestStreak
  if (habit3) streaks[habit3.id] = s3.longestStreak
  if (habit4) streaks[habit4.id] = s4.longestStreak

  // Today's todo count
  const { data: todayTodos } = useQuery({
    queryKey: ["todos", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("date", today)
        .order("sort_order", { ascending: true })
      if (error) throw error
      return (data || []) as TodoRow[]
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!today,
  })
  const incompleteCount = todayTodos?.filter((t) => !t.completed).length || 0

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
