# Todo List — Design Specification

**Date:** 2026-05-07
**Phase:** 6
**Status:** Draft

---

## 1. Overview

Daily todo list with sub-todos, carry-over from previous day, drag-and-drop, and a recap on the tracker page.

---

## 2. Data Model

### DB: `todos` table (already in schema)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| text | text | NOT NULL, max 200 |
| date | date | The date this todo belongs to |
| completed | boolean | DEFAULT false |
| carry_over | boolean | DEFAULT true |
| sort_order | int | For drag-and-drop |
| created_at | timestamptz | |

### Sub-todos reuse `subtasks` table
- `subtasks.todo_id` (nullable FK) — links to `todos.id`
- `subtasks.habit_id` stays for habits
- Completions reuse `subtask_completions` keyed by date

---

## 3. Architecture

### Route
- `app/(app)/todos/page.tsx`

### Components
- `components/todos/todo-page.tsx` — Main page with date nav
- `components/todos/todo-list.tsx` — DnD sortable list
- `components/todos/todo-item.tsx` — Single row (checkbox, text, pin, delete, expand sub-todos)

### Modifications
- `components/shared/sidebar.tsx` — Add ListTodo icon → /todos
- `app/(app)/tracker/page.tsx` — Add todo recap card

### Hooks
- `hooks/use-todos.ts` — CRUD for todos
- `hooks/use-todo-carry-over.ts` — Carry-over from yesterday

---

## 4. Carry-Over Logic
1. On mount for today: check localStorage flag `todo-carry-YYYY-MM-DD`
2. If not set: fetch yesterday's todos where `completed=false AND carry_over=true`
3. Insert copies to today, same sort_order and carry_over=true
4. Set localStorage flag

---

## 5. Tracker Recap
Small card at bottom of `/tracker`: "3 todos today — [View]"

---

## 6. Sidebar
Add `ListTodo` icon between Tracker and Dashboard icons.
