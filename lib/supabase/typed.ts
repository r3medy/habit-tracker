import { supabase } from "./client"
import type {
  HabitInsert,
  HabitUpdate,
  CompletionInsert,
  GoalInsert,
  GoalMilestoneInsert,
  GoalUpdate,
  JournalEntryInsert,
  UserProfileInsert,
  UserProfileUpdate,
  TodoInsert,
  TodoUpdate,
  HabitRow,
  CompletionRow,
  GoalRow,
  GoalMilestoneRow,
  JournalEntryRow,
  UserProfileRow,
  TodoRow,
} from "./types"

type InsertMap = {
  habits: HabitInsert
  completions: CompletionInsert
  goals: GoalInsert
  goal_milestones: GoalMilestoneInsert
  journal_entries: JournalEntryInsert
  user_profile: UserProfileInsert
  todos: TodoInsert
}

type RowMap = {
  habits: HabitRow
  completions: CompletionRow
  goals: GoalRow
  goal_milestones: GoalMilestoneRow
  journal_entries: JournalEntryRow
  user_profile: UserProfileRow
  todos: TodoRow
}

type UpdateMap = {
  habits: HabitUpdate
  user_profile: UserProfileUpdate
  goals: GoalUpdate
  todos: TodoUpdate
}

export async function insertTyped<T extends keyof InsertMap>(
  table: T,
  data: InsertMap[T][]
): Promise<{ data: RowMap[T] | null; error: Error | null }> {
  if (data.length === 1) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data as any)
      .select()
      .single()
    return { data: result as RowMap[T] | null, error }
  }
  
  const { data: result, error } = await supabase
    .from(table)
    .insert(data as any)
    .select()
    
  return { data: (result as RowMap[T][] | null)?.[0] ?? null, error }
}

export async function upsertTyped<T extends keyof InsertMap>(
  table: T,
  data: InsertMap[T][],
  options: { onConflict: string }
): Promise<{ data: RowMap[T] | null; error: Error | null }> {
  const { data: result, error } = await supabase
    .from(table)
    .upsert(data as never, options)
    .select()
    .single()
  return { data: result as RowMap[T] | null, error }
}

export async function updateTyped<T extends keyof UpdateMap>(
  table: T,
  updates: UpdateMap[T],
  eqColumn: string,
  eqValue: string
): Promise<{ data: RowMap[T] | null; error: Error | null }> {
  const { data: result, error } = await supabase
    .from(table)
    .update(updates as never)
    .eq(eqColumn as never, eqValue)
    .select()
    .single()
  return { data: result as RowMap[T] | null, error }
}

export async function updateSortOrder(
  table: "habits" | "todos",
  updates: { id: string; sort_order: number }[]
): Promise<Error | null> {
  const { error } = await (supabase.rpc as any)("batch_update_sort_order", {
    p_table: table,
    p_ids: updates.map((u) => u.id),
    p_orders: updates.map((u) => u.sort_order),
  })
  return error
}

export async function insertMilestones(
  milestones: GoalMilestoneInsert[]
): Promise<Error | null> {
  const { error } = await supabase
    .from("goal_milestones")
    .insert(milestones as never)
  return error
}
