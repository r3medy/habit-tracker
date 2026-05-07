import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  getUserTimeZone,
  getTodayInTimeZone,
  getDateInTimeZone,
  formatDateForDisplay,
  formatDateShort,
  getDayOfWeek,
  getWeekDays,
  getLastNDays,
  isDateToday,
  isDateYesterday,
  getMidnightResetDate,
  hasDayChanged,
  formatStreak,
  formatPercentage,
} from "@/lib/date-utils"

describe("date-utils", () => {
  const mockTimezone = "America/New_York"

  describe("getUserTimeZone", () => {
    it("returns the resolved timezone from Intl", () => {
      const tz = getUserTimeZone()
      expect(typeof tz).toBe("string")
      expect(tz.length).toBeGreaterThan(0)
    })
  })

  describe("getTodayInTimeZone", () => {
    it("returns today's date string in the given timezone", () => {
      const result = getTodayInTimeZone(mockTimezone)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it("returns a valid date string", () => {
      const result = getTodayInTimeZone(mockTimezone)
      const parsed = new Date(result)
      expect(parsed.toString()).not.toBe("Invalid Date")
    })
  })

  describe("getDateInTimeZone", () => {
    it("parses a date string into a Date object", () => {
      const result = getDateInTimeZone("2026-05-07", mockTimezone)
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe("formatDateForDisplay", () => {
    it("formats a date string for display", () => {
      const result = formatDateForDisplay("2026-05-07", mockTimezone)
      expect(typeof result).toBe("string")
    })
  })

  describe("formatDateShort", () => {
    it("formats a date string in short form", () => {
      const result = formatDateShort("2026-05-07", mockTimezone)
      expect(typeof result).toBe("string")
    })
  })

  describe("getDayOfWeek", () => {
    it("returns a number between 0 and 6", () => {
      const result = getDayOfWeek("2026-05-07", mockTimezone)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(6)
    })
  })

  describe("getWeekDays", () => {
    it("returns 7 date strings for a week", () => {
      const result = getWeekDays("2026-05-19", mockTimezone)
      expect(result).toHaveLength(7)
      result.forEach((d) => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/))
    })

    it("returns dates in reverse chronological order", () => {
      const result = getWeekDays("2026-05-19", mockTimezone)
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i] >= result[i + 1]).toBe(true)
      }
    })
  })

  describe("getLastNDays", () => {
    it("returns N date strings", () => {
      const result = getLastNDays(7, mockTimezone)
      expect(result).toHaveLength(7)
    })

    it("returns dates in chronological order", () => {
      const result = getLastNDays(5, mockTimezone)
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i] <= result[i + 1]).toBe(true)
      }
    })
  })

  describe("isDateToday", () => {
    it("returns true for today's date", () => {
      const today = getTodayInTimeZone(mockTimezone)
      expect(isDateToday(today, mockTimezone)).toBe(true)
    })

    it("returns false for a different date", () => {
      expect(isDateToday("2020-01-01", mockTimezone)).toBe(false)
    })
  })

  describe("isDateYesterday", () => {
    it("returns false for today", () => {
      const today = getTodayInTimeZone(mockTimezone)
      expect(isDateYesterday(today, mockTimezone)).toBe(false)
    })
  })

  describe("getMidnightResetDate", () => {
    it("returns today's date string", () => {
      const result = getMidnightResetDate(mockTimezone)
      const today = getTodayInTimeZone(mockTimezone)
      expect(result).toBe(today)
    })
  })

  describe("hasDayChanged", () => {
    it("returns true when lastVisited is null", () => {
      expect(hasDayChanged(null, mockTimezone)).toBe(true)
    })

    it("returns true when dates differ", () => {
      expect(hasDayChanged("2026-05-06", mockTimezone)).toBe(true)
    })

    it("returns false when dates match", () => {
      const today = getTodayInTimeZone(mockTimezone)
      expect(hasDayChanged(today, mockTimezone)).toBe(false)
    })
  })

  describe("formatStreak", () => {
    it("formats 0 as '0 days'", () => {
      expect(formatStreak(0)).toBe("0 days")
    })

    it("formats 1 as '1 day'", () => {
      expect(formatStreak(1)).toBe("1 day")
    })

    it("formats 5 as '5 days'", () => {
      expect(formatStreak(5)).toBe("5 days")
    })

    it("formats 100 as '100 days'", () => {
      expect(formatStreak(100)).toBe("100 days")
    })
  })

  describe("formatPercentage", () => {
    it("rounds to nearest integer", () => {
      expect(formatPercentage(78.4)).toBe("78%")
      expect(formatPercentage(78.6)).toBe("79%")
    })

    it("handles 0", () => {
      expect(formatPercentage(0)).toBe("0%")
    })

    it("handles 100", () => {
      expect(formatPercentage(100)).toBe("100%")
    })
  })
})
