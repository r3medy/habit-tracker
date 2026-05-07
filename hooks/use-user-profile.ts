"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import type { UserProfileRow, UserProfileInsert, UserProfileUpdate } from "@/lib/supabase/types"

export function useUserProfile() {
  const queryClient = useQueryClient()

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .single()
      if (error && error.code !== "PGRST116") throw error
      return (data || null) as UserProfileRow | null
    },
    staleTime: 1000 * 60 * 5,
  })

  const updateMutation = useMutation({
    mutationFn: async (updates: UserProfileUpdate) => {
      const { data, error } = await (supabase as any)
        .from("user_profile")
        .update(updates)
        .select()
        .single()
      if (error) throw error
      return data as UserProfileRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profile"] })
    },
  })

  const createMutation = useMutation({
    mutationFn: async (profile: { name: string; timezone: string }) => {
      const payload: UserProfileInsert = {
        name: profile.name,
        timezone: profile.timezone,
        has_onboarded: false,
      }
      const { data, error } = await supabase
        .from("user_profile")
        .insert([payload] as any)
        .select()
        .single()
      if (error) throw error
      return data as UserProfileRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profile"] })
    },
  })

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateMutation.mutateAsync,
    createProfile: createMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
