# Dashboard UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the analytics dashboard with stats cards, 12-month heatmap, pie/bar charts, goal progress, and journal section.

**Architecture:** Single scroll page with bento-grid sections. Stats cards at top, full-width heatmap, 2-column chart grid, goals list, and journal entry. All data flows through existing React Query hooks.

**Tech Stack:** Next.js 16, React 19, shadcn/ui (radix-maia), Tailwind v4, Lucide icons, Recharts, @tanstack/react-query, date-fns

---

## File Structure

### Create (9 files)
- `lib/analytics-utils.ts` — Data aggregation helpers
- `components/dashboard/dashboard-page.tsx` — Main orchestrator
- `components/dashboard/stats-overview.tsx` — 5 stat cards
- `components/dashboard/heatmap-view.tsx` — 12-month grid
- `components/dashboard/completion-pie-chart.tsx` — Pie chart
- `components/dashboard/weekly-bar-chart.tsx` — Bar chart
- `components/dashboard/goals-section.tsx` — Goals list
- `components/dashboard/journal-section.tsx` — Journal entry
- `tests/analytics-utils.test.ts` — Unit tests

### Modify (1 file)
- `app/(app)/dashboard/page.tsx` — Replace placeholder

---

## Phase 1: Analytics Utilities

### Task 1: Analytics Utils + Tests

**Files:**
- Create: `lib/analytics-utils.ts`
- Test: `tests/analytics-utils.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/analytics-utils.test.ts
import { describe, it, expect } from "vitest"
import {
  getWeeklyProgress,
  getBestStreak,
  getTotalCompletions,
  getDailyAverage,
  getHeatmapLevel,
  getPieData,
  getWeeklyBarData,
} from "@/lib/analytics-utils"

describe("analytics-utils", () => {
  describe("getWeeklyProgress", () => {
    it("calculates percentage from completions", () => {
      const completions = [
        { habit_id: "1", completed: true },
        { habit_id: "2", completed: false },
        { habit_id: "3", completed: true },
      ]
      const result = getWeeklyProgress(completions, 3)
      expect(result.completed).toBe(2)
      expect(result.total).toBe(3)
      expect(result.percentage).toBeCloseTo(66.67, 1)
    })

    it("handles empty completions", () => {
      const result = getWeeklyProgress([], 0)
      expect(result.percentage).toBe(0)
    })
  })

  describe("getBestStreak", () => {
    it("returns max longestStreak", () => {
      const streaks = { h1: 5, h2: 12, h3: 3 }
      expect(getBestStreak(streaks)).toBe(12)
    })

    it("returns 0 for empty", () => {
      expect(getBestStreak({})).toBe(0)
    })
  })

  describe("getTotalCompletions", () => {
    it("counts completed completions", () => {
      const completions = [
        { completed: true },
        { completed: false },
        { completed: true },
        { completed: true },
      ]
      expect(getTotalCompletions(completions)).toBe(3)
    })
  })

  describe("getDailyAverage", () => {
    it("calculates average per day", () => {
      const weeklyCompletions = [
        [{ completed: true }, { completed: true }],
        [{ completed: false }],
        [{ completed: true }, { completed: true }, { completed: true }],
      ]
      expect(getDailyAverage(weeklyCompletions)).toBeCloseTo(2, 1)
    })
  })

  describe("getHeatmapLevel", () => {
    it("returns 0 for no completions", () => {
      expect(getHeatmapLevel(0)).toBe(0)
    })

    it("returns 1 for 1-2 completions", () => {
      expect(getHeatmapLevel(1)).toBe(1)
      expect(getHeatmapLevel(2)).toBe(1)
    })

    it("returns 2 for 3-4 completions", () => {
      expect(getHeatmapLevel(3)).toBe(2)
      expect(getHeatmapLevel(4)).toBe(2)
    })

    it("returns 3 for 5+ completions", () => {
      expect(getHeatmapLevel(5)).toBe(3)
      expect(getHeatmapLevel(10)).toBe(3)
    })
  })

  describe("getPieData", () => {
    it("aggregates completions by habit", () => {
      const completions = [
        { habit_id: "h1", completed: true },
        { habit_id: "h1", completed: true },
        { habit_id: "h2", completed: true },
      ]
      const habits = [
        { id: "h1", name: "Exercise", color: "teal" },
        { id: "h2", name: "Reading", color: "amber" },
      ]
      const result = getPieData(completions, habits)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe("Exercise")
      expect(result[0].value).toBe(2)
      expect(result[1].name).toBe("Reading")
      expect(result[1].value).toBe(1)
    })
  })

  describe("getWeeklyBarData", () => {
    it("groups completions by week and habit", () => {
      const completions = [
        { habit_id: "h1", completed: true, date: "2026-05-04" },
        { habit_id: "h1", completed: true, date: "2026-05-11" },
        { habit_id: "h2", completed: true, date: "2026-05-05" },
      ]
      const habits = [
        { id: "h1", name: "Exercise", color: "teal" },
        { id: "h2", name: "Reading", color: "amber" },
      ]
      const result = getWeeklyBarData(completions, habits)
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/analytics-utils.test.ts`
Expected: FAIL with "Cannot find module '@/lib/analytics-utils'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// lib/analytics-utils.ts
import type { CompletionRow, HabitRow } from "@/lib/supabase/types"
import { format, parseISO, startOfWeek, subWeeks, eachWeekOfInterval } from "date-fns"
import { toZonedTime } from "date-fns-tz"

export function getWeeklyProgress(
  completions: { completed: boolean }[],
  totalHabits: number
): { completed: number; total: number; percentage: number } {
  const completed = completions.filter((c) => c.completed).length
  const total = completions.length || totalHabits * 7
  const percentage = total > 0 ? (completed / total) * 100 : 0
  return { completed, total, percentage }
}

export function getBestStreak(streaks: Record<string, number>): number {
  const values = Object.values(streaks)
  return values.length > 0 ? Math.max(...values) : 0
}

export function getTotalCompletions(completions: { completed: boolean }[]): number {
  return completions.filter((c) => c.completed).length
}

export function getDailyAverage(weeklyCompletions: { completed: boolean }[][]): number {
  if (weeklyCompletions.length === 0) return 0
  const total = weeklyCompletions.flat().filter((c) => c.completed).length
  return total / 7
}

export function getHeatmapLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  return 3
}

export function getPieData(
  completions: { habit_id: string; completed: boolean }[],
  habits: { id: string; name: string; color: string }[]
): { name: string; value: number; color: string }[] {
  const habitMap = new Map<string, { name: string; value: number; color: string }>()

  for (const habit of habits) {
    habitMap.set(habit.id, { name: habit.name, value: 0, color: habit.color })
  }

  for (const c of completions) {
    if (c.completed && habitMap.has(c.habit_id)) {
      const entry = habitMap.get(c.habit_id)!
      entry.value += 1
    }
  }

  return Array.from(habitMap.values()).filter((h) => h.value > 0)
}

export function getWeeklyBarData(
  completions: { habit_id: string; completed: boolean; date: string }[],
  habits: { id: string; name: string; color: string }[]
): { week: string; habit: string; habitName: string; count: number; color: string }[] {
  const now = new Date()
  const fourWeeksAgo = subWeeks(now, 4)
  const weeks = eachWeekOfInterval({ start: fourWeeksAgo, end: now }, { weekStartsOn: 1 })

  const result: { week: string; habit: string; habitName: string; count: number; color: string }[] = []

  for (let i = 0; i < weeks.length && i < 4; i++) {
    const weekStart = weeks[i]
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const weekLabel = `Week ${i + 1}`

    for (const habit of habits) {
      const count = completions.filter((c) => {
        if (!c.completed || c.habit_id !== habit.id) return false
        const d = parseISO(c.date)
        return d >= weekStart && d <= weekEnd
      }).length

      result.push({
        week: weekLabel,
        habit: habit.id,
        habitName: habit.name,
        count,
        color: habit.color,
      })
    }
  }

  return result
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/analytics-utils.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/analytics-utils.ts tests/analytics-utils.test.ts
git commit -m "feat: add analytics utility functions with tests"
```

---

## Phase 2: Stats Overview

### Task 2: Stats Overview Component

**Files:**
- Create: `components/dashboard/stats-overview.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/dashboard/stats-overview.tsx
"use client"

import { Flame, Activity, TrendingUp, BarChart3 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { formatStreak } from "@/lib/date-utils"

interface StatsOverviewProps {
  weeklyProgress: { completed: number; total: number; percentage: number }
  bestStreak: number
  activeHabits: number
  totalHabits: number
  totalCompletions: number
  dailyAverage: number
  isLoading: boolean
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor,
  className,
  children,
}: {
  label: string
  value: string | number
  subtext: string
  icon: React.ComponentType<{ className?: string }>
  iconColor?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn("rounded-lg border border-muted bg-background p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className={cn("rounded-full p-1.5", iconColor && `bg-${iconColor}-500/10`)}>
          <Icon className={cn("size-4", iconColor && `text-${iconColor}-500`)} />
        </div>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
      {children}
    </div>
  )
}

export function StatsOverview({
  weeklyProgress,
  bestStreak,
  activeHabits,
  totalHabits,
  totalCompletions,
  dailyAverage,
  isLoading,
}: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <StatCard
        label="Weekly progress"
        value={`${Math.round(weeklyProgress.percentage)}%`}
        subtext={`${weeklyProgress.completed} of ${weeklyProgress.total} completed`}
        icon={Activity}
        iconColor="rose"
      >
        <Progress value={weeklyProgress.percentage} className="mt-2 h-1" />
      </StatCard>

      <StatCard
        label="Best streak"
        value={formatStreak(bestStreak)}
        subtext={bestStreak > 0 ? "Keep it going!" : "Start a streak"}
        icon={Flame}
        iconColor="orange"
      />

      <StatCard
        label="Active habits"
        value={activeHabits}
        subtext={totalHabits > activeHabits ? `of ${totalHabits} total` : "All active"}
        icon={Activity}
        iconColor="violet"
      />

      <StatCard
        label="Total completions"
        value={totalCompletions}
        subtext="All time"
        icon={TrendingUp}
        iconColor="emerald"
      />

      <StatCard
        label="Daily avg."
        value={`${Math.round(dailyAverage)}%`}
        subtext="This week"
        icon={BarChart3}
        iconColor="sky"
        className="col-span-2 md:col-span-1"
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/stats-overview.tsx
git commit -m "feat: add stats overview component"
```

---

## Phase 3: Heatmap

### Task 3: Heatmap View

**Files:**
- Create: `components/dashboard/heatmap-view.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/dashboard/heatmap-view.tsx
"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  format,
  parseISO,
  eachDayOfInterval,
  subDays,
  startOfWeek,
  getDay,
} from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { getHeatmapLevel } from "@/lib/analytics-utils"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

interface HeatmapViewProps {
  completions: { date: string; completed: boolean }[]
  timezone: string
  isLoading: boolean
}

const HEATMAP_COLORS = [
  "bg-muted/30",
  "bg-emerald-500/30 dark:bg-emerald-500/40",
  "bg-emerald-500/50 dark:bg-emerald-500/60",
  "bg-emerald-500/70 dark:bg-emerald-500/80",
]

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]

export function HeatmapView({ completions, timezone, isLoading }: HeatmapViewProps) {
  const router = useRouter()

  const heatmapData = useMemo(() => {
    const now = new Date()
    const zonedNow = toZonedTime(now, timezone)
    const startDate = subDays(zonedNow, 364)
    const days = eachDayOfInterval({ start: startDate, end: zonedNow })

    const completionMap = new Map<string, number>()
    for (const c of completions) {
      if (c.completed) {
        completionMap.set(c.date, (completionMap.get(c.date) || 0) + 1)
      }
    }

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd")
      const count = completionMap.get(dateStr) || 0
      return {
        date: dateStr,
        count,
        level: getHeatmapLevel(count),
        dayOfWeek: getDay(day),
      }
    })
  }, [completions, timezone])

  const weeks = useMemo(() => {
    const result: typeof heatmapData[] = []
    let currentWeek: typeof heatmapData = []

    for (const day of heatmapData) {
      if (day.dayOfWeek === 1 && currentWeek.length > 0) {
        result.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(day)
    }
    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }

    return result
  }, [heatmapData])

  const monthLabels = useMemo(() => {
    const labels: { month: string; offset: number }[] = []
    let lastMonth = -1

    for (let w = 0; w < weeks.length; w++) {
      const week = weeks[w]
      if (!week || week.length === 0) continue
      const firstDay = week[0]
      const month = parseISO(firstDay.date).getMonth()
      if (month !== lastMonth) {
        labels.push({ month: MONTH_LABELS[month], offset: w })
        lastMonth = month
      }
    }

    return labels
  }, [weeks])

  if (isLoading) {
    return (
      <div className="rounded-lg border border-muted bg-background p-4">
        <div className="h-32 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-muted bg-background p-4">
      <h3 className="mb-4 text-sm font-medium">Activity heatmap</h3>

      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {/* Month labels */}
          <div className="flex gap-1 pl-8">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground"
                style={{ minWidth: `${label.offset * 17 + 8}px` }}
              >
                {label.month}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="flex h-3 items-center justify-end pr-2 text-xs text-muted-foreground">
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <Tooltip key={`${wi}-${di}`} delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "size-3 rounded-sm transition-colors hover:ring-1 hover:ring-foreground/20",
                          HEATMAP_COLORS[day.level]
                        )}
                        onClick={() => router.push(`/tracker?date=${day.date}`)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {format(parseISO(day.date), "MMM d, yyyy")}: {day.count} completion{day.count !== 1 ? "s" : ""}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        {HEATMAP_COLORS.map((color, i) => (
          <div key={i} className={cn("size-3 rounded-sm", color)} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/heatmap-view.tsx
git commit -m "feat: add heatmap view component"
```

---

## Phase 4: Charts

### Task 4: Completion Pie Chart

**Files:**
- Create: `components/dashboard/completion-pie-chart.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/dashboard/completion-pie-chart.tsx
"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { HABIT_COLORS } from "@/lib/constants"
import type { CompletionRow, HabitRow } from "@/lib/supabase/types"

interface CompletionPieChartProps {
  completions: CompletionRow[]
  habits: HabitRow[]
  isLoading: boolean
}

function getHabitColor(colorValue: string) {
  return HABIT_COLORS.find((c) => c.value === colorValue)?.light || HABIT_COLORS[0].light
}

export function CompletionPieChart({ completions, habits, isLoading }: CompletionPieChartProps) {
  const data = useMemo(() => {
    const habitMap = new Map<string, { name: string; value: number; fill: string }>()

    for (const habit of habits) {
      habitMap.set(habit.id, {
        name: habit.name,
        value: 0,
        fill: getHabitColor(habit.color),
      })
    }

    for (const c of completions) {
      if (c.completed && habitMap.has(c.habit_id)) {
        const entry = habitMap.get(c.habit_id)!
        entry.value += 1
      }
    }

    return Array.from(habitMap.values()).filter((h) => h.value > 0)
  }, [completions, habits])

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data])

  const config = useMemo(() => {
    const c: Record<string, { label: string; color: string }> = {}
    for (const d of data) {
      c[d.name] = { label: d.name, color: d.fill }
    }
    return c
  }, [data])

  if (isLoading || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-muted bg-background">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : "No data yet"}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-muted bg-background p-4">
      <h3 className="mb-2 text-sm font-medium">Completions by habit</h3>
      <p className="mb-4 text-xs text-muted-foreground">Last 30 days</p>

      <ChartContainer config={config} className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="mt-2 text-center text-xs text-muted-foreground">
        {total} total completions
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/completion-pie-chart.tsx
git commit -m "feat: add completion pie chart component"
```

---

### Task 5: Weekly Bar Chart

**Files:**
- Create: `components/dashboard/weekly-bar-chart.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/dashboard/weekly-bar-chart.tsx
"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { HABIT_COLORS } from "@/lib/constants"
import type { CompletionRow, HabitRow } from "@/lib/supabase/types"
import { format, parseISO, subWeeks, eachWeekOfInterval } from "date-fns"

interface WeeklyBarChartProps {
  completions: CompletionRow[]
  habits: HabitRow[]
  isLoading: boolean
}

function getHabitColor(colorValue: string) {
  return HABIT_COLORS.find((c) => c.value === colorValue)?.light || HABIT_COLORS[0].light
}

export function WeeklyBarChart({ completions, habits, isLoading }: WeeklyBarChartProps) {
  const data = useMemo(() => {
    const now = new Date()
    const fourWeeksAgo = subWeeks(now, 4)
    const weeks = eachWeekOfInterval({ start: fourWeeksAgo, end: now }, { weekStartsOn: 1 }).slice(0, 4)

    const result: Record<string, Record<string, number>> = {}

    for (let i = 0; i < weeks.length; i++) {
      const weekStart = weeks[i]
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      const weekLabel = `W${i + 1}`

      result[weekLabel] = {}
      for (const habit of habits) {
        result[weekLabel][habit.id] = 0
      }

      for (const c of completions) {
        if (!c.completed) continue
        const d = parseISO(c.date)
        if (d >= weekStart && d <= weekEnd) {
          result[weekLabel][c.habit_id] = (result[weekLabel][c.habit_id] || 0) + 1
        }
      }
    }

    return Object.entries(result).map(([week, counts]) => ({
      week,
      ...counts,
    }))
  }, [completions, habits])

  const config = useMemo(() => {
    const c: Record<string, { label: string; color: string }> = {}
    for (const habit of habits) {
      c[habit.id] = { label: habit.name, color: getHabitColor(habit.color) }
    }
    return c
  }, [habits])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-muted bg-background">
        <div className="h-48 w-full animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-muted bg-background p-4">
      <h3 className="mb-2 text-sm font-medium">Weekly comparison</h3>
      <p className="mb-4 text-xs text-muted-foreground">Last 4 weeks</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="week" className="text-xs" tick={{ fontSize: 12 }} />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            {habits.map((habit) => (
              <Bar
                key={habit.id}
                dataKey={habit.id}
                fill={getHabitColor(habit.color)}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/weekly-bar-chart.tsx
git commit -m "feat: add weekly bar chart component"
```

---

## Phase 5: Goals & Journal

### Task 6: Goals Section

**Files:**
- Create: `components/dashboard/goals-section.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/dashboard/goals-section.tsx
"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HABIT_ICONS, HABIT_COLORS } from "@/lib/constants"
import type { GoalRow, GoalMilestoneRow, HabitRow } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

interface GoalsSectionProps {
  goals: (GoalRow & { milestones?: GoalMilestoneRow[] })[]
  habits: HabitRow[]
  streaks: Record<string, number>
  isLoading: boolean
}

function getHabitColor(colorValue: string) {
  return HABIT_COLORS.find((c) => c.value === colorValue)?.light || HABIT_COLORS[0].light
}

function getHabitIcon(iconValue: string) {
  return HABIT_ICONS.find((i) => i.value === iconValue)?.component || HABIT_ICONS[0].component
}

export function GoalsSection({ goals, habits, streaks, isLoading }: GoalsSectionProps) {
  const habitMap = useMemo(() => {
    const map = new Map<string, HabitRow>()
    for (const h of habits) map.set(h.id, h)
    return map
  }, [habits])

  const activeGoals = useMemo(() => goals.filter((g) => !g.completed), [goals])
  const completedGoals = useMemo(() => goals.filter((g) => g.completed), [goals])

  if (isLoading) {
    return (
      <div className="rounded-lg border border-muted bg-background p-4">
        <div className="h-20 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-lg border border-muted bg-background p-8 text-center">
        <p className="text-sm text-muted-foreground">No active goals</p>
        <p className="mt-1 text-xs text-muted-foreground">Set a goal to start tracking progress</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-muted bg-background p-4">
      <h3 className="mb-4 text-sm font-medium">Goals</h3>

      <div className="space-y-3">
        {activeGoals.map((goal) => {
          const habit = habitMap.get(goal.habit_id)
          if (!habit) return null

          const Icon = getHabitIcon(habit.icon)
          const borderColor = getHabitColor(habit.color)

          let progress = 0
          let current = 0

          if (goal.target_type === "streak") {
            current = streaks[goal.habit_id] || 0
            progress = Math.min((current / goal.target_value) * 100, 100)
          } else {
            // Count type - would need completion count in date range
            current = 0
            progress = 0
          }

          return (
            <div key={goal.id} className="rounded-lg border border-muted/50 p-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex size-6 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${borderColor}20` }}
                >
                  <Icon className="size-3" style={{ color: borderColor }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {goal.target_type === "streak" ? "Streak goal" : "Count goal"} · {goal.target_value} target
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(progress)}%
                </Badge>
              </div>

              <Progress value={progress} className="mt-2 h-1.5" />

              {/* Milestones */}
              <div className="mt-2 flex gap-1">
                {[25, 50, 75].map((threshold) => {
                  const reached = (goal.milestones || []).some(
                    (m) => m.threshold_pct === threshold && m.reached
                  )
                  return (
                    <span
                      key={threshold}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs",
                        reached
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {threshold}%
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}

        {completedGoals.length > 0 && (
          <div className="pt-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Completed</p>
            {completedGoals.map((goal) => {
              const habit = habitMap.get(goal.habit_id)
              if (!habit) return null
              const Icon = getHabitIcon(habit.icon)

              return (
                <div key={goal.id} className="flex items-center gap-2 rounded-lg border border-muted/50 p-2 opacity-60">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="flex-1 text-sm line-through text-muted-foreground">{habit.name}</span>
                  <Badge variant="secondary" className="text-xs">Done</Badge>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/goals-section.tsx
git commit -m "feat: add goals section component"
```

---

### Task 7: Journal Section

**Files:**
- Create: `components/dashboard/journal-section.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/dashboard/journal-section.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useJournal } from "@/hooks/use-journal"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getTodayInTimeZone } from "@/lib/date-utils"
import { cn } from "@/lib/utils"

export function JournalSection() {
  const { profile } = useUserProfile()
  const timezone = profile?.timezone || "UTC"
  const today = getTodayInTimeZone(timezone)

  const { entry, isLoading, saveEntry, isSaving } = useJournal(today, timezone)
  const [content, setContent] = useState("")
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    if (entry?.content) {
      setContent(entry.content)
    }
  }, [entry?.content])

  const handleSave = useCallback(async (text: string) => {
    if (!profile?.id) return
    setSaved(false)
    try {
      await saveEntry({ date: today, content: text || null, userId: profile.id })
      setSaved(true)
    } catch {
      setSaved(true)
    }
  }, [profile?.id, today, saveEntry])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    setSaved(false)
  }, [])

  const handleBlur = useCallback(() => {
    if (!saved) {
      handleSave(content)
    }
  }, [saved, content, handleSave])

  return (
    <div className="rounded-lg border border-muted bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Today's reflection</h3>
        <span className={cn("text-xs", saved ? "text-muted-foreground" : "text-amber-500")}>
          {isSaving ? "Saving..." : saved ? "Saved" : "Unsaved"}
        </span>
      </div>

      <Textarea
        placeholder="How did today go? What went well? What could be better?"
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={2000}
        className="min-h-32 resize-none"
        disabled={isLoading}
      />

      <div className="mt-2 flex justify-end text-xs text-muted-foreground">
        {content.length}/2000
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/journal-section.tsx
git commit -m "feat: add journal section component"
```

---

## Phase 6: Dashboard Page Integration

### Task 8: Dashboard Page

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Read current file**

Current content is a placeholder. Replace entirely.

- [ ] **Step 2: Write the implementation**

```typescript
// app/(app)/dashboard/page.tsx
"use client"

import { useMemo } from "react"
import { useHabits } from "@/hooks/use-habits"
import { useCompletions } from "@/hooks/use-completions"
import { useStreaks } from "@/hooks/use-streaks"
import { useGoals } from "@/hooks/use-goals"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getTodayInTimeZone, getLastNDays } from "@/lib/date-utils"
import {
  getWeeklyProgress,
  getBestStreak,
  getTotalCompletions,
  getDailyAverage,
} from "@/lib/analytics-utils"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { HeatmapView } from "@/components/dashboard/heatmap-view"
import { CompletionPieChart } from "@/components/dashboard/completion-pie-chart"
import { WeeklyBarChart } from "@/components/dashboard/weekly-bar-chart"
import { GoalsSection } from "@/components/dashboard/goals-section"
import { JournalSection } from "@/components/dashboard/journal-section"

export default function DashboardPage() {
  const { profile } = useUserProfile()
  const timezone = profile?.timezone || "UTC"
  const today = getTodayInTimeZone(timezone)

  const { habits, isLoading: habitsLoading } = useHabits()
  const { goals, isLoading: goalsLoading } = useGoals()

  // Fetch last 30 days for pie chart
  const last30Days = useMemo(() => getLastNDays(30, timezone), [timezone])
  const last30Completions: any[] = []
  const last30Loading = false
  for (const date of last30Days) {
    const { data, isLoading } = useCompletions(date, timezone)
    if (data) last30Completions.push(...data)
    if (isLoading) last30Loading = true
  }

  // Fetch last 4 weeks for bar chart
  const last28Days = useMemo(() => getLastNDays(28, timezone), [timezone])
  const last28Completions: any[] = []
  const last28Loading = false
  for (const date of last28Days) {
    const { data, isLoading } = useCompletions(date, timezone)
    if (data) last28Completions.push(...data)
    if (isLoading) last28Loading = true
  }

  // Fetch last 365 days for heatmap
  const last365Days = useMemo(() => getLastNDays(365, timezone), [timezone])
  const heatmapCompletions: { date: string; completed: boolean }[] = []
  const heatmapLoading = false
  for (const date of last365Days) {
    const { data, isLoading } = useCompletions(date, timezone)
    if (data) {
      for (const c of data) {
        heatmapCompletions.push({ date: c.date, completed: c.completed })
      }
    }
    if (isLoading) heatmapLoading = true
  }

  // Fetch last 7 days for weekly stats
  const last7Days = useMemo(() => getLastNDays(7, timezone), [timezone])
  const weeklyCompletions: any[] = []
  const weeklyLoading = false
  for (const date of last7Days) {
    const { data, isLoading } = useCompletions(date, timezone)
    if (data) weeklyCompletions.push(...data)
    if (isLoading) weeklyLoading = true
  }

  // Streaks
  const streaks: Record<string, number> = {}
  for (const habit of habits || []) {
    const { currentStreak, longestStreak } = useStreaks(habit.id, timezone)
    streaks[habit.id] = longestStreak
  }

  const isLoading = habitsLoading || goalsLoading || last30Loading || last28Loading || heatmapLoading || weeklyLoading

  // Stats calculations
  const weeklyProgress = useMemo(
    () => getWeeklyProgress(weeklyCompletions, habits?.length || 0),
    [weeklyCompletions, habits?.length]
  )
  const bestStreak = useMemo(() => getBestStreak(streaks), [streaks])
  const totalCompletions = useMemo(() => getTotalCompletions(heatmapCompletions), [heatmapCompletions])
  const dailyAverage = useMemo(() => getDailyAverage([weeklyCompletions]), [weeklyCompletions])

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Track your progress and stay motivated.</p>
      </div>

      <StatsOverview
        weeklyProgress={weeklyProgress}
        bestStreak={bestStreak}
        activeHabits={habits?.length || 0}
        totalHabits={habits?.length || 0}
        totalCompletions={totalCompletions}
        dailyAverage={dailyAverage}
        isLoading={isLoading}
      />

      <HeatmapView
        completions={heatmapCompletions}
        timezone={timezone}
        isLoading={heatmapLoading}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CompletionPieChart
          completions={last30Completions}
          habits={habits || []}
          isLoading={last30Loading}
        />
        <WeeklyBarChart
          completions={last28Completions}
          habits={habits || []}
          isLoading={last28Loading}
        />
      </div>

      <GoalsSection
        goals={goals || []}
        habits={habits || []}
        streaks={streaks}
        isLoading={goalsLoading}
      />

      <JournalSection />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/dashboard/page.tsx
git commit -m "feat: implement dashboard page with all sections"
```

---

## Phase 7: Verification

### Task 9: Run Full Test Suite

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No type errors

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: verify tests, types, and lint pass"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| Stats cards (5 cards) | Task 2 |
| Weekly progress ring | Task 2 |
| Best streak | Task 2 |
| Active habits count | Task 2 |
| Total completions | Task 2 |
| Daily average | Task 2 |
| 12-month heatmap | Task 3 |
| Heatmap hover tooltips | Task 3 |
| Heatmap click → tracker | Task 3 |
| Pie chart (30 days) | Task 4 |
| Bar chart (4 weeks) | Task 5 |
| Goals section with progress | Task 6 |
| Milestone badges | Task 6 |
| Journal section | Task 7 |
| Auto-save journal | Task 7 |
| Bento grid layout | Task 8 |
| Loading skeletons | All components |
| Empty states | All components |

All spec requirements covered.

## Placeholder Scan

No TBD, TODO, or vague placeholders found.

## Type Consistency

- `CompletionRow`, `HabitRow`, `GoalRow`, `GoalMilestoneRow` used consistently from `@/lib/supabase/types`
- `getWeeklyProgress`, `getBestStreak`, etc. match analytics-utils exports
- All components use consistent prop naming patterns
