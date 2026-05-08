-- Habit Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- User profile (single row for single-user app)
create table if not exists user_profile (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'UTC',
  has_onboarded boolean not null default false,
  verified boolean NOT NULL default false,
  created_at timestamptz not null default now()
);

-- Habits
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null,
  color text not null,
  schedule_type text not null check (schedule_type in ('daily', 'weekly', 'monthly', 'custom')),
  schedule_days int[],
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Habit completions (one row per habit per day)
create table if not exists completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique(habit_id, date)
);

-- Daily todo list
create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  date date not null,
  completed boolean not null default false,
  carry_over boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Goals
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  target_type text not null check (target_type in ('streak', 'count')),
  target_value int not null,
  start_date date not null,
  end_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Goal milestones
create table if not exists goal_milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) on delete cascade,
  threshold_pct int not null,
  reached boolean not null default false,
  reached_at timestamptz
);

-- Journal entries (self-reflection)
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profile(id) on delete cascade,
  date date not null unique,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_completions_habit_date on completions(habit_id, date);
create index if not exists idx_completions_date on completions(date);
create index if not exists idx_goals_habit on goals(habit_id);
create index if not exists idx_journal_user_date on journal_entries(user_id, date);
create index if not exists idx_todos_date on todos(date);
