import { describe, it, expect } from "vitest"
import {
  getWeeklyProgress,
  getBestStreak,
  getBestPerfectDayStreak,
  getHabitStreakStats,
  getScheduledProgress,
  getTotalCompletions,
  getDailyAverage,
  getHeatmapLevel,
  getPieData,
  getWeeklyBarData,
} from "@/lib/analytics-utils"

describe("analytics-utils", () => {
  describe("getWeeklyProgress", () => {
    it("calculates percentage from completions", () => {
      const completions = [
        { habit_id: "1", completed: true },
        { habit_id: "2", completed: false },
        { habit_id: "3", completed: true },
      ]
      const result = getWeeklyProgress(completions, 3)
      expect(result.completed).toBe(2)
      expect(result.total).toBe(21)
      expect(result.percentage).toBeCloseTo(9.52, 1)
    })

    it("handles empty completions", () => {
      const result = getWeeklyProgress([], 0)
      expect(result.percentage).toBe(0)
    })
  })

  describe("getBestStreak", () => {
    it("returns max longestStreak", () => {
      const streaks = { h1: 5, h2: 12, h3: 3 }
      expect(getBestStreak(streaks)).toBe(12)
    })

    it("returns 0 for empty", () => {
      expect(getBestStreak({})).toBe(0)
    })
  })

  describe("getBestPerfectDayStreak", () => {
    const habits = [
      {
        id: "h1",
        schedule_type: "daily" as const,
        schedule_days: null,
      },
      {
        id: "h2",
        schedule_type: "daily" as const,
        schedule_days: null,
      },
    ]

    it("counts consecutive days where every habit is completed", () => {
      const completions = [
        { habit_id: "h1", date: "2026-05-01", completed: true },
        { habit_id: "h2", date: "2026-05-01", completed: true },
        { habit_id: "h1", date: "2026-05-02", completed: true },
        { habit_id: "h2", date: "2026-05-02", completed: true },
        { habit_id: "h1", date: "2026-05-03", completed: true },
        { habit_id: "h2", date: "2026-05-03", completed: true },
      ]

      expect(getBestPerfectDayStreak(completions, habits)).toBe(3)
    })

    it("breaks the streak on days with incomplete habits", () => {
      const completions = [
        { habit_id: "h1", date: "2026-05-01", completed: true },
        { habit_id: "h2", date: "2026-05-01", completed: true },
        { habit_id: "h1", date: "2026-05-02", completed: true },
        { habit_id: "h2", date: "2026-05-02", completed: false },
        { habit_id: "h1", date: "2026-05-03", completed: true },
        { habit_id: "h2", date: "2026-05-03", completed: true },
        { habit_id: "h1", date: "2026-05-04", completed: true },
        { habit_id: "h2", date: "2026-05-04", completed: true },
      ]

      expect(getBestPerfectDayStreak(completions, habits)).toBe(2)
    })

    it("counts only scheduled weekly habits for that date", () => {
      const weeklyHabits = [
        {
          id: "daily",
          schedule_type: "daily" as const,
          schedule_days: null,
        },
        {
          id: "weekday",
          schedule_type: "weekly" as const,
          schedule_days: [1],
        },
      ]
      const completions = [
        { habit_id: "daily", date: "2026-05-10", completed: true },
        { habit_id: "daily", date: "2026-05-11", completed: true },
        { habit_id: "weekday", date: "2026-05-11", completed: true },
      ]

      expect(getBestPerfectDayStreak(completions, weeklyHabits)).toBe(2)
    })
  })

  describe("getScheduledProgress", () => {
    it("uses scheduled habit days as the denominator", () => {
      const habits = [
        {
          id: "daily",
          schedule_type: "daily" as const,
          schedule_days: null,
        },
        {
          id: "weekday",
          schedule_type: "weekly" as const,
          schedule_days: [1],
        },
      ]
      const completions = [
        { habit_id: "daily", date: "2026-05-10", completed: true },
        { habit_id: "daily", date: "2026-05-11", completed: true },
        { habit_id: "weekday", date: "2026-05-11", completed: false },
      ]

      const result = getScheduledProgress(completions, habits, [
        "2026-05-10",
        "2026-05-11",
      ])

      expect(result.completed).toBe(2)
      expect(result.total).toBe(3)
      expect(result.percentage).toBeCloseTo(66.67, 1)
    })
  })

  describe("getHabitStreakStats", () => {
    const habits = [
      {
        id: "h1",
        name: "Exercise",
        icon: "activity",
        color: "teal",
        schedule_type: "daily" as const,
        schedule_days: null,
        sort_order: 0,
        created_at: "2026-01-01",
      },
      {
        id: "h2",
        name: "Reading",
        icon: "book",
        color: "amber",
        schedule_type: "daily" as const,
        schedule_days: null,
        sort_order: 1,
        created_at: "2026-01-01",
      },
    ]

    it("calculates current and longest streaks per habit", () => {
      const completions = [
        { habit_id: "h1", date: "2026-05-01", completed: true },
        { habit_id: "h1", date: "2026-05-02", completed: true },
        { habit_id: "h1", date: "2026-05-05", completed: true },
        { habit_id: "h1", date: "2026-05-06", completed: true },
        { habit_id: "h1", date: "2026-05-07", completed: true },
        { habit_id: "h2", date: "2026-05-03", completed: true },
        { habit_id: "h2", date: "2026-05-04", completed: true },
      ]

      const result = getHabitStreakStats(completions, habits, "2026-05-07")

      expect(result.h1).toEqual({ currentStreak: 3, longestStreak: 3 })
      expect(result.h2).toEqual({ currentStreak: 0, longestStreak: 2 })
    })

    it("allows a current streak to end yesterday", () => {
      const completions = [
        { habit_id: "h1", date: "2026-05-05", completed: true },
        { habit_id: "h1", date: "2026-05-06", completed: true },
      ]

      const result = getHabitStreakStats(completions, habits, "2026-05-07")

      expect(result.h1).toEqual({ currentStreak: 2, longestStreak: 2 })
    })

    it("ignores incomplete and duplicate completion rows", () => {
      const completions = [
        { habit_id: "h1", date: "2026-05-06", completed: true },
        { habit_id: "h1", date: "2026-05-06", completed: true },
        { habit_id: "h1", date: "2026-05-07", completed: false },
      ]

      const result = getHabitStreakStats(completions, habits, "2026-05-07")

      expect(result.h1).toEqual({ currentStreak: 1, longestStreak: 1 })
    })

    it("returns zero streaks for habits with no completions", () => {
      const result = getHabitStreakStats([], habits, "2026-05-07")

      expect(result.h1).toEqual({ currentStreak: 0, longestStreak: 0 })
      expect(result.h2).toEqual({ currentStreak: 0, longestStreak: 0 })
    })
  })

  describe("getTotalCompletions", () => {
    it("counts completed completions", () => {
      const completions = [
        { completed: true },
        { completed: false },
        { completed: true },
        { completed: true },
      ]
      expect(getTotalCompletions(completions)).toBe(3)
    })
  })

  describe("getDailyAverage", () => {
    it("calculates average per day", () => {
      const weeklyCompletions = [
        [{ completed: true }, { completed: true }],
        [{ completed: false }],
        [{ completed: true }, { completed: true }, { completed: true }],
      ]
      expect(getDailyAverage(weeklyCompletions)).toBeCloseTo(0.71, 1)
    })
  })

  describe("getHeatmapLevel", () => {
    it("returns 0 for no completions", () => {
      expect(getHeatmapLevel(0)).toBe(0)
    })

    it("returns 1 for 1-2 completions", () => {
      expect(getHeatmapLevel(1)).toBe(1)
      expect(getHeatmapLevel(2)).toBe(1)
    })

    it("returns 2 for 3-4 completions", () => {
      expect(getHeatmapLevel(3)).toBe(2)
      expect(getHeatmapLevel(4)).toBe(2)
    })

    it("returns 3 for 5+ completions", () => {
      expect(getHeatmapLevel(5)).toBe(3)
      expect(getHeatmapLevel(10)).toBe(3)
    })
  })

  describe("getPieData", () => {
    it("aggregates completions by habit", () => {
      const completions = [
        { habit_id: "h1", completed: true },
        { habit_id: "h1", completed: true },
        { habit_id: "h2", completed: true },
      ]
      const habits = [
        { id: "h1", name: "Exercise", color: "teal" },
        { id: "h2", name: "Reading", color: "amber" },
      ]
      const result = getPieData(completions, habits)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe("Exercise")
      expect(result[0].value).toBe(2)
      expect(result[1].name).toBe("Reading")
      expect(result[1].value).toBe(1)
    })
  })

  describe("getWeeklyBarData", () => {
    it("groups completions by week and habit", () => {
      const completions = [
        { habit_id: "h1", completed: true, date: "2026-05-04" },
        { habit_id: "h1", completed: true, date: "2026-05-11" },
        { habit_id: "h2", completed: true, date: "2026-05-05" },
      ]
      const habits = [
        { id: "h1", name: "Exercise", color: "teal" },
        { id: "h2", name: "Reading", color: "amber" },
      ]
      const result = getWeeklyBarData(completions, habits)
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
