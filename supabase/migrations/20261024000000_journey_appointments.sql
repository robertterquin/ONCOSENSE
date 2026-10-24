-- Appointments for Journey (redesign Phase 4). Additive: creates one table and its
-- row level security; nothing existing changes. Apply in the Supabase SQL editor or
-- with `supabase db push`.
--
-- IDs are text, like the other journey tables (the app writes the creation time in
-- milliseconds). `starts_at` holds local wall-clock time with no offset, the same
-- convention as journey_entries.date (see mobile/src/lib/dates.ts).

create table if not exists public.journey_appointments (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  location text,
  notes text,
  treatment_id text,
  created_at timestamptz not null default now()
);

create index if not exists journey_appointments_user_starts_idx
  on public.journey_appointments (user_id, starts_at);

alter table public.journey_appointments enable row level security;

drop policy if exists "Users read their own appointments" on public.journey_appointments;
create policy "Users read their own appointments"
  on public.journey_appointments for select
  using (auth.uid() = user_id);

drop policy if exists "Users add their own appointments" on public.journey_appointments;
create policy "Users add their own appointments"
  on public.journey_appointments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users change their own appointments" on public.journey_appointments;
create policy "Users change their own appointments"
  on public.journey_appointments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete their own appointments" on public.journey_appointments;
create policy "Users delete their own appointments"
  on public.journey_appointments for delete
  using (auth.uid() = user_id);
