"use client"

import { useMemo, useRef, useEffect, useState } from "react"
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

const HEATMAP_COLORS = [
  "bg-zinc-200 dark:bg-zinc-800",
  "bg-emerald-300 dark:bg-emerald-700",
  "bg-emerald-400 dark:bg-emerald-600",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-600 dark:bg-emerald-400",
]

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]

export function HeatmapView({ completions, timezone, isLoading }: HeatmapViewProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(11)

  const { weeks, monthPositions } = useMemo(() => {
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

    const monthPositions: { month: string; weekIndex: number }[] = []
    let lastMonth = -1
    for (let w = 0; w < weeks.length; w++) {
      const week = weeks[w]
      if (!week || week.length === 0) continue
      const month = week[0].month
      if (month !== lastMonth) {
        monthPositions.push({ month: MONTH_LABELS[month], weekIndex: w })
        lastMonth = month
      }
    }

    return { weeks, monthPositions }
  }, [completions, timezone])

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.clientWidth - 40
      const weekCount = weeks.length
      if (weekCount === 0) return
      const maxCellSize = Math.floor((containerWidth - (weekCount - 1) * 3) / weekCount)
      setCellSize(Math.min(Math.max(maxCellSize, 6), 13))
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [weeks.length])

  const gap = 3
  const step = cellSize + gap

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

      <div ref={containerRef} className="flex w-full justify-center">
        {/* Month labels row */}
        <div className="relative ml-8 mb-2 h-4 w-full">
          {monthPositions.map((label, i) => {
            const prevLabel = i > 0 ? monthPositions[i - 1] : null
            const minLeft = prevLabel ? (prevLabel.weekIndex * step) + 28 : 0
            const left = Math.max(label.weekIndex * step, minLeft)
            return (
              <span
                key={i}
                className="absolute text-xs text-muted-foreground"
                style={{ left: `${left}px` }}
              >
                {label.month}
              </span>
            )
          })}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col pr-2 pt-1" style={{ gap: `${gap}px` }}>
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="flex items-center justify-end text-[10px] text-muted-foreground" style={{ height: `${cellSize}px`, width: "24px" }}>
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex" style={{ gap: `${gap}px` }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: `${gap}px` }}>
                {week.map((day, di) => (
                  <Tooltip key={`${wi}-${di}`} delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "rounded-[2px] transition-colors hover:ring-1 hover:ring-foreground/20",
                          HEATMAP_COLORS[day.level]
                        )}
                        style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
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
          <div key={i} className={cn("rounded-[2px]", color)} style={{ width: `${cellSize}px`, height: `${cellSize}px` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
