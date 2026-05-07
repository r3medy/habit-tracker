import { describe, it, expect } from "vitest"
import { parseISO, subDays, format, differenceInDays } from "date-fns"

function calculateStreaks(
  completedDates: string[],
  todayStr: string
): { currentStreak: number; longestStreak: number } {
  const todayDate = parseISO(todayStr)
  const uniqueDates = [...new Set(completedDates.map((d) => parseISO(d)).map((d) => format(d, "yyyy-MM-dd")))]
    .map((d) => parseISO(d))
    .sort((a, b) => b.getTime() - a.getTime())

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  const mostRecent = uniqueDates[0]
  const daysSinceMostRecent = differenceInDays(todayDate, mostRecent)

  if (daysSinceMostRecent > 1) {
    const longestStreak = calculateLongestStreak(uniqueDates)
    return { currentStreak: 0, longestStreak }
  }

  let currentStreak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = uniqueDates[i - 1]
    const currDate = uniqueDates[i]
    const diff = differenceInDays(prevDate, currDate)
    if (diff === 1) {
      currentStreak++
    } else {
      break
    }
  }

  const longestStreak = calculateLongestStreak(uniqueDates)

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) }
}

function calculateLongestStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInDays(dates[i - 1], dates[i])
    if (diff === 1) {
      current++
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }

  return longest
}

describe("streak calculation", () => {
  const today = "2026-05-07"

  it("returns 0 for no completions", () => {
    const result = calculateStreaks([], today)
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(0)
  })

  it("returns 1 for a single completion today", () => {
    const result = calculateStreaks([today], today)
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })

  it("returns 1 for a single completion yesterday", () => {
    const yesterday = format(subDays(parseISO(today), 1), "yyyy-MM-dd")
    const result = calculateStreaks([yesterday], today)
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })

  it("returns 0 current streak for a completion 2+ days ago", () => {
    const twoDaysAgo = format(subDays(parseISO(today), 2), "yyyy-MM-dd")
    const result = calculateStreaks([twoDaysAgo], today)
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(1)
  })

  it("calculates a 3-day current streak", () => {
    const dates = [
      today,
      format(subDays(parseISO(today), 1), "yyyy-MM-dd"),
      format(subDays(parseISO(today), 2), "yyyy-MM-dd"),
    ]
    const result = calculateStreaks(dates, today)
    expect(result.currentStreak).toBe(3)
    expect(result.longestStreak).toBe(3)
  })

  it("calculates longest streak when current is broken", () => {
    const dates = [
      today,
      format(subDays(parseISO(today), 5), "yyyy-MM-dd"),
      format(subDays(parseISO(today), 6), "yyyy-MM-dd"),
      format(subDays(parseISO(today), 7), "yyyy-MM-dd"),
    ]
    const result = calculateStreaks(dates, today)
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(3)
  })

  it("handles a long streak correctly", () => {
    const dates: string[] = []
    for (let i = 0; i < 30; i++) {
      dates.push(format(subDays(parseISO(today), i), "yyyy-MM-dd"))
    }
    const result = calculateStreaks(dates, today)
    expect(result.currentStreak).toBe(30)
    expect(result.longestStreak).toBe(30)
  })

  it("handles non-consecutive dates correctly", () => {
    const dates = [
      today,
      format(subDays(parseISO(today), 3), "yyyy-MM-dd"),
      format(subDays(parseISO(today), 7), "yyyy-MM-dd"),
    ]
    const result = calculateStreaks(dates, today)
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })

  it("handles duplicate dates gracefully", () => {
    const dates = [today, today, today]
    const result = calculateStreaks(dates, today)
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })
})
