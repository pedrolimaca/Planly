-- ============================================================
-- Planly - Complete PostgreSQL Database Schema with RLS
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text not null,
  avatar_url text,
  timezone text default 'America/Sao_Paulo',
  date_format text default 'dd/MM/yyyy',
  first_day_of_week int default 0,
  day_start_hour int default 6,
  day_end_hour int default 22,
  theme text default 'light',
  notification_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Tasks table
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null default 'personal',
  priority text not null default 'medium',
  status text not null default 'pending',
  due_date date,
  due_time time,
  estimated_minutes int,
  actual_minutes int,
  tags text[] default '{}',
  recurrence text,
  notes text,
  order_index int default 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks for all using (auth.uid() = user_id);

-- Subtasks table
create table if not exists public.subtasks (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subtasks enable row level security;
create policy "Users manage own subtasks" on public.subtasks for all using (
  exists (select 1 from public.tasks where tasks.id = subtasks.task_id and tasks.user_id = auth.uid())
);

-- Calendar Events table
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null default 'personal',
  start_date date not null,
  start_time time,
  end_date date not null,
  end_time time,
  all_day boolean default false,
  location text,
  priority text default 'medium',
  color text default '#7c3aed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.events enable row level security;
create policy "Users manage own events" on public.events for all using (auth.uid() = user_id);

-- Reminders table
create table if not exists public.reminders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text,
  category text not null default 'personal',
  date date not null,
  time time not null,
  priority text default 'medium',
  status text default 'active',
  advance_minutes int default 0,
  recurrence text,
  snoozed_until timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reminders enable row level security;
create policy "Users manage own reminders" on public.reminders for all using (auth.uid() = user_id);

-- Finance Entries table
create table if not exists public.finance_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  description text not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount numeric(12, 2) not null,
  date date not null,
  due_date date,
  status text not null default 'paid',
  payment_method text,
  payment_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.finance_entries enable row level security;
create policy "Users manage own finance" on public.finance_entries for all using (auth.uid() = user_id);

-- Budgets table
create table if not exists public.budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  month text not null, -- YYYY-MM
  amount numeric(12, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.budgets enable row level security;
create policy "Users manage own budgets" on public.budgets for all using (auth.uid() = user_id);

-- Habits & Habit Logs
create table if not exists public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  category text default 'health',
  frequency text default 'daily',
  daily_goal int default 1,
  start_date date not null,
  color text default '#7c3aed',
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.habits enable row level security;
create policy "Users manage own habits" on public.habits for all using (auth.uid() = user_id);

create table if not exists public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  completed boolean default true,
  value numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.habit_logs enable row level security;
create policy "Users manage own habit logs" on public.habit_logs for all using (auth.uid() = user_id);

-- Workouts & Workout Logs
create table if not exists public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  muscle_groups text[] default '{}',
  duration_minutes int default 60,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workouts enable row level security;
create policy "Users manage own workouts" on public.workouts for all using (auth.uid() = user_id);

-- Goals & Milestones
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  area text not null,
  priority text default 'high',
  status text default 'in_progress',
  due_date date,
  motivation text,
  progress int default 0,
  progress_type text default 'manual',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.goals enable row level security;
create policy "Users manage own goals" on public.goals for all using (auth.uid() = user_id);
