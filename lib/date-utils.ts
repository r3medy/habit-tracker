import {
  format,
  formatISO,
  parseISO,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  subDays,
  isToday,
  isYesterday,
  isSameDay,
  isAfter,
  isBefore,
  differenceInDays,
  getDay,
  getMonth,
  getYear,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from "date-fns"
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz"

export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function getTodayInTimeZone(timezone: string): string {
  const now = new Date()
  const zoned = toZonedTime(now, timezone)
  return format(zoned, "yyyy-MM-dd")
}

export function getDateInTimeZone(dateStr: string, timezone: string): Date {
  return fromZonedTime(dateStr, timezone)
}

export function formatDateForDisplay(dateStr: string, timezone: string): string {
  const date = parseISO(dateStr)
  return formatInTimeZone(date, timezone, "MMM d, yyyy")
}

export function formatDateShort(dateStr: string, timezone: string): string {
  const date = parseISO(dateStr)
  return formatInTimeZone(date, timezone, "MMM d")
}

export function getDayOfWeek(dateStr: string, timezone: string): number {
  const date = parseISO(dateStr)
  const zoned = toZonedTime(date, timezone)
  return getDay(zoned)
}

export function getWeekDays(weekStart: string, timezone: string): string[] {
  const start = parseISO(weekStart)
  const end = subDays(start, 6)
  const days = eachDayOfInterval({ start: end, end: start })
  return days.map((d) => format(toZonedTime(d, timezone), "yyyy-MM-dd")).reverse()
}

export function getLastNDays(n: number, timezone: string): string[] {
  const today = parseISO(getTodayInTimeZone(timezone))
  const days = eachDayOfInterval({ start: subDays(today, n - 1), end: today })
  return days.map((d) => format(d, "yyyy-MM-dd"))
}

export function isDateToday(dateStr: string, timezone: string): boolean {
  const today = getTodayInTimeZone(timezone)
  return dateStr === today
}

export function isDateYesterday(dateStr: string, timezone: string): boolean {
  const today = getTodayInTimeZone(timezone)
  const yesterday = format(subDays(parseISO(today), 1), "yyyy-MM-dd")
  return dateStr === yesterday
}

export function getMidnightResetDate(timezone: string): string {
  return getTodayInTimeZone(timezone)
}

export function hasDayChanged(lastVisited: string | null, timezone: string): boolean {
  if (!lastVisited) return true
  const today = getTodayInTimeZone(timezone)
  return lastVisited !== today
}

export function formatStreak(count: number): string {
  if (count === 0) return "0 days"
  if (count === 1) return "1 day"
  return `${count} days`
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}
