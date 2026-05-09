"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "@/components/shared/sidebar"
import { BottomNav } from "@/components/shared/bottom-nav"
import { useUserProfile } from "@/hooks/use-user-profile"

const VERIFIED_KEY = "habit-tracker-verified"
const ONBOARDED_KEY = "habit-tracker-onboarded"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const { profile, isLoading: profileLoading } = useUserProfile()

  useEffect(() => {
    const isVerified = localStorage.getItem(VERIFIED_KEY) === "true"
    if (!isVerified) {
      router.push("/")
      return
    }

    const isOnboardedLocal = localStorage.getItem(ONBOARDED_KEY) === "true"
    if (isOnboardedLocal) return

    if (profileLoading) return

    if (profile?.has_onboarded) {
      localStorage.setItem(ONBOARDED_KEY, "true")
      return
    }

    if (pathname !== "/onboarding") {
      router.push("/onboarding")
    }
  }, [pathname, router, profile, profileLoading])

  return (
    <TooltipProvider>
      <Sidebar />
      <BottomNav />
      <main className="min-h-svh pb-16 md:ml-14 md:pb-0">{children}</main>
    </TooltipProvider>
  )
}
