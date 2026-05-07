"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TrackerPlaceholder() {
  const router = useRouter()

  useEffect(() => {
    router.push("/onboarding")
  }, [router])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}
