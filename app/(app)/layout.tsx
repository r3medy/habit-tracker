"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "@/components/shared/sidebar"
import { BottomNav } from "@/components/shared/bottom-nav"

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

  return (
    <TooltipProvider>
      <Sidebar />
      <BottomNav />
      <main className="min-h-svh pb-16 md:ml-14 md:pb-0">{children}</main>
    </TooltipProvider>
  )
}
