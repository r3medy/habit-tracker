# Dashboard UI — Design Specification

**Date:** 2026-05-07
**Phase:** 5
**Status:** Draft

---

## 1. Overview

Build the analytics dashboard with stats cards, a 12-month heatmap, pie and bar charts, goal progress tracking, and a daily journal entry section. Single scroll page with bento-grid sections where appropriate.

---

## 2. Architecture

### Route
- `app/(app)/dashboard/page.tsx` — Main dashboard page (replaces placeholder)

### Component Tree
```
components/dashboard/
├── dashboard-page.tsx        # Main page, orchestrates all sections
├── stats-overview.tsx        # Top row: 5 stat cards in bento grid
├── heatmap-view.tsx          # 12-month GitHub-style calendar grid
├── completion-pie-chart.tsx  # Habit breakdown pie chart (30 days)
├── weekly-bar-chart.tsx      # Weekly comparison bar chart (4 weeks)
├── goals-section.tsx         # Active goals with progress bars
└── journal-section.tsx       # Today's journal entry
```

### Shared Utilities
- `lib/analytics-utils.ts` — Data aggregation helpers (success rate, best day, weekly totals)

---

## 3. Stats Overview (Bento Grid)

**Component:** `components/dashboard/stats-overview.tsx`

**Layout:** 5 cards in a responsive grid:
```
[Weekly Progress] [Best Streak] [Active Habits] [Total Completions] [Daily Avg]
```

On mobile: 2 columns, last card spans full width.

### Card Details

**Weekly Progress:**
- Ring chart showing % of completions this week
- Label: "Weekly progress"
- Value: "78%" (large)
- Subtext: "11 of 14 completed"

**Best Streak:**
- Flame icon (orange accent)
- Value: "12 days" (large)
- Subtext: "Keep it going!" or "Personal best"

**Active Habits:**
- Pulse/activity icon
- Value: "5" (large)
- Subtext: "of 6 total" (if some are inactive)

**Total Completions:**
- Trend-up icon (green accent)
- Value: "164" (large)
- Subtext: "All time"

**Daily Average:**
- Bar chart icon (blue accent)
- Value: "78%" (large)
- Subtext: "This week"

### Data Sources
- Weekly progress: `useCompletions` for last 7 days, calculate completion rate
- Best streak: `useStreaks` for each habit, take max `longestStreak`
- Active habits: `useHabits` count
- Total completions: Sum of all `completed: true` completions across all habits
- Daily average: Weekly completions / 7

---

## 4. Heatmap View

**Component:** `components/dashboard/heatmap-view.tsx`

**Layout:** Full-width card containing a GitHub-style calendar grid.

### Grid Details
- 52 weeks × 7 days (last 12 months)
- Each cell = one day
- Color intensity based on completion count for that day:
  - Level 0: No completions (muted/empty)
  - Level 1: 1-2 completions (light)
  - Level 2: 3-4 completions (medium)
  - Level 3: 5+ completions (dark)
- Month labels along top
- Day labels (Mon, Wed, Fri) along left side
- Legend at bottom showing level meanings

### Data Source
- Fetch last 365 days of completions via `useCompletions` (multiple date queries or a range query if supported)
- Group by date, count completions per day
- Map count to heatmap level

### Interaction
- Hover tooltip: "May 13: 4 completions"
- Click cell → navigate to tracker for that date

---

## 5. Charts Section (Bento Grid, 2 Columns)

### Completion Pie Chart

**Component:** `components/dashboard/completion-pie-chart.tsx`

**Data:** Last 30 days, completion count per habit.

**Chart:** Recharts PieChart with:
- Each habit as a slice
- Colors match habit colors from `HABIT_COLORS`
- Labels show habit name + percentage
- Center text shows total completions

**Config:**
```typescript
const config: ChartConfig = {
  habit1: { label: "Exercise", color: HABIT_COLORS[0].light },
  habit2: { label: "Reading", color: HABIT_COLORS[1].light },
  // ...
}
```

### Weekly Bar Chart

**Component:** `components/dashboard/weekly-bar-chart.tsx`

**Data:** Last 4 weeks, completions per habit per week.

**Chart:** Recharts BarChart with:
- X-axis: Week labels ("Week 1", "Week 2", etc.)
- Grouped bars: one bar per habit per week
- Colors match habit colors
- Tooltip shows exact counts

---

## 6. Goals Section

**Component:** `components/dashboard/goals-section.tsx`

**Layout:** Card with header "Goals" and list of active goals.

### Goal Card
- Habit name + icon
- Goal type: "Streak goal" or "Count goal"
- Progress bar showing current progress vs target
- Milestone badges (25%, 50%, 75%) — filled when reached
- "Completed" badge when goal is done

### Data Source
- `useGoals()` for all goals
- `useStreaks(habitId)` for streak-based goals
- `useCompletions` for count-based goals (sum completions in date range)

### Empty State
- "No active goals" message
- "Set a goal" button (future feature)

---

## 7. Journal Section

**Component:** `components/dashboard/journal-section.tsx`

**Layout:** Card with header "Today's Reflection" and text area.

### Behavior
- Pre-filled with existing journal entry for today (if any)
- Auto-saves on input debounce (500ms)
- Character counter (max 2000)
- Saved indicator ("Saved" / "Saving...")

### Data Source
- `useJournal()` hook for today's entry
- `useMutation` for save

---

## 8. Data Flow

### Queries
- `useHabits()` — habit list (for pie chart labels, goal associations)
- `useCompletions(date)` — called for each day in heatmap range (365 queries, cached)
- `useGoals()` — all goals
- `useStreaks(habitId)` — per habit for stats + goals
- `useJournal(date)` — today's entry
- `useUserProfile()` — timezone

### Aggregation
- `lib/analytics-utils.ts` exports:
  - `getWeeklyProgress(completions, habits)` → { completed, total, percentage }
  - `getBestStreak(streaks)` → max longestStreak
  - `getTotalCompletions(allCompletions)` → count of completed
  - `getDailyAverage(weeklyCompletions)` → average per day
  - `getHeatmapData(completions)` → { date, count, level }[]
  - `getPieData(completions, habits)` → { name, value, color }[]
  - `getWeeklyBarData(completions, habits)` → { week, habit, count }[]

---

## 9. Error Handling

- Network errors → toast notification
- Empty data → appropriate empty states per section
- Loading states → skeleton placeholders for each section
- Chart errors → fallback to "Chart unavailable" message

---

## 10. Performance

- Heatmap: fetch 365 days in parallel, React Query caches aggressively
- Charts: lazy-loaded via `React.lazy` or `next/dynamic`
- Stats cards: computed from cached completion data, no extra queries
- All charts memoized with `useMemo`
- Skeleton loading per section (not full page)

---

## 11. Design Constraints

- Minimal, calm UI (no pure black/white)
- OKLCH colors, dark/light theme support
- Lucide icons only
- shadcn/ui components (radix-maia preset)
- Tailwind v4 styling
- Recharts for all charts
- Responsive: 2-column grid on mobile, full layout on desktop

---

## 12. Files to Create/Modify

### Create
- `lib/analytics-utils.ts` — Data aggregation helpers
- `components/dashboard/dashboard-page.tsx`
- `components/dashboard/stats-overview.tsx`
- `components/dashboard/heatmap-view.tsx`
- `components/dashboard/completion-pie-chart.tsx`
- `components/dashboard/weekly-bar-chart.tsx`
- `components/dashboard/goals-section.tsx`
- `components/dashboard/journal-section.tsx`

### Modify
- `app/(app)/dashboard/page.tsx` — Replace placeholder with `DashboardPage`

---

## 13. Testing

- Unit: analytics-utils functions (success rate, streak calc, heatmap levels)
- Integration: stats card data flow, chart data aggregation
- E2E: Dashboard loads with data, charts render, heatmap displays correctly
