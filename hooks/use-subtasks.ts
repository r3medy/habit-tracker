"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { insertTyped, upsertTyped } from "@/lib/supabase/typed"
import type { SubtaskRow, SubtaskInsert, SubtaskCompletionRow, SubtaskCompletionInsert } from "@/lib/supabase/types"
import { getTodayInTimeZone } from "@/lib/date-utils"

export function useSubtasks(habitId: string, timezone?: string, todoId?: string) {
  const queryClient = useQueryClient()
  const today = timezone ? getTodayInTimeZone(timezone) : undefined

  const effectiveId = todoId || habitId
  const subtaskQueryKey = todoId ? ["subtasks", "todo", todoId] : ["subtasks", habitId]

  const { data: subtasks, isLoading, error } = useQuery({
    queryKey: subtaskQueryKey,
    queryFn: async () => {
      let query = supabase.from("subtasks").select("*")
      if (todoId) {
        query = query.eq("todo_id", todoId)
      } else {
        query = query.eq("habit_id", habitId)
      }
      const { data, error } = await query.order("sort_order", { ascending: true })
      if (error) throw error
      return (data || []) as SubtaskRow[]
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!effectiveId,
  })

  const completionsQueryKey = todoId
    ? ["subtask_completions", "todo", todoId, today]
    : ["subtask_completions", habitId, today]

  const { data: completions } = useQuery({
    queryKey: completionsQueryKey,
    queryFn: async () => {
      if (!today) return []
      let subsQuery = supabase.from("subtasks").select("id")
      if (todoId) {
        subsQuery = subsQuery.eq("todo_id", todoId)
      } else {
        subsQuery = subsQuery.eq("habit_id", habitId)
      }
      const { data: subs } = await subsQuery

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
    enabled: !!effectiveId && !!today,
  })

  const createMutation = useMutation({
    mutationFn: async ({ name, sort_order = 0 }: { name: string; sort_order?: number }) => {
      const payload: SubtaskInsert = todoId
        ? { todo_id: todoId, name, sort_order }
        : { habit_id: habitId, name, sort_order }
      const { data, error } = await insertTyped("subtasks", [payload])
      if (error) throw error
      return data as SubtaskRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subtaskQueryKey })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subtasks").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subtaskQueryKey })
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
      queryClient.invalidateQueries({ queryKey: completionsQueryKey })
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
