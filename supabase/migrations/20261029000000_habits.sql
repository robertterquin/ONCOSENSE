-- Prevention habits, per account (mobile/src/api/habits.ts):
-- 1. `habit_completions`: which habits a person ticked on which day.
-- 2. `habit_bookmarks`: habits a person saved to their profile.
-- The primary keys are the upserts' conflict targets.

-- ---- 1. Completions -------------------------------------------------------------

-- `completed_date` is the person's local calendar day (see toDayKey in habitsStore.ts).
create table if not exists public.habit_completions (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id text not null,
  completed_date date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, habit_id, completed_date)
);

alter table public.habit_completions enable row level security;

drop policy if exists "Users read their own habit completions" on public.habit_completions;
create policy "Users read their own habit completions"
  on public.habit_completions for select using (auth.uid() = user_id);
drop policy if exists "Users add their own habit completions" on public.habit_completions;
create policy "Users add their own habit completions"
  on public.habit_completions for insert with check (auth.uid() = user_id);
drop policy if exists "Users change their own habit completions" on public.habit_completions;
create policy "Users change their own habit completions"
  on public.habit_completions for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users delete their own habit completions" on public.habit_completions;
create policy "Users delete their own habit completions"
  on public.habit_completions for delete using (auth.uid() = user_id);

-- ---- 2. Bookmarks ---------------------------------------------------------------

create table if not exists public.habit_bookmarks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, habit_id)
);

alter table public.habit_bookmarks enable row level security;

drop policy if exists "Users read their own habit bookmarks" on public.habit_bookmarks;
create policy "Users read their own habit bookmarks"
  on public.habit_bookmarks for select using (auth.uid() = user_id);
drop policy if exists "Users add their own habit bookmarks" on public.habit_bookmarks;
create policy "Users add their own habit bookmarks"
  on public.habit_bookmarks for insert with check (auth.uid() = user_id);
drop policy if exists "Users change their own habit bookmarks" on public.habit_bookmarks;
create policy "Users change their own habit bookmarks"
  on public.habit_bookmarks for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users delete their own habit bookmarks" on public.habit_bookmarks;
create policy "Users delete their own habit bookmarks"
  on public.habit_bookmarks for delete using (auth.uid() = user_id);

notify pgrst, 'reload schema';
