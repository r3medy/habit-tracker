"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { upsertTyped } from "@/lib/supabase/typed"
import type { CompletionRow, CompletionInsert } from "@/lib/supabase/types"
import { getTodayInTimeZone } from "@/lib/date-utils"

export function useCompletions(date?: string, timezone?: string) {
  const queryClient = useQueryClient()
  const queryDate = date || (timezone ? getTodayInTimeZone(timezone) : undefined)

  const { data: completions, isLoading, error } = useQuery({
    queryKey: ["completions", queryDate],
    queryFn: async () => {
      if (!queryDate) return []
      const { data, error } = await supabase
        .from("completions")
        .select("*")
        .eq("date", queryDate)
      if (error) throw error
      return (data || []) as CompletionRow[]
    },
    staleTime: queryDate === getTodayInTimeZone(timezone || "UTC") ? 1000 * 60 : 1000 * 60 * 10,
    enabled: !!queryDate,
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: string; date: string; completed: boolean }) => {
      const payload: CompletionInsert = {
        habit_id: habitId,
        date,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      }
      const { data, error } = await upsertTyped("completions", [payload], { onConflict: "habit_id,date" })
      if (error) throw error
      return data as CompletionRow
    },
    onMutate: async ({ habitId, date, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["completions", date] })
      const previous = queryClient.getQueryData<CompletionRow[]>(["completions", date])

      queryClient.setQueryData<CompletionRow[]>(["completions", date], (old) => {
        const existing = old?.find((c) => c.habit_id === habitId)
        if (existing) {
          return old?.map((c) =>
            c.habit_id === habitId ? { ...c, completed, completed_at: completed ? new Date().toISOString() : null } : c
          )
        }
        return [
          ...(old || []),
          {
            id: crypto.randomUUID(),
            habit_id: habitId,
            date,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
        ]
      })

      return { previous }
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["completions", vars.date], context.previous)
      }
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({ queryKey: ["completions", vars.date] })
      queryClient.invalidateQueries({ queryKey: ["streaks"] })
    },
  })

  return {
    completions,
    isLoading,
    error,
    toggleCompletion: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
  }
}
