-- Reports, Community anonymity and cloud self-checks (2026-10-25). Apply in the
-- Supabase SQL editor or with `supabase db push`, after 20261024000000.
--
-- 1. `reports`: the table the app's Report button writes to was never created.
-- 2. Anonymity: anonymous questions and answers no longer reveal who wrote them, and
--    nobody can see anyone else's votes. The app reads questions and answers through
--    the `questions_public` and `answers_public` views, which hide `user_id` on
--    anonymous rows from everyone except the author.
-- 3. `self_check_progress`: self-check history and saved guides, per account.

-- ---- 1. Reports ----------------------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('question', 'answer')),
  content_id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason text not null,
  additional_info text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- People can send reports but not read them; moderators use the dashboard.
drop policy if exists "Users send their own reports" on public.reports;
create policy "Users send their own reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

-- ---- 2. Anonymity --------------------------------------------------------------

-- Votes: each person sees only their own (the app only asks "did I vote?"). The
-- own-row policies keep votes working if RLS was off on these tables; the restrictive
-- one hides other people's votes even if an older policy allowed reading them all.
alter table public.question_votes enable row level security;
alter table public.answer_votes enable row level security;

drop policy if exists "Users read their own question votes" on public.question_votes;
create policy "Users read their own question votes"
  on public.question_votes for select using (auth.uid() = user_id);
drop policy if exists "Only own question votes are visible" on public.question_votes;
create policy "Only own question votes are visible"
  on public.question_votes as restrictive for select using (auth.uid() = user_id);
drop policy if exists "Users add their own question votes" on public.question_votes;
create policy "Users add their own question votes"
  on public.question_votes for insert with check (auth.uid() = user_id);
drop policy if exists "Users remove their own question votes" on public.question_votes;
create policy "Users remove their own question votes"
  on public.question_votes for delete using (auth.uid() = user_id);

drop policy if exists "Users read their own answer votes" on public.answer_votes;
create policy "Users read their own answer votes"
  on public.answer_votes for select using (auth.uid() = user_id);
drop policy if exists "Only own answer votes are visible" on public.answer_votes;
create policy "Only own answer votes are visible"
  on public.answer_votes as restrictive for select using (auth.uid() = user_id);
drop policy if exists "Users add their own answer votes" on public.answer_votes;
create policy "Users add their own answer votes"
  on public.answer_votes for insert with check (auth.uid() = user_id);
drop policy if exists "Users remove their own answer votes" on public.answer_votes;
create policy "Users remove their own answer votes"
  on public.answer_votes for delete using (auth.uid() = user_id);

-- Questions and answers: readable through views that blank the author on anonymous
-- rows (except for the author). The views run as their owner so they can read
-- `user_id`; the tables themselves no longer let the app read that column. Writes
-- still go to the tables, under their existing row level security.
create or replace view public.questions_public as
select
  id,
  title,
  content,
  category,
  case when not is_anonymous or user_id = auth.uid() then user_id end as user_id,
  case when is_anonymous then null else user_name end as user_name,
  case when is_anonymous then null else profile_picture_url end as profile_picture_url,
  is_anonymous,
  upvotes,
  answer_count,
  created_at,
  updated_at,
  is_resolved,
  tags
from public.questions;

create or replace view public.answers_public as
select
  id,
  question_id,
  content,
  case when not is_anonymous or user_id = auth.uid() then user_id end as user_id,
  case when is_anonymous then null else user_name end as user_name,
  is_anonymous,
  upvotes,
  created_at,
  updated_at,
  is_accepted,
  parent_answer_id
from public.answers;

grant select on public.questions_public, public.answers_public to anon, authenticated;

revoke select on public.questions from anon, authenticated;
grant select (
  id, title, content, category, user_name, profile_picture_url, is_anonymous, upvotes,
  answer_count, created_at, updated_at, is_resolved, tags
) on public.questions to anon, authenticated;

revoke select on public.answers from anon, authenticated;
grant select (
  id, question_id, content, user_name, is_anonymous, upvotes, created_at, updated_at,
  is_accepted, parent_answer_id
) on public.answers to anon, authenticated;

-- ---- 3. Self-checks ------------------------------------------------------------

-- One row per person and guide. `last_done` holds local wall-clock time with no
-- offset, like journey_entries.date (see mobile/src/lib/dates.ts).
create table if not exists public.self_check_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  guide_id text not null,
  last_done timestamptz,
  saved boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, guide_id)
);

alter table public.self_check_progress enable row level security;

drop policy if exists "Users read their own self-checks" on public.self_check_progress;
create policy "Users read their own self-checks"
  on public.self_check_progress for select using (auth.uid() = user_id);
drop policy if exists "Users add their own self-checks" on public.self_check_progress;
create policy "Users add their own self-checks"
  on public.self_check_progress for insert with check (auth.uid() = user_id);
drop policy if exists "Users change their own self-checks" on public.self_check_progress;
create policy "Users change their own self-checks"
  on public.self_check_progress for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users delete their own self-checks" on public.self_check_progress;
create policy "Users delete their own self-checks"
  on public.self_check_progress for delete using (auth.uid() = user_id);

notify pgrst, 'reload schema';
