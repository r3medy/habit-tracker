"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

const VERIFIED_KEY = "habit-tracker-verified"
const ONBOARDED_KEY = "habit-tracker-onboarded"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isVerified = localStorage.getItem(VERIFIED_KEY) === "true"
    if (!isVerified) {
      router.push("/")
      return
    }

    const isOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true"
    if (!isOnboarded && pathname !== "/onboarding") {
      router.push("/onboarding")
    }
  }, [pathname, router])

  return <>{children}</>
}
