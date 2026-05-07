import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const { supabase } = await import("@/lib/supabase/client")
const { useHabits } = await import("@/hooks/use-habits")

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("useHabits", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("query", () => {
    it("fetches habits ordered by sort_order", async () => {
      ;(supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
        })),
      })

      const { result } = renderHook(() => useHabits(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(supabase.from).toHaveBeenCalledWith("habits")
    })

    it("returns empty array when no habits exist", async () => {
      ;(supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
        })),
      })

      const { result } = renderHook(() => useHabits(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.habits).toEqual([])
    })

    it("returns habits when data exists", async () => {
      const mockHabits = [
        {
          id: "1",
          name: "Exercise",
          icon: "RiRunLine",
          color: "teal",
          schedule_type: "daily" as const,
          schedule_days: null,
          sort_order: 0,
          created_at: "2026-05-07T00:00:00Z",
        },
      ]

      ;(supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({ data: mockHabits, error: null })),
        })),
      })

      const { result } = renderHook(() => useHabits(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.habits).toHaveLength(1)
      expect(result.current.habits![0].name).toBe("Exercise")
    })
  })

  describe("createHabit", () => {
    it("creates a new habit", async () => {
      const newHabit = {
        id: "1",
        name: "Meditate",
        icon: "RiMindMap",
        color: "violet",
        schedule_type: "daily" as const,
        schedule_days: null,
        sort_order: 0,
        created_at: "2026-05-07T00:00:00Z",
      }

      ;(supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: newHabit, error: null })),
          })),
        })),
      })

      const { result } = renderHook(() => useHabits(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await result.current.createHabit({
        name: "Meditate",
        icon: "RiMindMap",
        color: "violet",
        schedule_type: "daily",
      })

      expect(supabase.from).toHaveBeenCalledWith("habits")
    })
  })

  describe("deleteHabit", () => {
    it("deletes a habit by id", async () => {
      ;(supabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({ error: null })),
        })),
      })

      const { result } = renderHook(() => useHabits(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await result.current.deleteHabit("habit-123")

      expect(supabase.from).toHaveBeenCalledWith("habits")
    })
  })
})
