# Habit Tracker — Design System

**Project:** Habit Tracker
**Date:** 2026-05-07
**Stack:** Next.js 16 · React 19 · shadcn/ui (radix-maia) · Tailwind v4 · Remixicon

---

## 1. Design Philosophy

**Minimal, focused, calm.** The interface should feel like a quiet workspace — no visual noise, no distractions. Every element serves a purpose. The design supports daily habit formation through clarity, consistency, and gentle feedback.

**Core principles:**
- Content-first, chrome-minimal
- One primary action per screen
- Data visualization is functional, not decorative
- Animations confirm actions, never distract
- Dark mode is a first-class citizen, not an afterthought

---

## 2. Color System

### Constraint: No pure black (#000000) or pure white (#FFFFFF)

### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.98 0.005 264)` | Page background |
| `--foreground` | `oklch(0.25 0.02 264)` | Primary text |
| `--card` | `oklch(1 0 0)` | Card surfaces |
| `--card-foreground` | `oklch(0.25 0.02 264)` | Card text |
| `--popover` | `oklch(1 0 0)` | Popover surfaces |
| `--popover-foreground` | `oklch(0.25 0.02 264)` | Popover text |
| `--primary` | `oklch(0.55 0.2 160)` | Primary actions (teal-green) |
| `--primary-foreground` | `oklch(0.98 0.005 160)` | Primary button text |
| `--secondary` | `oklch(0.94 0.01 264)` | Secondary surfaces |
| `--secondary-foreground` | `oklch(0.35 0.02 264)` | Secondary text |
| `--muted` | `oklch(0.93 0.008 264)` | Muted surfaces |
| `--muted-foreground` | `oklch(0.5 0.01 264)` | Muted text |
| `--accent` | `oklch(0.92 0.03 85)` | Accent highlights (warm amber) |
| `--accent-foreground` | `oklch(0.3 0.05 85)` | Accent text |
| `--destructive` | `oklch(0.55 0.22 25)` | Destructive actions |
| `--destructive-foreground` | `oklch(0.98 0.005 25)` | Destructive text |
| `--border` | `oklch(0.90 0.008 264)` | Borders |
| `--input` | `oklch(0.92 0.008 264)` | Input backgrounds |
| `--ring` | `oklch(0.55 0.2 160)` | Focus rings |

### Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.15 0.015 264)` | Page background (deep navy-gray) |
| `--foreground` | `oklch(0.92 0.008 264)` | Primary text |
| `--card` | `oklch(0.18 0.015 264)` | Card surfaces |
| `--card-foreground` | `oklch(0.92 0.008 264)` | Card text |
| `--popover` | `oklch(0.18 0.015 264)` | Popover surfaces |
| `--popover-foreground` | `oklch(0.92 0.008 264)` | Popover text |
| `--primary` | `oklch(0.7 0.18 160)` | Primary actions (lighter teal-green) |
| `--primary-foreground` | `oklch(0.15 0.015 160)` | Primary button text |
| `--secondary` | `oklch(0.22 0.015 264)` | Secondary surfaces |
| `--secondary-foreground` | `oklch(0.85 0.01 264)` | Secondary text |
| `--muted` | `oklch(0.22 0.012 264)` | Muted surfaces |
| `--muted-foreground` | `oklch(0.6 0.01 264)` | Muted text |
| `--accent` | `oklch(0.35 0.08 85)` | Accent highlights (warm amber) |
| `--accent-foreground` | `oklch(0.9 0.04 85)` | Accent text |
| `--destructive` | `oklch(0.6 0.2 25)` | Destructive actions |
| `--destructive-foreground` | `oklch(0.95 0.005 25)` | Destructive text |
| `--border` | `oklch(0.25 0.015 264)` | Borders |
| `--input` | `oklch(0.22 0.015 264)` | Input backgrounds |
| `--ring` | `oklch(0.7 0.18 160)` | Focus rings |

### Habit Colors (User-selectable)

| Color | Light | Dark | Use Case |
|-------|-------|------|----------|
| Teal | `oklch(0.65 0.15 175)` | `oklch(0.72 0.14 175)` | Health, exercise |
| Amber | `oklch(0.7 0.18 75)` | `oklch(0.78 0.16 75)` | Learning, reading |
| Rose | `oklch(0.65 0.2 15)` | `oklch(0.72 0.18 15)` | Self-care, meditation |
| Sky | `oklch(0.7 0.12 230)` | `oklch(0.78 0.1 230)` | Productivity, work |
| Violet | `oklch(0.6 0.2 300)` | `oklch(0.68 0.18 300)` | Creativity, writing |
| Emerald | `oklch(0.65 0.18 150)` | `oklch(0.72 0.16 150)` | Finance, saving |
| Orange | `oklch(0.68 0.2 55)` | `oklch(0.75 0.18 55)` | Social, connection |
| Slate | `oklch(0.55 0.03 250)` | `oklch(0.65 0.03 250)` | General, default |

### Heatmap Colors

| Level | Light | Dark |
|-------|-------|------|
| 0 (none) | `oklch(0.93 0.005 264)` | `oklch(0.2 0.01 264)` |
| 1 (low) | `oklch(0.75 0.12 160)` | `oklch(0.55 0.12 160)` |
| 2 (medium) | `oklch(0.6 0.16 160)` | `oklch(0.65 0.16 160)` |
| 3 (high) | `oklch(0.45 0.18 160)` | `oklch(0.75 0.18 160)` |

---

## 3. Typography

### Font Family

Already installed: **Geist** (sans-serif) + **Geist Mono** (monospace)

| Role | Font | Weight | Size (rem) | Line Height |
|------|------|--------|------------|-------------|
| Display | Geist | 600 | 2.5 | 1.1 |
| H1 | Geist | 600 | 1.875 | 1.2 |
| H2 | Geist | 600 | 1.5 | 1.25 |
| H3 | Geist | 500 | 1.25 | 1.3 |
| Body | Geist | 400 | 1 | 1.5 |
| Small | Geist | 400 | 0.875 | 1.4 |
| Caption | Geist | 400 | 0.75 | 1.3 |
| Tabular | Geist Mono | 400 | 0.875 | 1.4 |

### Type Scale

```
2.5rem  — Page titles (dashboard overview)
1.875rem — Section headers
1.5rem  — Card titles
1.25rem — Subsection headers
1rem    — Body text, habit names
0.875rem — Labels, metadata, streaks
0.75rem — Timestamps, helper text
```

### Number Formatting

- Use **Geist Mono** for all tabular data: streak counts, percentages, dates
- Tabular figures prevent layout shift in charts and stats

---

## 4. Spacing System

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Icon gaps, checkbox padding |
| `space-3` | 12px | Form field gaps |
| `space-4` | 16px | Card padding, section gaps |
| `space-5` | 20px | Medium component gaps |
| `space-6` | 24px | Section margins |
| `space-8` | 32px | Page section gaps |
| `space-10` | 40px | Major section dividers |
| `space-12` | 48px | Page margins (mobile) |
| `space-16` | 64px | Page margins (desktop) |

---

## 5. Component Styles

### Cards

- Border radius: `var(--radius)` (from shadcn config)
- Border: `1px solid var(--border)`
- Shadow: `0 1px 2px 0 oklch(0 0 0 / 0.05)` (light), none (dark)
- Padding: `space-4` (16px)
- Hover: subtle border color shift, no elevation change

### Habit Cards

- Left border accent: `4px solid [habit color]`
- Height: auto, min 64px
- Checkbox: left-aligned, 24px touch target
- Streak badge: right-aligned, small text + icon

### Buttons

- Primary: filled, `--primary` background
- Secondary: outline, `--border` border
- Ghost: no background, hover fills `--muted`
- Icon buttons: 40px minimum touch target
- Loading state: spinner replaces icon via `data-icon`

### Charts

- Grid lines: `var(--border)` at 30% opacity
- Axis labels: `--muted-foreground`
- Data colors: use habit color palette
- Tooltips: `--popover` background, `--popover-foreground` text
- Legend: interactive, click to toggle series
- Empty state: `Empty` component with guidance text

### Progress Rings

- Track: `--muted` background
- Fill: habit color or `--primary`
- Stroke width: 8px
- Size: 48px (small), 80px (medium), 120px (large)
- Center text: tabular font, percentage

### Heatmap

- Cell size: 12px (desktop), 10px (mobile)
- Gap: 3px
- Border radius: 2px
- Month labels: small text above grid
- Day labels: first column only (Mon, Wed, Fri)

---

## 6. Animation System

| Interaction | Duration | Easing | Transform |
|-------------|----------|--------|-----------|
| Checkbox toggle | 150ms | ease-out | scale(0.95) → scale(1) |
| Card hover | 200ms | ease-out | translateY(-1px) |
| Page transition | 250ms | ease-out | fade + slide |
| Modal open | 300ms | ease-out | scale(0.95) + fade |
| Modal close | 200ms | ease-in | scale(1) → scale(0.95) + fade |
| List reorder | 200ms | ease-out | translate |
| Streak badge pop | 200ms | spring | scale(1) → scale(1.1) → scale(1) |
| Chart load | 400ms | ease-out | stagger 50ms per element |
| Toast enter | 250ms | ease-out | slide up + fade |
| Toast exit | 200ms | ease-in | slide down + fade |

### Reduced Motion

Respect `prefers-reduced-motion: reduce`:
- Disable all non-essential animations
- Checkbox toggle: instant state change
- Page transitions: instant
- Chart load: no stagger, show immediately

---

## 7. Layout Structure

### Mobile (≤768px)

- Single column layout
- Bottom navigation: Tracker | Dashboard (2 items)
- Page padding: `space-4` (16px) horizontal
- Cards: full width, stacked
- Charts: full width, simplified axes

### Tablet (768px – 1024px)

- Single column, wider cards
- Bottom navigation or top tabs
- Page padding: `space-8` (32px) horizontal
- Charts: can show more detail

### Desktop (≥1024px)

- Max content width: `max-w-5xl` (1024px), centered
- Top navigation bar with logo + tabs + theme toggle
- Page padding: `space-16` (64px) horizontal
- Dashboard: 2-column grid for charts
- Tracker: centered column, max-w-2xl

---

## 8. Icon System

**Library:** Remixicon (already installed)

| Usage | Icon | Size |
|-------|------|------|
| Habit: exercise | `RiRunLine` | 20px |
| Habit: reading | `RiBookReadLine` | 20px |
| Habit: meditation | `RiMindMap` | 20px |
| Habit: water | `RiCupLine` | 20px |
| Habit: code | `RiCodeLine` | 20px |
| Habit: writing | `RiEditLine` | 20px |
| Habit: finance | `RiWalletLine` | 20px |
| Streak | `RiFireLine` | 16px |
| Calendar | `RiCalendarLine` | 16px |
| Chart | `RiBarChartHorizontalLine` | 16px |
| Settings | `RiSettings3Line` | 20px |
| Theme toggle | `RiSunLine` / `RiMoonLine` | 20px |
| Add | `RiAddLine` | 20px |
| Delete | `RiDeleteBinLine` | 16px |
| Check | `RiCheckLine` | 16px |
| Chevron | `RiArrowRightSLine` | 16px |

### Icon Rules

- All icons from Remixicon family only — no mixing
- Stroke width: consistent (Remixicon default)
- Inside buttons: use `data-icon="inline-start"` or `data-icon="inline-end"`
- No sizing classes on icons inside shadcn components
- Icon-only buttons: minimum 40px touch target + `aria-label`

---

## 9. Dark Mode Strategy

- Use semantic tokens exclusively — never raw hex values
- Dark mode is not inverted light mode — surfaces are desaturated
- Contrast ratios verified independently for each mode
- Habit colors shift to lighter, more saturated variants in dark mode
- Charts use same accessible palette, adjusted for dark background
- Shadows removed in dark mode — use border contrast for elevation

---

## 10. Accessibility

- All interactive elements: minimum 44px touch target
- Focus rings: `2px solid var(--ring)` with `2px` offset
- Color contrast: all text ≥ 4.5:1 (AA)
- Color never conveys information alone — always paired with icon/text
- Form fields: visible labels, error below field
- Charts: text summary for screen readers, keyboard-navigable elements
- Keyboard navigation: tab order matches visual order
- `prefers-reduced-motion` respected globally

---

## 11. Empty States

| Context | Message | Action |
|---------|---------|--------|
| No habits | "No habits yet" | "Add your first habit" → onboarding |
| No completions today | "Today is fresh" | "Start tracking" |
| No goals | "No goals set" | "Set a goal" |
| No journal | "No reflection yet" | "Write your thoughts" |
| No data (charts) | "Not enough data yet" | "Keep tracking to see insights" |

---

## 12. Loading States

- Initial load: skeleton screens matching card layout
- Chart load: shimmer placeholder
- Habit list: skeleton cards (3 items)
- Subsequent loads: React Query stale-while-revalidate, no spinner unless >300ms
- Button loading: spinner via `data-icon`, button disabled
