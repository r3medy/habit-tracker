import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("verifyPassword", () => {
  const mockHash = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns success for correct password (password)", async () => {
    vi.stubEnv("NEXT_APP_PASSWORD_HASH", mockHash)
    const { verifyPassword } = await import("@/app/actions")

    const result = await verifyPassword("password")
    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it("returns failure for incorrect password", async () => {
    vi.stubEnv("NEXT_APP_PASSWORD_HASH", mockHash)
    const { verifyPassword } = await import("@/app/actions")

    const result = await verifyPassword("wrongpassword")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Incorrect password")
  })

  it("returns failure for empty password", async () => {
    vi.stubEnv("NEXT_APP_PASSWORD_HASH", mockHash)
    const { verifyPassword } = await import("@/app/actions")

    const result = await verifyPassword("")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Incorrect password")
  })

  it("returns failure when hash is not configured", async () => {
    vi.stubEnv("NEXT_APP_PASSWORD_HASH", "")
    const { verifyPassword } = await import("@/app/actions")

    const result = await verifyPassword("password")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Password not configured")
  })

  it("returns failure when hash is undefined", async () => {
    vi.stubEnv("NEXT_APP_PASSWORD_HASH", undefined as any)
    const { verifyPassword } = await import("@/app/actions")

    const result = await verifyPassword("password")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Password not configured")
  })
})
