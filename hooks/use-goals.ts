"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import type { GoalRow, GoalInsert, GoalMilestoneInsert } from "@/lib/supabase/types"

export function useGoals(habitId?: string) {
  const queryClient = useQueryClient()

  const { data: goals, isLoading, error } = useQuery({
    queryKey: ["goals", habitId],
    queryFn: async () => {
      let query = supabase.from("goals").select("*").order("created_at", { ascending: false })
      if (habitId) {
        query = query.eq("habit_id", habitId)
      }
      const { data, error } = await query
      if (error) throw error
      return (data || []) as GoalRow[]
    },
    staleTime: 1000 * 60 * 5,
  })

  const createMutation = useMutation({
    mutationFn: async (goal: GoalInsert) => {
      const { data, error } = await supabase
        .from("goals")
        .insert([goal] as any)
        .select()
        .single()
      if (error) throw error

      const goalId = (data as GoalRow).id

      const milestones: GoalMilestoneInsert[] = [25, 50, 75].map((threshold_pct) => ({
        goal_id: goalId,
        threshold_pct,
        reached: false,
      }))

      await supabase.from("goal_milestones").insert(milestones as any)

      return data as GoalRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    },
  })

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await (supabase as any)
        .from("goals")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data as GoalRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    },
  })

  return {
    goals,
    isLoading,
    error,
    createGoal: createMutation.mutateAsync,
    completeGoal: completeMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync,
  }
}
