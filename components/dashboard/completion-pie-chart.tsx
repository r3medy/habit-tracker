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
