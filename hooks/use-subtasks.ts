"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { insertTyped, upsertTyped } from "@/lib/supabase/typed"
import type { SubtaskRow, SubtaskInsert, SubtaskCompletionRow, SubtaskCompletionInsert } from "@/lib/supabase/types"
import { getTodayInTimeZone } from "@/lib/date-utils"

export function useSubtasks(habitId: string, timezone?: string) {
  const queryClient = useQueryClient()
  const today = timezone ? getTodayInTimeZone(timezone) : undefined

  const { data: subtasks, isLoading, error } = useQuery({
    queryKey: ["subtasks", habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subtasks")
        .select("*")
        .eq("habit_id", habitId)
        .order("sort_order", { ascending: true })
      if (error) throw error
      return (data || []) as SubtaskRow[]
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!habitId,
  })

  const { data: completions } = useQuery({
    queryKey: ["subtask_completions", habitId, today],
    queryFn: async () => {
      if (!today) return []
      const { data: subs } = await supabase
        .from("subtasks")
        .select("id")
        .eq("habit_id", habitId)

      if (!subs || subs.length === 0) return []

      const subtaskIds = subs.map((s) => (s as { id: string }).id)
      const { data, error } = await supabase
        .from("subtask_completions")
        .select("*")
        .in("subtask_id", subtaskIds)
        .eq("date", today)

      if (error) throw error
      return (data || []) as SubtaskCompletionRow[]
    },
    enabled: !!habitId && !!today,
  })

  const createMutation = useMutation({
    mutationFn: async ({ habitId, name, sort_order = 0 }: { habitId: string; name: string; sort_order?: number }) => {
      const payload: SubtaskInsert = { habit_id: habitId, name, sort_order }
      const { data, error } = await insertTyped("subtasks", [payload])
      if (error) throw error
      return data as SubtaskRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", habitId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subtasks").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", habitId] })
    },
  })

  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ subtaskId, date, completed }: { subtaskId: string; date: string; completed: boolean }) => {
      const payload: SubtaskCompletionInsert = {
        subtask_id: subtaskId,
        date,
        completed,
      }
      const { data, error } = await upsertTyped("subtask_completions", [payload], { onConflict: "subtask_id,date" })
      if (error) throw error
      return data as SubtaskCompletionRow
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["subtask_completions", habitId, today] })
    },
  })

  return {
    subtasks,
    completions,
    isLoading,
    error,
    createSubtask: createMutation.mutateAsync,
    deleteSubtask: deleteMutation.mutateAsync,
    toggleSubtaskCompletion: toggleCompletionMutation.mutateAsync,
  }
}
