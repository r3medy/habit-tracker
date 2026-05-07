"use client"

import { useCallback, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { insertTyped } from "@/lib/supabase/typed"
import type { TodoRow, TodoInsert } from "@/lib/supabase/types"
import { format, subDays } from "date-fns"

export function useTodoCarryOver(date: string, hasOverdue: boolean) {
  const queryClient = useQueryClient()
  const carriedRef = useRef(false)
  const CARRY_KEY = `todo-carry-${date}`

  const yesterday = format(subDays(new Date(date + "T00:00:00"), 1), "yyyy-MM-dd")

  const { data: overdueTodos } = useQuery({
    queryKey: ["todos", "carry-over", yesterday],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("date", yesterday)
        .eq("completed", false)
        .eq("carry_over", true)
        .order("sort_order", { ascending: true })
      if (error) throw error
      return (data || []) as TodoRow[]
    },
    enabled: !!yesterday && date !== yesterday && hasOverdue,
    staleTime: 1000 * 60 * 5,
  })

  const carryOverMutation = useMutation({
    mutationFn: async (todos: TodoRow[]) => {
      const inserts: TodoInsert[] = todos.map((t) => ({
        text: t.text,
        date,
        completed: false,
        carry_over: true,
        sort_order: t.sort_order,
      }))
      const { error } = await insertTyped("todos", inserts)
      if (error) throw error
    },
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.setItem(CARRY_KEY, "true")
      }
      carriedRef.current = true
      queryClient.invalidateQueries({ queryKey: ["todos", date] })
    },
  })

  const runCarryOver = useCallback(() => {
    if (carriedRef.current) return
    if (typeof window !== "undefined" && localStorage.getItem(CARRY_KEY) === "true") {
      carriedRef.current = true
      return
    }
    if (overdueTodos && overdueTodos.length > 0) {
      carryOverMutation.mutate(overdueTodos)
      carriedRef.current = true
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem(CARRY_KEY, "true")
      }
      carriedRef.current = true
    }
  }, [overdueTodos, carryOverMutation, CARRY_KEY])

  useEffect(() => {
    runCarryOver()
  }, [runCarryOver])

  return {
    isCarrying: carryOverMutation.isPending,
    overdueCount: overdueTodos?.length || 0,
  }
}
