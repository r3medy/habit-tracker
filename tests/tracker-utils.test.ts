import { describe, it, expect } from "vitest"
import {
  getWeekRange,
  getDaysInWeek,
  formatDayShort,
  formatDayFull,
  formatWeekRange,
  isToday,
  isFuture,
} from "@/lib/tracker-utils"

describe("tracker-utils", () => {
  const mockTimezone = "America/New_York"

  describe("getWeekRange", () => {
    it("returns Monday-Sunday range for a Wednesday", () => {
      const { start, end } = getWeekRange("2026-05-13", mockTimezone)
      expect(start).toBe("2026-05-11")
      expect(end).toBe("2026-05-17")
    })

    it("returns same day for Monday input", () => {
      const { start } = getWeekRange("2026-05-11", mockTimezone)
      expect(start).toBe("2026-05-11")
    })

    it("returns correct range for Sunday input", () => {
      const { start, end } = getWeekRange("2026-05-17", mockTimezone)
      expect(start).toBe("2026-05-11")
      expect(end).toBe("2026-05-17")
    })
  })

  describe("getDaysInWeek", () => {
    it("returns 7 dates starting from Monday", () => {
      const days = getDaysInWeek("2026-05-11", mockTimezone)
      expect(days).toHaveLength(7)
      expect(days[0]).toBe("2026-05-11")
      expect(days[6]).toBe("2026-05-17")
    })

    it("returns dates in chronological order", () => {
      const days = getDaysInWeek("2026-05-11", mockTimezone)
      for (let i = 0; i < days.length - 1; i++) {
        expect(days[i] < days[i + 1]).toBe(true)
      }
    })
  })

  describe("formatDayShort", () => {
    it("formats as 'Mon 11'", () => {
      expect(formatDayShort("2026-05-11", mockTimezone)).toBe("Mon 11")
    })

    it("formats single digit days without leading zero", () => {
      expect(formatDayShort("2026-05-01", mockTimezone)).toBe("Fri 1")
    })
  })

  describe("formatDayFull", () => {
    it("formats as 'Monday, May 11'", () => {
      expect(formatDayFull("2026-05-11", mockTimezone)).toBe("Monday, May 11")
    })
  })

  describe("formatWeekRange", () => {
    it("formats as 'May 11 – May 17, 2026'", () => {
      expect(formatWeekRange("2026-05-11", "2026-05-17", mockTimezone)).toBe("May 11 – May 17, 2026")
    })

    it("handles cross-month ranges", () => {
      expect(formatWeekRange("2026-05-26", "2026-06-01", mockTimezone)).toBe("May 26 – Jun 1, 2026")
    })
  })

  describe("isToday", () => {
    it("returns true for today's date", () => {
      const today = new Date().toISOString().split("T")[0]
      expect(isToday(today, mockTimezone)).toBe(true)
    })

    it("returns false for a different date", () => {
      expect(isToday("2020-01-01", mockTimezone)).toBe(false)
    })
  })

  describe("isFuture", () => {
    it("returns false for today", () => {
      const today = new Date().toISOString().split("T")[0]
      expect(isFuture(today, mockTimezone)).toBe(false)
    })

    it("returns false for yesterday", () => {
      expect(isFuture("2020-01-01", mockTimezone)).toBe(false)
    })

    it("returns true for tomorrow", () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]
      expect(isFuture(tomorrow, mockTimezone)).toBe(true)
    })
  })
})
