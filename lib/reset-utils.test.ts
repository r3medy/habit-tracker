import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@/lib/supabase/client", () => ({
  supabase: {},
}))

const {
  getLastVisitedDate,
  setLastVisitedDate,
  checkAndResetIfNeeded,
} = await import("@/lib/reset-utils")

const LAST_VISITED_KEY = "habit-tracker-last-visited"

describe("reset-utils", () => {
  beforeEach(() => {
    const store: Record<string, string> = {}
    vi.stubGlobal("localStorage", {
      getItem(key: string) {
        return store[key] || null
      },
      setItem(key: string, value: string) {
        store[key] = value
      },
      removeItem(key: string) {
        delete store[key]
      },
      clear() {
        Object.keys(store).forEach((k) => delete store[k])
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("getLastVisitedDate", () => {
    it("returns null when nothing is stored", () => {
      expect(getLastVisitedDate()).toBeNull()
    })

    it("returns the stored date", () => {
      setLastVisitedDate("2026-05-06")
      expect(getLastVisitedDate()).toBe("2026-05-06")
    })
  })

  describe("setLastVisitedDate", () => {
    it("stores the date in localStorage", () => {
      setLastVisitedDate("2026-05-07")
      expect(getLastVisitedDate()).toBe("2026-05-07")
    })
  })

  describe("checkAndResetIfNeeded", () => {
    it("returns true when lastVisited is null", () => {
      const result = checkAndResetIfNeeded("UTC")
      expect(result).toBe(true)
    })

    it("returns true when date has changed", () => {
      setLastVisitedDate("2020-01-01")
      const result = checkAndResetIfNeeded("UTC")
      expect(result).toBe(true)
    })

    it("returns false when date is today", () => {
      const today = new Date().toISOString().split("T")[0]
      setLastVisitedDate(today)
      const result = checkAndResetIfNeeded("UTC")
      expect(result).toBe(false)
    })

    it("updates localStorage when reset occurs", () => {
      setLastVisitedDate("2020-01-01")
      checkAndResetIfNeeded("UTC")
      const stored = getLastVisitedDate()
      expect(stored).not.toBe("2020-01-01")
    })
  })
})
