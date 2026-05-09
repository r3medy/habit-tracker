"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { upsertTyped } from "@/lib/supabase/typed"
import type { CompletionRow, CompletionInsert } from "@/lib/supabase/types"

export function useCompletionsRange(startDate: string, endDate: string) {
  const queryClient = useQueryClient()

  const {
    data: completions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["completions-range", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("completions")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
      if (error) throw error
      return (data || []) as CompletionRow[]
    },
    staleTime: 1000 * 60,
    enabled: !!startDate && !!endDate,
  })

  /** Group completions by date for easy lookup */
  const byDate = (completions || []).reduce<Record<string, CompletionRow[]>>(
    (acc, c) => {
      if (!acc[c.date]) acc[c.date] = []
      acc[c.date].push(c)
      return acc
    },
    {}
  )

  const toggleMutation = useMutation({
    mutationFn: async ({
      habitId,
      date,
      completed,
    }: {
      habitId: string
      date: string
      completed: boolean
    }) => {
      const payload: CompletionInsert = {
        habit_id: habitId,
        date,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      }
      const { data, error } = await upsertTyped("completions", [payload], {
        onConflict: "habit_id,date",
      })
      if (error) throw error
      return data as CompletionRow
    },
    onMutate: async ({ habitId, date, completed }) => {
      const key = ["completions-range", startDate, endDate]
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<CompletionRow[]>(key)

      queryClient.setQueryData<CompletionRow[]>(key, (old) => {
        const existing = old?.find(
          (c) => c.habit_id === habitId && c.date === date
        )
        if (existing) {
          return old?.map((c) =>
            c.habit_id === habitId && c.date === date
              ? {
                  ...c,
                  completed,
                  completed_at: completed ? new Date().toISOString() : null,
                }
              : c
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

      // Also update single-day cache if it exists
      const dayKey = ["completions", date]
      const dayPrevious = queryClient.getQueryData<CompletionRow[]>(dayKey)
      if (dayPrevious) {
        queryClient.setQueryData<CompletionRow[]>(dayKey, (old) => {
          const ex = old?.find((c) => c.habit_id === habitId)
          if (ex) {
            return old?.map((c) =>
              c.habit_id === habitId
                ? {
                    ...c,
                    completed,
                    completed_at: completed ? new Date().toISOString() : null,
                  }
                : c
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
      }

      return { previous, dayPrevious }
    },
    onError: (_err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["completions-range", startDate, endDate],
          context.previous
        )
      }
      if (context?.dayPrevious) {
        queryClient.setQueryData(
          ["completions", vars.date],
          context.dayPrevious
        )
      }
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["completions-range", startDate, endDate],
      })
      queryClient.invalidateQueries({ queryKey: ["completions", vars.date] })
      queryClient.invalidateQueries({ queryKey: ["streaks"] })
      queryClient.invalidateQueries({ queryKey: ["goal-completion-counts"] })
    },
  })

  return {
    completions,
    byDate,
    isLoading,
    error,
    toggleCompletion: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
  }
}
