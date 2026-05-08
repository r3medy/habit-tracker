import { describe, it, expect } from "vitest"
import {
  habitSchema,
  goalSchema,
  journalSchema,
  userProfileSchema,
} from "@/lib/validation"

describe("validation schemas", () => {
  describe("habitSchema", () => {
    it("validates a complete habit", () => {
      const result = habitSchema.safeParse({
        name: "Exercise",
        icon: "RiRunLine",
        color: "teal",
        schedule_type: "daily",
      })
      expect(result.success).toBe(true)
    })

    it("rejects empty name", () => {
      const result = habitSchema.safeParse({
        name: "",
        icon: "RiRunLine",
        color: "teal",
        schedule_type: "daily",
      })
      expect(result.success).toBe(false)
    })

    it("rejects name over 50 chars", () => {
      const result = habitSchema.safeParse({
        name: "a".repeat(51),
        icon: "RiRunLine",
        color: "teal",
        schedule_type: "daily",
      })
      expect(result.success).toBe(false)
    })

    it("rejects missing icon", () => {
      const result = habitSchema.safeParse({
        name: "Exercise",
        color: "teal",
        schedule_type: "daily",
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid schedule_type", () => {
      const result = habitSchema.safeParse({
        name: "Exercise",
        icon: "RiRunLine",
        color: "teal",
        schedule_type: "invalid",
      })
      expect(result.success).toBe(false)
    })

    it("accepts optional schedule_days", () => {
      const result = habitSchema.safeParse({
        name: "Exercise",
        icon: "RiRunLine",
        color: "teal",
        schedule_type: "weekly",
        schedule_days: [1, 3, 5],
      })
      expect(result.success).toBe(true)
    })

    it("rejects schedule_days with invalid day numbers", () => {
      const result = habitSchema.safeParse({
        name: "Exercise",
        icon: "RiRunLine",
        color: "teal",
        schedule_type: "weekly",
        schedule_days: [0, 7],
      })
      expect(result.success).toBe(false)
    })
  })

  describe("goalSchema", () => {
    it("validates a streak goal", () => {
      const result = goalSchema.safeParse({
        target_type: "streak",
        target_value: 30,
        start_date: "2026-05-07",
        end_date: null,
      })
      expect(result.success).toBe(true)
    })

    it("validates a count goal", () => {
      const result = goalSchema.safeParse({
        target_type: "count",
        target_value: 100,
        start_date: "2026-05-07",
        end_date: "2026-06-07",
      })
      expect(result.success).toBe(true)
    })

    it("rejects zero target_value", () => {
      const result = goalSchema.safeParse({
        target_type: "streak",
        target_value: 0,
        start_date: "2026-05-07",
        end_date: null,
      })
      expect(result.success).toBe(false)
    })

    it("rejects negative target_value", () => {
      const result = goalSchema.safeParse({
        target_type: "streak",
        target_value: -5,
        start_date: "2026-05-07",
        end_date: null,
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid target_type", () => {
      const result = goalSchema.safeParse({
        target_type: "invalid",
        target_value: 30,
        start_date: "2026-05-07",
        end_date: null,
      })
      expect(result.success).toBe(false)
    })
  })

  describe("journalSchema", () => {
    it("validates content within limit", () => {
      const result = journalSchema.safeParse({ content: "Good day today" })
      expect(result.success).toBe(true)
    })

    it("validates null content", () => {
      const result = journalSchema.safeParse({ content: null })
      expect(result.success).toBe(true)
    })

    it("validates undefined content", () => {
      const result = journalSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it("rejects content over 2000 chars", () => {
      const result = journalSchema.safeParse({ content: "a".repeat(2001) })
      expect(result.success).toBe(false)
    })
  })

  describe("userProfileSchema", () => {
    it("validates a complete profile", () => {
      const result = userProfileSchema.safeParse({
        name: "John",
        timezone: "America/New_York",
      })
      expect(result.success).toBe(true)
    })

    it("rejects empty name", () => {
      const result = userProfileSchema.safeParse({
        name: "",
        timezone: "America/New_York",
      })
      expect(result.success).toBe(false)
    })

    it("rejects name over 50 chars", () => {
      const result = userProfileSchema.safeParse({
        name: "a".repeat(51),
        timezone: "America/New_York",
      })
      expect(result.success).toBe(false)
    })

    it("rejects empty timezone", () => {
      const result = userProfileSchema.safeParse({
        name: "John",
        timezone: "",
      })
      expect(result.success).toBe(false)
    })
  })
})
