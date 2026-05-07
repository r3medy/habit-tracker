"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

const VERIFIED_KEY = "habit-tracker-verified"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isVerified = localStorage.getItem(VERIFIED_KEY) === "true"
    if (!isVerified && pathname !== "/onboarding") {
      router.push("/")
    }
  }, [router, pathname])

  return <>{children}</>
}
