"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { upsertTyped } from "@/lib/supabase/typed"
import type { JournalEntryRow, JournalEntryInsert } from "@/lib/supabase/types"
import { getTodayInTimeZone } from "@/lib/date-utils"

export function useJournal(date?: string, timezone?: string) {
  const queryClient = useQueryClient()
  const queryDate = date || (timezone ? getTodayInTimeZone(timezone) : undefined)

  const { data: entry, isLoading, error } = useQuery({
    queryKey: ["journal", queryDate],
    queryFn: async () => {
      if (!queryDate) return null
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("date", queryDate)
        .single()
      if (error && error.code !== "PGRST116") throw error
      return (data || null) as JournalEntryRow | null
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!queryDate,
  })

  const saveMutation = useMutation({
    mutationFn: async ({ date, content, userId }: { date: string; content: string | null; userId: string }) => {
      const payload: JournalEntryInsert = {
        user_id: userId,
        date,
        content,
        updated_at: new Date().toISOString(),
      }
      const { data, error } = await upsertTyped("journal_entries", [payload], { onConflict: "date" })
      if (error) throw error
      return data as JournalEntryRow
    },
    onMutate: async ({ date, content }) => {
      await queryClient.cancelQueries({ queryKey: ["journal", date] })
      const previous = queryClient.getQueryData<JournalEntryRow | null>(["journal", date])

      queryClient.setQueryData<JournalEntryRow | null>(["journal", date], (old) => {
        if (!old) return null
        return {
          ...old,
          content,
          updated_at: new Date().toISOString(),
        }
      })

      return { previous }
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["journal", vars.date], context.previous)
      }
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({ queryKey: ["journal", vars.date] })
    },
  })

  return {
    entry,
    isLoading,
    error,
    saveEntry: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  }
}
