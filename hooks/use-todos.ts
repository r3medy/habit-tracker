"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { insertTyped, updateTyped, updateSortOrder } from "@/lib/supabase/typed"
import type { TodoRow, TodoInsert } from "@/lib/supabase/types"

export function useTodos(date: string) {
  const queryClient = useQueryClient()

  const { data: todos, isLoading, error } = useQuery({
    queryKey: ["todos", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("date", date)
        .order("sort_order", { ascending: true })
      if (error) throw error
      return (data || []) as TodoRow[]
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!date,
  })

  const createMutation = useMutation({
    mutationFn: async (todo: TodoInsert) => {
      const { data, error } = await insertTyped("todos", [todo])
      if (error) throw error
      return data as TodoRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", date] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TodoRow>) => {
      const { data, error } = await updateTyped("todos", updates, "id", id)
      if (error) throw error
      return data as TodoRow
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ["todos", date] })
      const previous = queryClient.getQueryData<TodoRow[]>(["todos", date])

      queryClient.setQueryData<TodoRow[]>(["todos", date], (old) => {
        if (!old) return old
        return old.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["todos", date], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", date] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos", date] })
      const previous = queryClient.getQueryData<TodoRow[]>(["todos", date])

      queryClient.setQueryData<TodoRow[]>(["todos", date], (old) => {
        if (!old) return old
        return old.filter((t) => t.id !== id)
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["todos", date], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", date] })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const error = await updateSortOrder("todos", updates)
      if (error) throw error
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["todos", date] })
      const previous = queryClient.getQueryData<TodoRow[]>(["todos", date])

      queryClient.setQueryData<TodoRow[]>(["todos", date], (old) => {
        if (!old) return old
        const map = new Map(updates.map((u) => [u.id, u.sort_order]))
        return old
          .map((t) => (map.has(t.id) ? { ...t, sort_order: map.get(t.id)! } : t))
          .sort((a, b) => (map.get(a.id) ?? a.sort_order) - (map.get(b.id) ?? b.sort_order))
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["todos", date], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", date] })
    },
  })

  return {
    todos,
    isLoading,
    error,
    createTodo: createMutation.mutateAsync,
    updateTodo: updateMutation.mutateAsync,
    deleteTodo: deleteMutation.mutateAsync,
    reorderTodos: reorderMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isReordering: reorderMutation.isPending,
  }
}
