"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  format,
  parseISO,
  eachDayOfInterval,
  subDays,
  getDay,
  getMonth,
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

const HEATMAP_COLORS_LIGHT = [
  "oklch(0.93 0.005 264)",
  "oklch(0.75 0.12 160)",
  "oklch(0.6 0.16 160)",
  "oklch(0.45 0.18 160)",
]

const HEATMAP_COLORS_DARK = [
  "oklch(0.3 0.015 264)",
  "oklch(0.5 0.12 160)",
  "oklch(0.62 0.16 160)",
  "oklch(0.75 0.18 160)",
]

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const CELL_SIZE = 11
const GAP = 3
const STEP = CELL_SIZE + GAP
const DAY_LABEL_WIDTH = 28

export function HeatmapView({ completions, timezone, isLoading }: HeatmapViewProps) {
  const router = useRouter()

  const { weeks, monthSpans } = useMemo(() => {
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

    const dayData = days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd")
      const count = completionMap.get(dateStr) || 0
      return {
        date: dateStr,
        count,
        level: getHeatmapLevel(count),
        dayOfWeek: getDay(day),
        month: getMonth(day),
      }
    })

    const weeks: typeof dayData[] = []
    let currentWeek: typeof dayData = []

    for (const day of dayData) {
      if (day.dayOfWeek === 1 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(day)
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    const monthSpans: { month: string; span: number }[] = []
    let lastMonth = -1
    let currentMonthSpan = 0

    for (let w = 0; w < weeks.length; w++) {
      const week = weeks[w]
      if (!week || week.length === 0) continue
      const month = week[0].month
      if (lastMonth === -1) {
        lastMonth = month
        currentMonthSpan = 1
      } else if (month === lastMonth) {
        currentMonthSpan++
      } else {
        monthSpans.push({ month: MONTH_LABELS[lastMonth], span: currentMonthSpan })
        lastMonth = month
        currentMonthSpan = 1
      }
    }
    if (currentMonthSpan > 0) {
      monthSpans.push({ month: MONTH_LABELS[lastMonth], span: currentMonthSpan })
    }

    return { weeks, monthSpans }
  }, [completions, timezone])

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

      <style>{`
        .heatmap-root { --h0: ${HEATMAP_COLORS_LIGHT[0]}; --h1: ${HEATMAP_COLORS_LIGHT[1]}; --h2: ${HEATMAP_COLORS_LIGHT[2]}; --h3: ${HEATMAP_COLORS_LIGHT[3]}; }
        .dark .heatmap-root { --h0: ${HEATMAP_COLORS_DARK[0]}; --h1: ${HEATMAP_COLORS_DARK[1]}; --h2: ${HEATMAP_COLORS_DARK[2]}; --h3: ${HEATMAP_COLORS_DARK[3]}; }
      `}</style>

      <div className="overflow-x-auto py-1 heatmap-root">
        <div className="mx-auto w-fit min-w-0">
          {/* Month labels row */}
          <div className="flex" style={{ paddingLeft: `${DAY_LABEL_WIDTH + GAP}px` }}>
            {monthSpans.map((ms, i) => (
              <div
                key={`${ms.month}-${i}`}
                className="text-xs text-muted-foreground"
                style={{ width: `${ms.span * CELL_SIZE + (ms.span - 1) * GAP}px` }}
              >
                {ms.month}
              </div>
            ))}
          </div>

          <div className="mt-1 flex">
            {/* Day labels */}
            <div className="flex flex-col" style={{ width: `${DAY_LABEL_WIDTH}px`, gap: `${GAP}px` }}>
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="flex items-center justify-end pr-2 text-[10px] text-muted-foreground"
                  style={{ height: `${CELL_SIZE}px` }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex" style={{ gap: `${GAP}px` }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: `${GAP}px` }}>
                  {week.map((day, di) => (
                    <Tooltip key={`${wi}-${di}`} delayDuration={200}>
                      <TooltipTrigger asChild>
                        <button
                        className={cn(
                          "rounded-[2px] transition-colors hover:ring-1 hover:ring-foreground/20",
                        )}
                        style={{
                          backgroundColor: `var(--h${day.level})`,
                          width: `${CELL_SIZE}px`,
                          height: `${CELL_SIZE}px`,
                        }}
                          onClick={() => router.push(`/day/${day.date}`)}
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
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-1 text-xs text-muted-foreground heatmap-root">
        <span>Less</span>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-[2px]" style={{ backgroundColor: `var(--h${i})`, width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
