"use server"

import { createHash } from "crypto"
import { supabase } from "@/lib/supabase/client"

const PASSWORD_HASH = process.env.NEXT_APP_PASSWORD_HASH

export async function verifyPassword(password: string): Promise<{ success: boolean; error?: string }> {
  if (!PASSWORD_HASH) {
    return { success: false, error: "Password not configured" }
  }

  const inputHash = createHash("sha256").update(password).digest("hex")

  if (inputHash === PASSWORD_HASH) {
    return { success: true }
  }

  return { success: false, error: "Incorrect password" }
}

export async function setVerified(): Promise<{ success: boolean; error?: string }> {
  const { data: profile, error: fetchError } = await supabase
    .from("user_profile")
    .select("id")
    .single() as { data: { id: string } | null; error: { code: string; message: string } | null }

  if (fetchError && fetchError.code !== "PGRST116") {
    return { success: false, error: fetchError.message }
  }

  if (profile?.id) {
    const { error } = await supabase
      .from("user_profile")
      .update({ verified: true } as never)
      .eq("id", profile.id)

    if (error) {
      return { success: false, error: error.message }
    }
  } else {
    const { error } = await supabase
      .from("user_profile")
      .insert({ verified: true, has_onboarded: false } as never)

    if (error) {
      return { success: false, error: error.message }
    }
  }

  return { success: true }
}
