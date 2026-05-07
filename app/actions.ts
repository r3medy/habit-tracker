"use server"

import { createHash } from "crypto"

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
