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
