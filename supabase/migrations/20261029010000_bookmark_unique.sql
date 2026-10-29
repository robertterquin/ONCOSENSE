-- Saved questions and help contacts couldn't be saved: the app upserts with
-- ON CONFLICT (user_id, question_id) / (user_id, resource_id), but the live tables
-- were created without those unique constraints, so every save was rejected.
-- Remove any duplicates first (keeping the earliest save), then add the constraints.

delete from public.question_bookmarks a
using public.question_bookmarks b
where a.user_id = b.user_id
  and a.question_id = b.question_id
  and (coalesce(a.created_at, '-infinity'), a.id::text) > (coalesce(b.created_at, '-infinity'), b.id::text);

delete from public.resource_bookmarks a
using public.resource_bookmarks b
where a.user_id = b.user_id
  and a.resource_id = b.resource_id
  and (coalesce(a.created_at, '-infinity'), a.id::text) > (coalesce(b.created_at, '-infinity'), b.id::text);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'question_bookmarks_user_id_question_id_key'
  ) then
    alter table public.question_bookmarks
      add constraint question_bookmarks_user_id_question_id_key unique (user_id, question_id);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'resource_bookmarks_user_id_resource_id_key'
  ) then
    alter table public.resource_bookmarks
      add constraint resource_bookmarks_user_id_resource_id_key unique (user_id, resource_id);
  end if;
end $$;

notify pgrst, 'reload schema';
