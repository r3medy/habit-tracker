import {
  differenceInDays,
  format,
  parseISO,
  subWeeks,
  eachWeekOfInterval,
  eachDayOfInterval,
} from "date-fns"
import { isHabitScheduledForDate } from "@/lib/habit-schedule-utils"

type HabitForAnalytics = {
  id: string
  schedule_type: "daily" | "weekly" | "monthly" | "custom"
  schedule_days: number[] | null
}

export type HabitStreakStat = {
  currentStreak: number
  longestStreak: number
}

export function getWeeklyProgress(
  completions: { completed: boolean }[],
  totalHabits: number
): { completed: number; total: number; percentage: number } {
  const completed = completions.filter((c) => c.completed).length
  const total = totalHabits * 7
  const percentage = total > 0 ? (completed / total) * 100 : 0
  return { completed, total, percentage }
}

export function getBestStreak(streaks: Record<string, number>): number {
  const values = Object.values(streaks)
  return values.length > 0 ? Math.max(...values) : 0
}

export function getBestPerfectDayStreak(
  completions: { habit_id: string; date: string; completed: boolean }[],
  habits: HabitForAnalytics[]
): number {
  if (habits.length === 0) return 0

  const completedByDate = new Map<string, Set<string>>()
  const dates = new Set<string>()

  for (const completion of completions) {
    dates.add(completion.date)
    if (!completion.completed) continue

    if (!completedByDate.has(completion.date)) {
      completedByDate.set(completion.date, new Set())
    }
    completedByDate.get(completion.date)!.add(completion.habit_id)
  }

  if (dates.size === 0) return 0

  const sortedDates = [...dates].sort()
  const days = eachDayOfInterval({
    start: parseISO(sortedDates[0]),
    end: parseISO(sortedDates[sortedDates.length - 1]),
  }).map((day) => format(day, "yyyy-MM-dd"))

  let best = 0
  let current = 0

  for (const date of days) {
    const scheduledHabits = habits.filter((habit) =>
      isHabitScheduledForDate(habit, date)
    )
    const completedHabitIds = completedByDate.get(date) || new Set<string>()
    const isPerfectDay =
      scheduledHabits.length > 0 &&
      scheduledHabits.every((habit) => completedHabitIds.has(habit.id))

    if (isPerfectDay) {
      current += 1
      best = Math.max(best, current)
    } else {
      current = 0
    }
  }

  return best
}

export function getScheduledProgress(
  completions: { habit_id: string; date: string; completed: boolean }[],
  habits: HabitForAnalytics[],
  dates: string[]
): { completed: number; total: number; percentage: number } {
  const completionLookup = new Set(
    completions
      .filter((completion) => completion.completed)
      .map((completion) => `${completion.date}:${completion.habit_id}`)
  )

  let completed = 0
  let total = 0

  for (const date of dates) {
    for (const habit of habits) {
      if (!isHabitScheduledForDate(habit, date)) continue

      total += 1
      if (completionLookup.has(`${date}:${habit.id}`)) {
        completed += 1
      }
    }
  }

  const percentage = total > 0 ? (completed / total) * 100 : 0
  return { completed, total, percentage }
}

function getLongestStreakFromDates(dates: Date[]): number {
  if (dates.length === 0) return 0

  let longestStreak = 1
  let currentStreak = 1

  for (let index = 1; index < dates.length; index++) {
    const diff = differenceInDays(dates[index - 1], dates[index])

    if (diff === 1) {
      currentStreak += 1
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return longestStreak
}

function getCurrentStreakFromDates(dates: Date[], today: Date): number {
  if (dates.length === 0) return 0

  const daysSinceMostRecent = differenceInDays(today, dates[0])
  if (daysSinceMostRecent > 1) return 0

  let currentStreak = 1

  for (let index = 1; index < dates.length; index++) {
    const diff = differenceInDays(dates[index - 1], dates[index])

    if (diff === 1) {
      currentStreak += 1
    } else {
      break
    }
  }

  return currentStreak
}

export function getHabitStreakStats(
  completions: { habit_id: string; date: string; completed: boolean }[],
  habits: { id: string }[],
  todayStr: string
): Record<string, HabitStreakStat> {
  const today = parseISO(todayStr)
  const datesByHabit = new Map<string, Set<string>>()

  for (const completion of completions) {
    if (!completion.completed) continue

    if (!datesByHabit.has(completion.habit_id)) {
      datesByHabit.set(completion.habit_id, new Set())
    }

    datesByHabit.get(completion.habit_id)!.add(completion.date)
  }

  const result: Record<string, HabitStreakStat> = {}

  for (const habit of habits) {
    const dates = [...(datesByHabit.get(habit.id) || [])]
      .map((date) => parseISO(date))
      .sort((a, b) => b.getTime() - a.getTime())

    result[habit.id] = {
      currentStreak: getCurrentStreakFromDates(dates, today),
      longestStreak: getLongestStreakFromDates(dates),
    }
  }

  return result
}

export function getTotalCompletions(
  completions: { completed: boolean }[]
): number {
  return completions.filter((c) => c.completed).length
}

export function getDailyAverage(
  weeklyCompletions: { completed: boolean }[][]
): number {
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
  const habitMap = new Map<
    string,
    { name: string; value: number; color: string }
  >()

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
): {
  week: string
  habit: string
  habitName: string
  count: number
  color: string
}[] {
  const now = new Date()
  const fourWeeksAgo = subWeeks(now, 4)
  const weeks = eachWeekOfInterval(
    { start: fourWeeksAgo, end: now },
    { weekStartsOn: 1 }
  ).slice(-4)

  const result: {
    week: string
    habit: string
    habitName: string
    count: number
    color: string
  }[] = []

  for (let i = 0; i < weeks.length; i++) {
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
