"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutGrid, ListTodo, BarChart3, Pencil, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/tracker", icon: LayoutGrid, label: "Tracker" },
  { href: "/todos", icon: ListTodo, label: "Todos" },
  { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { href: "/habits", icon: Pencil, label: "Habits" },
]

export function BottomNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (pathname === "/onboarding") return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-muted bg-background md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? (
            <Moon className="size-5" />
          ) : (
            <Sun className="size-5" />
          )}
          <span>Theme</span>
        </button>
      </div>
    </nav>
  )
}
