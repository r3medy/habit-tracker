"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  format,
  parseISO,
  eachDayOfInterval,
  subDays,
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
          <div className="flex flex-col gap-1">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="flex h-3 items-center justify-end pr-2 text-xs text-muted-foreground">
                {label}
              </div>
            ))}
          </div>

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
