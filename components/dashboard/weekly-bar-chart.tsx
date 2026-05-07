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
import { parseISO, subWeeks, eachWeekOfInterval } from "date-fns"

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
