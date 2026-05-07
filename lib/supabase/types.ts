export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserProfileRow = {
  id: string
  name: string
  timezone: string
  has_onboarded: boolean
  verified: boolean
  created_at: string
}

export type UserProfileInsert = {
  id?: string
  name: string
  timezone?: string
  has_onboarded?: boolean
  verified?: boolean
  created_at?: string
}

export type UserProfileUpdate = {
  id?: string
  name?: string
  timezone?: string
  has_onboarded?: boolean
  verified?: boolean
  created_at?: string
}

export type HabitRow = {
  id: string
  name: string
  icon: string
  color: string
  schedule_type: "daily" | "weekly" | "monthly" | "custom"
  schedule_days: number[] | null
  sort_order: number
  created_at: string
}

export type HabitInsert = {
  id?: string
  name: string
  icon: string
  color: string
  schedule_type: "daily" | "weekly" | "monthly" | "custom"
  schedule_days?: number[] | null
  sort_order?: number
  created_at?: string
}

export type HabitUpdate = {
  id?: string
  name?: string
  icon?: string
  color?: string
  schedule_type?: "daily" | "weekly" | "monthly" | "custom"
  schedule_days?: number[] | null
  sort_order?: number
  created_at?: string
}

export type CompletionRow = {
  id: string
  habit_id: string
  date: string
  completed: boolean
  completed_at: string | null
}

export type CompletionInsert = {
  id?: string
  habit_id: string
  date: string
  completed?: boolean
  completed_at?: string | null
}

export type SubtaskRow = {
  id: string
  habit_id: string
  todo_id: string | null
  name: string
  sort_order: number
  created_at: string
}

export type SubtaskInsert = {
  id?: string
  habit_id?: string
  todo_id?: string | null
  name: string
  sort_order?: number
  created_at?: string
}

export type SubtaskCompletionRow = {
  id: string
  subtask_id: string
  date: string
  completed: boolean
}

export type SubtaskCompletionInsert = {
  id?: string
  subtask_id: string
  date: string
  completed?: boolean
}

export type GoalRow = {
  id: string
  habit_id: string
  target_type: "streak" | "count"
  target_value: number
  start_date: string
  end_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
}

export type GoalInsert = {
  id?: string
  habit_id: string
  target_type: "streak" | "count"
  target_value: number
  start_date: string
  end_date?: string | null
  completed?: boolean
  completed_at?: string | null
  created_at?: string
}

export type GoalUpdate = {
  id?: string
  habit_id?: string
  target_type?: "streak" | "count"
  target_value?: number
  start_date?: string
  end_date?: string | null
  completed?: boolean
  completed_at?: string | null
  created_at?: string
}

export type GoalMilestoneRow = {
  id: string
  goal_id: string
  threshold_pct: number
  reached: boolean
  reached_at: string | null
}

export type GoalMilestoneInsert = {
  id?: string
  goal_id: string
  threshold_pct: number
  reached?: boolean
  reached_at?: string | null
}

export type JournalEntryRow = {
  id: string
  user_id: string
  date: string
  content: string | null
  created_at: string
  updated_at: string
}

export type JournalEntryInsert = {
  id?: string
  user_id: string
  date: string
  content?: string | null
  created_at?: string
  updated_at?: string
}

export type TodoRow = {
  id: string
  text: string
  date: string
  completed: boolean
  carry_over: boolean
  sort_order: number
  created_at: string
}

export type TodoInsert = {
  id?: string
  text: string
  date: string
  completed?: boolean
  carry_over?: boolean
  sort_order?: number
  created_at?: string
}

export type TodoUpdate = {
  id?: string
  text?: string
  date?: string
  completed?: boolean
  carry_over?: boolean
  sort_order?: number
  created_at?: string
}

export interface Database {
  public: {
    Tables: {
      user_profile: {
        Row: UserProfileRow
        Insert: UserProfileInsert
        Update: UserProfileUpdate
      }
      habits: {
        Row: HabitRow
        Insert: HabitInsert
        Update: HabitUpdate
      }
      completions: {
        Row: CompletionRow
        Insert: CompletionInsert
        Update: {
          id?: string
          habit_id?: string
          date?: string
          completed?: boolean
          completed_at?: string | null
        }
      }
      subtasks: {
        Row: SubtaskRow
        Insert: SubtaskInsert
        Update: {
          id?: string
          habit_id?: string
          todo_id?: string | null
          name?: string
          sort_order?: number
          created_at?: string
        }
      }
      subtask_completions: {
        Row: SubtaskCompletionRow
        Insert: SubtaskCompletionInsert
        Update: {
          id?: string
          subtask_id?: string
          date?: string
          completed?: boolean
        }
      }
      goals: {
        Row: GoalRow
        Insert: GoalInsert
        Update: {
          id?: string
          habit_id?: string
          target_type?: "streak" | "count"
          target_value?: number
          start_date?: string
          end_date?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      goal_milestones: {
        Row: GoalMilestoneRow
        Insert: GoalMilestoneInsert
        Update: {
          id?: string
          goal_id?: string
          threshold_pct?: number
          reached?: boolean
          reached_at?: string | null
        }
      }
      journal_entries: {
        Row: JournalEntryRow
        Insert: JournalEntryInsert
        Update: {
          id?: string
          user_id?: string
          date?: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: TodoRow
        Insert: TodoInsert
        Update: {
          id?: string
          text?: string
          date?: string
          completed?: boolean
          carry_over?: boolean
          sort_order?: number
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
