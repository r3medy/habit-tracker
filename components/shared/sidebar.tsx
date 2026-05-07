"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  BarChart3,
  ListTodo,
  Pencil,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/tracker", icon: LayoutGrid, label: "Tracker" },
  { href: "/todos", icon: ListTodo, label: "Todos" },
  { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { href: "/habits", icon: Pencil, label: "Manage habits" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (pathname === "/onboarding") {
    return null
  }

  return (
    <aside className="fixed left-0 top-0 flex h-full w-14 flex-col items-center border-r border-muted bg-background py-4">
      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Tooltip key={item.href} delayDuration={200}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div className="flex flex-col items-center gap-1">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              className="size-10"
              aria-label="Toggle theme"
              pressed={mounted && theme === "dark"}
              onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {mounted && theme === "dark" ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="right">
            {mounted && theme === "dark" ? "Light mode" : "Dark mode"}
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  )
}
