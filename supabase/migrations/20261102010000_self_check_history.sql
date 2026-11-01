-- Self-check history (design refresh Phase 22): every finished check, not only the last,
-- and whether the person noticed a change. Newest first, at most 24 per guide; the app
-- writes it. Existing rows start with their last check as the only entry. Safe to run twice.

alter table public.self_check_progress
  add column if not exists history jsonb not null default '[]'::jsonb;

update public.self_check_progress
set history = jsonb_build_array(jsonb_build_object('date', last_done, 'changed', false))
where last_done is not null and history = '[]'::jsonb;
