"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import type { HabitRow, HabitInsert, HabitUpdate } from "@/lib/supabase/types"

export function useHabits() {
  const queryClient = useQueryClient()

  const { data: habits, isLoading, error } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("sort_order", { ascending: true })
      if (error) throw error
      return (data || []) as HabitRow[]
    },
    staleTime: 1000 * 60 * 5,
  })

  const createMutation = useMutation({
    mutationFn: async (habit: HabitInsert) => {
      const { data, error } = await supabase
        .from("habits")
        .insert([habit] as any)
        .select()
        .single()
      if (error) throw error
      return data as HabitRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: HabitUpdate & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("habits")
        .update(updates)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data as HabitRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const promises = updates.map(({ id, sort_order }) =>
        (supabase as any).from("habits").update({ sort_order }).eq("id", id)
      )
      const results = await Promise.all(promises)
      const errors = results.filter((r) => r.error)
      if (errors.length > 0) throw errors[0].error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })

  return {
    habits,
    isLoading,
    error,
    createHabit: createMutation.mutateAsync,
    updateHabit: updateMutation.mutateAsync,
    deleteHabit: deleteMutation.mutateAsync,
    reorderHabits: reorderMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
