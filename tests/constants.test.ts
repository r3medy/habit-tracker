import { describe, it, expect } from "vitest"
import {
  HABIT_COLORS,
  HABIT_ICONS,
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_FULL,
  HEATMAP_LEVELS,
} from "@/lib/constants"

describe("constants", () => {
  describe("HABIT_COLORS", () => {
    it("has 8 color options", () => {
      expect(HABIT_COLORS).toHaveLength(8)
    })

    it("each color has required fields", () => {
      HABIT_COLORS.forEach((color) => {
        expect(color).toHaveProperty("name")
        expect(color).toHaveProperty("value")
        expect(color).toHaveProperty("light")
        expect(color).toHaveProperty("dark")
      })
    })

    it("values are unique", () => {
      const values = HABIT_COLORS.map((c) => c.value)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it("includes default colors", () => {
      const values = HABIT_COLORS.map((c) => c.value)
      expect(values).toContain("teal")
      expect(values).toContain("amber")
      expect(values).toContain("slate")
    })
  })

  describe("HABIT_ICONS", () => {
    it("has at least 10 icon options", () => {
      expect(HABIT_ICONS.length).toBeGreaterThanOrEqual(10)
    })

    it("each icon has required fields", () => {
      HABIT_ICONS.forEach((icon) => {
        expect(icon).toHaveProperty("name")
        expect(icon).toHaveProperty("value")
      })
    })

    it("icon values are valid Lucide icon names", () => {
      HABIT_ICONS.forEach((icon) => {
        expect(typeof icon.value).toBe("string")
        expect(icon.value.length).toBeGreaterThan(0)
        expect(icon.value[0]).toBe(icon.value[0].toUpperCase())
      })
    })

    it("values are unique", () => {
      const values = HABIT_ICONS.map((i) => i.value)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe("DAYS_OF_WEEK", () => {
    it("has 7 days", () => {
      expect(DAYS_OF_WEEK).toHaveLength(7)
    })

    it("starts with Sunday", () => {
      expect(DAYS_OF_WEEK[0]).toBe("Sun")
    })
  })

  describe("DAYS_OF_WEEK_FULL", () => {
    it("has 7 days", () => {
      expect(DAYS_OF_WEEK_FULL).toHaveLength(7)
    })

    it("starts with Sunday", () => {
      expect(DAYS_OF_WEEK_FULL[0]).toBe("Sunday")
    })

    it("all names are full words", () => {
      DAYS_OF_WEEK_FULL.forEach((day) => {
        expect(day.length).toBeGreaterThan(3)
      })
    })
  })

  describe("HEATMAP_LEVELS", () => {
    it("has 4 levels", () => {
      expect(HEATMAP_LEVELS).toHaveLength(4)
    })

    it("levels are 0-3", () => {
      const levels = HEATMAP_LEVELS.map((l) => l.level)
      expect(levels).toEqual([0, 1, 2, 3])
    })

    it("each level has a label", () => {
      HEATMAP_LEVELS.forEach((level) => {
        expect(level.label).toBeDefined()
        expect(typeof level.label).toBe("string")
      })
    })
  })
})
