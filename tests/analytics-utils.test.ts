import { describe, it, expect } from "vitest"
import {
  getWeeklyProgress,
  getBestStreak,
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
      expect(result.total).toBe(3)
      expect(result.percentage).toBeCloseTo(66.67, 1)
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
      expect(getDailyAverage(weeklyCompletions)).toBeCloseTo(2, 1)
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
