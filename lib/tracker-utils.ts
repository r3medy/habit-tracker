import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  isToday as dfnsIsToday,
  isAfter,
} from "date-fns"
import { toZonedTime, fromZonedTime } from "date-fns-tz"

export function getWeekRange(dateStr: string, timezone: string): { start: string; end: string } {
  const date = fromZonedTime(dateStr, timezone)
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  return {
    start: format(weekStart, "yyyy-MM-dd"),
    end: format(weekEnd, "yyyy-MM-dd"),
  }
}

export function getDaysInWeek(weekStartStr: string, timezone: string): string[] {
  const start = fromZonedTime(weekStartStr, timezone)
  const days = eachDayOfInterval({ start, end: addDays(start, 6) })
  return days.map((d) => format(d, "yyyy-MM-dd"))
}

export function formatDayShort(dateStr: string, timezone: string): string {
  const date = fromZonedTime(dateStr, timezone)
  return format(date, "EEE d")
}

export function formatDayFull(dateStr: string, timezone: string): string {
  const date = fromZonedTime(dateStr, timezone)
  return format(date, "EEEE, MMMM d")
}

export function formatWeekRange(startStr: string, endStr: string, timezone: string): string {
  const start = fromZonedTime(startStr, timezone)
  const end = fromZonedTime(endStr, timezone)
  const startMonth = format(start, "MMM")
  const endMonth = format(end, "MMM")

  if (startMonth === endMonth) {
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
  }
  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
}

export function isToday(dateStr: string, timezone: string): boolean {
  const date = fromZonedTime(dateStr, timezone)
  return dfnsIsToday(date)
}

export function isFuture(dateStr: string, timezone: string): boolean {
  const date = fromZonedTime(dateStr, timezone)
  const now = new Date()
  const zonedNow = toZonedTime(now, timezone)
  return isAfter(date, zonedNow)
}
