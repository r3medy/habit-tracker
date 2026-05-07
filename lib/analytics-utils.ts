import type { CompletionRow, HabitRow } from "@/lib/supabase/types"
import { format, parseISO, startOfWeek, subWeeks, eachWeekOfInterval } from "date-fns"
import { toZonedTime } from "date-fns-tz"

export function getWeeklyProgress(
  completions: { completed: boolean }[],
  totalHabits: number
): { completed: number; total: number; percentage: number } {
  const completed = completions.filter((c) => c.completed).length
  const total = completions.length || totalHabits * 7
  const percentage = total > 0 ? (completed / total) * 100 : 0
  return { completed, total, percentage }
}

export function getBestStreak(streaks: Record<string, number>): number {
  const values = Object.values(streaks)
  return values.length > 0 ? Math.max(...values) : 0
}

export function getTotalCompletions(completions: { completed: boolean }[]): number {
  return completions.filter((c) => c.completed).length
}

export function getDailyAverage(weeklyCompletions: { completed: boolean }[][]): number {
  if (weeklyCompletions.length === 0) return 0
  const total = weeklyCompletions.flat().filter((c) => c.completed).length
  return total / 7
}

export function getHeatmapLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  return 3
}

export function getPieData(
  completions: { habit_id: string; completed: boolean }[],
  habits: { id: string; name: string; color: string }[]
): { name: string; value: number; color: string }[] {
  const habitMap = new Map<string, { name: string; value: number; color: string }>()

  for (const habit of habits) {
    habitMap.set(habit.id, { name: habit.name, value: 0, color: habit.color })
  }

  for (const c of completions) {
    if (c.completed && habitMap.has(c.habit_id)) {
      const entry = habitMap.get(c.habit_id)!
      entry.value += 1
    }
  }

  return Array.from(habitMap.values()).filter((h) => h.value > 0)
}

export function getWeeklyBarData(
  completions: { habit_id: string; completed: boolean; date: string }[],
  habits: { id: string; name: string; color: string }[]
): { week: string; habit: string; habitName: string; count: number; color: string }[] {
  const now = new Date()
  const fourWeeksAgo = subWeeks(now, 4)
  const weeks = eachWeekOfInterval({ start: fourWeeksAgo, end: now }, { weekStartsOn: 1 })

  const result: { week: string; habit: string; habitName: string; count: number; color: string }[] = []

  for (let i = 0; i < weeks.length && i < 4; i++) {
    const weekStart = weeks[i]
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const weekLabel = `Week ${i + 1}`

    for (const habit of habits) {
      const count = completions.filter((c) => {
        if (!c.completed || c.habit_id !== habit.id) return false
        const d = parseISO(c.date)
        return d >= weekStart && d <= weekEnd
      }).length

      result.push({
        week: weekLabel,
        habit: habit.id,
        habitName: habit.name,
        count,
        color: habit.color,
      })
    }
  }

  return result
}
