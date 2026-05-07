# Habit Tracker — Design Specification

**Date:** 2026-05-07
**Status:** Approved
**Stack:** Next.js 16 · React 19 · shadcn/ui (radix-maia) · Tailwind v4 · Remixicon · Supabase · Recharts

---

## 1. Overview

A single-user habit tracking application with custom schedules, streak tracking, analytics, goal milestones, and daily self-reflection. Data syncs across devices via Supabase. No authentication system — access is gated by a password stored in environment variables.

---

## 2. Architecture

Route-based architecture following Next.js App Router conventions. Each page route is its own folder with colocated components.

### Route Structure

```
app/
├── layout.tsx                  # Root layout with theme provider
├── page.tsx                    # Password gate page
├── (app)/
│   ├── layout.tsx              # App shell (navbar, theme toggle)
│   ├── onboarding/
│   │   └── page.tsx            # 3-step stepper: name → habits → welcome
│   ├── tracker/
│   │   └── page.tsx            # Main habit list + daily tracking
│   └── dashboard/
│       └── page.tsx            # Analytics: charts, heatmap, stats
```

### Navigation Guards

- Root `/` → checks `localStorage` for verified flag. If not verified, shows password gate. If verified, redirects to `/tracker`.
- `/tracker` → if `has_onboarded = false`, redirects to `/onboarding`.
- `/onboarding` → if `has_onboarded = true`, redirects to `/tracker`.
- `/dashboard` → same guard as `/tracker`.

---

## 3. Password Gate

- `NEXT_APP_PASSWORD` environment variable.
- Server action hashes input (SHA-256) and compares to stored hash.
- On match, sets `localStorage` flag `verified = true`.
- Wrong password → inline error message, no lockout.
- Hash stored in server component, never exposed to client.

---

## 4. Supabase Schema

### user_profile (single row)

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| name | text | NOT NULL |
| timezone | text | NOT NULL, DEFAULT 'UTC' |
| has_onboarded | boolean | NOT NULL, DEFAULT false |
| created_at | timestamptz | NOT NULL, DEFAULT now() |

### habits

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| name | text | NOT NULL, max 50 chars |
| icon | text | NOT NULL (Remixicon class name) |
| color | text | NOT NULL (CSS color or Tailwind class) |
| schedule_type | text | NOT NULL: 'daily' \| 'weekly' \| 'monthly' \| 'custom' |
| schedule_days | int[] | For weekly: [1,3,5] = Mon,Wed,Fri |
| sort_order | int | NOT NULL, DEFAULT 0 |
| created_at | timestamptz | NOT NULL, DEFAULT now() |

### completions

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| habit_id | uuid | REFERENCES habits(id) ON DELETE CASCADE |
| date | date | NOT NULL |
| completed | boolean | NOT NULL, DEFAULT false |
| completed_at | timestamptz | NULL |
| — | — | UNIQUE(habit_id, date) |

### subtasks

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| habit_id | uuid | REFERENCES habits(id) ON DELETE CASCADE |
| name | text | NOT NULL |
| sort_order | int | NOT NULL, DEFAULT 0 |
| created_at | timestamptz | NOT NULL, DEFAULT now() |

### subtask_completions

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| subtask_id | uuid | REFERENCES subtasks(id) ON DELETE CASCADE |
| date | date | NOT NULL |
| completed | boolean | NOT NULL, DEFAULT false |
| — | — | UNIQUE(subtask_id, date) |

### goals

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| habit_id | uuid | REFERENCES habits(id) ON DELETE CASCADE |
| target_type | text | NOT NULL: 'streak' \| 'count' |
| target_value | int | NOT NULL, positive integer |
| start_date | date | NOT NULL |
| end_date | date | NULL = ongoing |
| completed | boolean | NOT NULL, DEFAULT false |
| completed_at | timestamptz | NULL |
| created_at | timestamptz | NOT NULL, DEFAULT now() |

### goal_milestones

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| goal_id | uuid | REFERENCES goals(id) ON DELETE CASCADE |
| threshold_pct | int | NOT NULL: 25, 50, 75 |
| reached | boolean | NOT NULL, DEFAULT false |
| reached_at | timestamptz | NULL |

### journal_entries

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| user_id | uuid | REFERENCES user_profile(id) ON DELETE CASCADE |
| date | date | NOT NULL, UNIQUE |
| content | text | NULL |
| created_at | timestamptz | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |

### Supabase Client

- Single client instance in `lib/supabase/client.ts`.
- Typed via `lib/supabase/types.ts` (generated from schema).
- No Row Level Security policies needed (single user).
- Service role key stored in environment variable.

---

## 5. Component Architecture

### Component Tree

```
components/
├── ui/                    # shadcn components
├── gate/
│   └── PasswordGate.tsx
├── onboarding/
│   ├── OnboardingStepper.tsx
│   ├── StepName.tsx
│   ├── StepHabits.tsx
│   └── StepWelcome.tsx
├── tracker/
│   ├── HabitList.tsx
│   ├── HabitCard.tsx
│   ├── SubtaskList.tsx
│   ├── SubtaskItem.tsx
│   └── DayResetIndicator.tsx
├── dashboard/
│   ├── StatsOverview.tsx
│   ├── HeatmapView.tsx
│   ├── ProgressRing.tsx
│   ├── PieChartView.tsx
│   ├── WeeklyComparison.tsx
│   └── GoalProgress.tsx
├── reflection/
│   └── JournalEntry.tsx
├── shared/
│   ├── IconPicker.tsx
│   ├── ColorPicker.tsx
│   ├── ThemeToggle.tsx
│   └── Navbar.tsx
└── analytics/
    └── StreakBadge.tsx
```

### Key Component Behaviors

- **HabitCard** — Checkbox toggles completion (optimistic update), shows streak badge, color accent on left border.
- **HabitList** — Uses `@dnd-kit` for drag-and-drop, syncs `sort_order` to Supabase on drop.
- **HeatmapView** — Hand-built SVG grid showing last 12 months, GitHub-style.
- **ProgressRing** — SVG circle with `stroke-dashoffset` animation.
- **StreakBadge** — Displays current streak and longest streak.
- **JournalEntry** — Free text area, one entry per date, auto-saves.

---

## 6. State Management

### Strategy

- No global state manager (no Redux/Zustand).
- `@tanstack/react-query` for server state (Supabase data).
- Local state (`useState`) for UI-only state (modals, form inputs).

### Data Flow

```
User action → React Query mutation → Supabase → Optimistic update → UI re-renders
                                              ↓
                                    On error → rollback optimistic update
```

### Key Flows

**Toggle habit completion:**
1. Click checkbox → optimistic `completed: true` in React Query cache.
2. Mutation inserts/updates `completions` row.
3. Streak recalculated from query.
4. If mutation fails → revert checkbox, show toast error.

**Auto-reset at midnight (hybrid):**
1. Client on mount: check `lastVisitedDate` in localStorage vs today (user's timezone).
2. If different → invalidate React Query cache for today's completions.
3. Background: `setInterval` every 5 min checks if date changed.
4. Tab visibility API: when tab becomes visible again, check date.

**Drag-and-drop reorder:**
1. `@dnd-kit` handles drag state locally.
2. On drop → calculate new `sort_order` for affected habits.
3. Batch update via Supabase mutation.
4. Optimistic: reorder list immediately.

**Onboarding:**
1. Step 1: Save name + timezone to `user_profile`.
2. Step 2: Create habits + subtasks via batch insert.
3. Step 3: Set `has_onboarded = true`, redirect to `/tracker`.

### React Query Configuration

| Query | staleTime |
|-------|-----------|
| habits | 5 min |
| completions (today) | 1 min |
| completions (historical) | 10 min |
| goals | 5 min |
| journal entries | 5 min |

---

## 7. Data Hooks

| Hook | Purpose |
|------|---------|
| `useHabits()` | Fetch + CRUD for habits |
| `useCompletions(date?)` | Daily completions, defaults to today |
| `useStreaks(habitId)` | Current streak + longest streak |
| `useGoals(habitId?)` | Active goals + progress, optional filter by habit |
| `useJournal(date?)` | Journal entries, defaults to today |
| `useUserProfile()` | User profile data |

---

## 8. Analytics

### Metrics

- **Success rate %** — (completed days / total active days) × 100 per habit.
- **Current streak** — Consecutive days completed up to today.
- **Longest streak** — Maximum consecutive days ever completed.
- **Best day** — Day of week with highest completion rate across all habits.
- **Worst day** — Day of week with lowest completion rate.
- **Weekly comparison** — Bar chart comparing completion counts across weeks.

### Charts

- **Heatmap** — GitHub-style calendar grid, last 12 months, color intensity by completion count.
- **Pie chart** — Completion breakdown by habit for selected period.
- **Progress ring** — Circular progress for daily/weekly goal completion.
- **Weekly comparison** — Grouped bar chart, habits on x-axis, weeks as groups.

All charts use Recharts.

---

## 9. Goals & Milestones

- Goals are tied to a specific habit.
- Target types: `streak` (consecutive days) or `count` (total completions).
- Milestones auto-created at 25%, 50%, 75% thresholds.
- When goal is reached, `completed = true`, but habit persists.
- User can set a new goal on the same habit.
- Ongoing goals have `end_date = NULL`.

---

## 10. Self-Reflection

- Free text journal entry per day.
- One entry per date (UNIQUE constraint).
- Auto-saves on input debounce (500ms).
- Accessible from tracker page (end-of-day prompt) and dashboard.

---

## 11. Timezone Handling

- User sets timezone during onboarding (auto-detected from browser, editable).
- Stored in `user_profile.timezone`.
- All date calculations use this timezone via `date-fns-tz`.
- Midnight reset is based on user's timezone, not device timezone.
- Consistent across all devices regardless of physical location.

---

## 12. Error Handling

- Supabase errors → toast notifications via shadcn `toast`.
- Network offline → show banner, queue mutations, retry on reconnect.
- Form validation → Zod schemas:
  - Habit name: required, max 50 chars.
  - Goal values: positive integer.
  - Journal content: max 2000 chars.

---

## 13. Testing

| Type | Scope |
|------|-------|
| Unit | Streak calculation, date/timezone helpers, reset logic |
| Integration | Habit CRUD flow, completion toggle, onboarding stepper |
| E2E | Full onboarding → tracker → dashboard flow (Playwright) |

---

## 14. Performance

- Charts: memoized with `useMemo`, lazy-loaded via `next/dynamic`.
- Icons: Remixicon tree-shaken, only used icons in bundle.
- Heatmap: fetch last 365 days in single query, cache aggressively.
- React Query: configured staleTime per query type (see table above).

---

## 15. Dependencies to Add

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Supabase client |
| `@tanstack/react-query` | Server state management |
| `@dnd-kit/core` | Drag and drop core |
| `@dnd-kit/sortable` | Sortable list for habits |
| `recharts` | Charts and graphs |
| `date-fns` | Date manipulation |
| `date-fns-tz` | Timezone handling |
| `zod` | Validation schemas |

---

## 16. UI/UX Requirements

- Minimal and aesthetically pleasing UI.
- Dark/light theme switcher (via `next-themes`, already installed).
- Drag-and-drop habit ordering.
- Smooth animations (via Tailwind + shadcn transitions).
