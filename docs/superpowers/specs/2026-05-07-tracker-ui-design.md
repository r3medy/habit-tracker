# Tracker UI — Design Specification

**Date:** 2026-05-07
**Phase:** 4
**Status:** Draft

---

## 1. Overview

Build the main habit tracker page with two views: a weekly grid view and a daily list view. Users can navigate dates, toggle completions with optimistic updates, manage subtasks (daily view only), and add new habits.

---

## 2. Architecture

### Route
- `app/(app)/tracker/page.tsx` — Main tracker page (replaces placeholder)

### Component Tree
```
components/tracker/
├── tracker-page.tsx          # Main page, holds tab/date state
├── tracker-header.tsx        # Title, date nav, tabs, add button
├── weekly-view.tsx           # 7-column grid
├── daily-view.tsx            # Vertical list
├── habit-row.tsx             # Weekly: icon, name, 7 checkboxes, progress
├── habit-card.tsx            # Daily: icon, name, checkbox, streak, expand
├── subtask-list.tsx          # Indented subtask checkboxes
├── add-habit-dialog.tsx      # Dialog: name, icon, color, schedule
└── day-reset-indicator.tsx   # Banner when viewing non-today date
```

---

## 3. View Switching (Approach A)

Two explicit tabs in the header: **Week** and **Day**.

- Default view: Week
- Tab state stored in `useState` (not persisted)
- Switching tabs preserves the current date context
- Both views share the same header and date navigation

---

## 4. Weekly Grid View

### Layout
- Table-like grid: habits as rows, 7 days as columns
- Header row: Day abbreviations (Mon 13, Tue 14, etc.)
- Today's column has a subtle highlight
- Bottom row: "Daily completion" aggregate % per column

### Habit Row
- Left: Icon (colored circle background) + habit name
- Middle: 7 checkboxes aligned under day columns
- Right: Progress bar showing weekly completion %
- Schedule-aware: habits with weekly schedules show disabled/dash for non-scheduled days

### Checkbox States
- Checked = completed
- Unchecked = not completed
- Disabled/ghost = future date
- Dash/disabled = habit not scheduled for that day

### Navigation
- `<` previous week, `>` next week
- "Today" button to jump to current week
- Week starts Monday

---

## 5. Daily View

### Layout
- Vertical stack of habit cards
- Header: Full date (e.g., "Wednesday, May 14") with `<` `>` day navigation + "Today" button

### Habit Card
- Left color accent border (habit color)
- Left: Icon + habit name + streak badge (e.g., " 12")
- Right: Large completion checkbox
- Expandable section below: subtask list (chevron toggle)

### Subtask Behavior
- Only visible in daily view
- Each subtask has individual checkbox
- Sorted by `sort_order`

### Parent/Subtask Sync (Bidirectional)
- Check parent → marks all subtasks completed (batch mutation)
- All subtasks checked → auto-checks parent (optimistic)
- Uncheck parent → unchecks all subtasks
- Uncheck one subtask → unchecks parent
- Parent stored in `completions`, subtasks in `subtask_completions`

### Empty States
- No habits: "No habits yet" + "Add habit" button
- No completions: habits shown unchecked

---

## 6. Add Habit Flow

- "Add habit" button in header opens dialog
- Dialog fields: name (required, max 50), icon picker, color picker, schedule type
- On submit: `createHabit()` mutation, closes dialog, habit appears in views
- No minimum habit count (unlike onboarding)
- Validation errors shown inline, dialog stays open

---

## 7. Date Navigation

### State
- `selectedDate` stored in `useState`
- Defaults to today on mount
- Weekly view derives week range from `selectedDate`
- Daily view uses `selectedDate` directly

### Navigation Controls
- `<` `>` arrows shift by 1 day (daily) or 7 days (weekly)
- "Today" button resets to current date
- Date range display in header (e.g., "May 13 – May 19, 2024")

### Day Reset Indicator
- Shown when `selectedDate !== today`
- Small banner: "Viewing [date]. [Back to today]"
- Uses `lib/reset-utils` for date comparison

---

## 8. Data Flow

### Queries
- `useHabits()` — habit list (staleTime: 5 min)
- `useCompletions(date)` — completions for selected date
- Weekly view: calls `useCompletions` 7 times (one per day in week), each keyed by date
- Daily view: 1 query for selected date
- `useSubtasks(habitId)` — subtasks per habit (daily view, expanded habits only)
- `useStreaks(habitId)` — streak data for badges

### Mutations
- `toggleCompletion` — optimistic update, rollback on error
- `toggleSubtaskCompletion` — optimistic update
- `createHabit` — adds new habit
- Batch subtask toggle when parent checked

### Error Handling
- Network failure → revert checkbox, show toast
- Supabase errors → toast notification
- Future date toggles → disabled, no mutation

---

## 9. Edge Cases

- Future dates: checkboxes disabled, visual indicator
- Dates before account creation: "No data" empty state
- Timezone changes: recalculates "today" on mount
- No habits: empty state with CTA
- Loading states: skeleton placeholders for grid/cards

---

## 10. Design Constraints

- Minimal, calm UI (no pure black/white)
- OKLCH colors, dark/light theme support
- Lucide icons only
- shadcn/ui components (radix-maia preset)
- Tailwind v4 styling
- Smooth transitions on toggle/tab switch

---

## 11. Files to Create/Modify

### Create
- `components/tracker/tracker-page.tsx`
- `components/tracker/tracker-header.tsx`
- `components/tracker/weekly-view.tsx`
- `components/tracker/daily-view.tsx`
- `components/tracker/habit-row.tsx`
- `components/tracker/habit-card.tsx`
- `components/tracker/subtask-list.tsx`
- `components/tracker/add-habit-dialog.tsx`
- `components/tracker/day-reset-indicator.tsx`

### Modify
- `app/(app)/tracker/page.tsx` — Replace placeholder with `TrackerPage`

---

## 12. Testing

- Unit: date navigation logic, week range calculation
- Integration: toggle completion flow, parent/subtask sync
- E2E: weekly view navigation, daily view expand/collapse, add habit flow
