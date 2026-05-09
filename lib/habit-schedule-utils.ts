import { getDay, parseISO } from "date-fns"

type HabitSchedule = {
  schedule_type: "daily" | "weekly" | "monthly" | "custom"
  schedule_days: number[] | null
}

export function isHabitScheduledForDate(
  habit: HabitSchedule,
  date: string
): boolean {
  if (habit.schedule_type === "daily") return true

  if (habit.schedule_type === "weekly") {
    if (!habit.schedule_days) return true
    return habit.schedule_days.includes(getDay(parseISO(date)))
  }

  return true
}
