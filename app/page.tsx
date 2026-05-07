"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { verifyPassword, setVerified } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Lock, AlertTriangle } from "lucide-react"

export default function GatePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await verifyPassword(password)

      if (result.success) {
        await setVerified()
        await queryClient.invalidateQueries({ queryKey: ["user_profile"] })
        router.push("/tracker")
      } else {
        setError(result.error || "Verification failed")
      }
    })
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Lock className="size-8 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <Field>
              <FieldLabel htmlFor="password" className="sr-only">
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                autoFocus
                aria-invalid={!!error}
              />
            </Field>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending || !password.trim()}>
              {isPending ? (
                <>
                  <Spinner />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
