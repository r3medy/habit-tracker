import { supabase } from "./client"
import type {
  HabitInsert,
  HabitUpdate,
  CompletionInsert,
  SubtaskInsert,
  SubtaskCompletionInsert,
  GoalInsert,
  GoalMilestoneInsert,
  GoalUpdate,
  JournalEntryInsert,
  UserProfileInsert,
  UserProfileUpdate,
  HabitRow,
  CompletionRow,
  SubtaskRow,
  SubtaskCompletionRow,
  GoalRow,
  GoalMilestoneRow,
  JournalEntryRow,
  UserProfileRow,
} from "./types"

type InsertMap = {
  habits: HabitInsert
  completions: CompletionInsert
  subtasks: SubtaskInsert
  subtask_completions: SubtaskCompletionInsert
  goals: GoalInsert
  goal_milestones: GoalMilestoneInsert
  journal_entries: JournalEntryInsert
  user_profile: UserProfileInsert
}

type RowMap = {
  habits: HabitRow
  completions: CompletionRow
  subtasks: SubtaskRow
  subtask_completions: SubtaskCompletionRow
  goals: GoalRow
  goal_milestones: GoalMilestoneRow
  journal_entries: JournalEntryRow
  user_profile: UserProfileRow
}

type UpdateMap = {
  habits: HabitUpdate
  user_profile: UserProfileUpdate
  goals: GoalUpdate
}

export async function insertTyped<T extends keyof InsertMap>(
  table: T,
  data: InsertMap[T][]
): Promise<{ data: RowMap[T] | null; error: Error | null }> {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data as never)
    .select()
    .single()
  return { data: result as RowMap[T] | null, error }
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
  updates: { id: string; sort_order: number }[]
): Promise<Error | null> {
  const promises = updates.map(({ id, sort_order }) =>
    supabase.from("habits").update({ sort_order } as never).eq("id", id)
  )
  const results = await Promise.all(promises)
  const errors = results.filter((r) => r.error)
  return errors.length > 0 ? errors[0].error : null
}

export async function insertMilestones(
  milestones: GoalMilestoneInsert[]
): Promise<Error | null> {
  const { error } = await supabase
    .from("goal_milestones")
    .insert(milestones as never)
  return error
}
