-- Community counts (November 2026, found in supabase/reference/schema.sql): vote and
-- answer counts could be changed by anyone with the app's public key, signed in or not,
-- and a signed-in user could post or vote under someone else's id or edit their own
-- post's counts. Safe to run twice.

-- 1. The count functions recount from the votes and answers instead of adding or taking
--    away 1, so calling one again (or without voting) changes nothing. The names stay:
--    the app and the delete-account function call them after each change. They run as
--    their owner to see every vote (votes are private), with a fixed search_path.

create or replace function public.increment_question_upvotes(question_id_param uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.questions
  set upvotes = (select count(*) from public.question_votes v where v.question_id = question_id_param)
  where id = question_id_param;
$$;

create or replace function public.decrement_question_upvotes(question_id_param uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.questions
  set upvotes = (select count(*) from public.question_votes v where v.question_id = question_id_param)
  where id = question_id_param;
$$;

create or replace function public.increment_answer_upvotes(answer_id_param uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.answers
  set upvotes = (select count(*) from public.answer_votes v where v.answer_id = answer_id_param)
  where id = answer_id_param;
$$;

create or replace function public.decrement_answer_upvotes(answer_id_param uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.answers
  set upvotes = (select count(*) from public.answer_votes v where v.answer_id = answer_id_param)
  where id = answer_id_param;
$$;

create or replace function public.increment_answer_count(question_id_param uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.questions
  set answer_count = (select count(*) from public.answers a where a.question_id = question_id_param)
  where id = question_id_param;
$$;

create or replace function public.decrement_answer_count(question_id_param uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.questions
  set answer_count = (select count(*) from public.answers a where a.question_id = question_id_param)
  where id = question_id_param;
$$;

-- Signed-in people only (votes and answers need an account anyway).
revoke execute on function
  public.increment_question_upvotes(uuid),
  public.decrement_question_upvotes(uuid),
  public.increment_answer_upvotes(uuid),
  public.decrement_answer_upvotes(uuid),
  public.increment_answer_count(uuid),
  public.decrement_answer_count(uuid)
from public, anon;
grant execute on function
  public.increment_question_upvotes(uuid),
  public.decrement_question_upvotes(uuid),
  public.increment_answer_upvotes(uuid),
  public.decrement_answer_upvotes(uuid),
  public.increment_answer_count(uuid),
  public.decrement_answer_count(uuid)
to authenticated, service_role;

-- The Advisors warning for the journey tables' trigger function too.
alter function public.update_updated_at_column() set search_path = '';

-- 2. Posts and votes only under your own id. These older rules allowed any signed-in
--    user and, being permissive, overrode the "their auth id" rules beside them.
drop policy if exists "Authenticated users can create questions" on public.questions;
drop policy if exists "Authenticated users can create answers" on public.answers;
drop policy if exists "Authenticated users can vote on questions" on public.question_votes;
drop policy if exists "Authenticated users can vote on answers" on public.answer_votes;

-- Already blocked by the restrictive "Only own ... votes are visible" rules; dropped so
-- the rules read the way they work.
drop policy if exists "Question votes are viewable by everyone" on public.question_votes;
drop policy if exists "Answer votes are viewable by everyone" on public.answer_votes;

-- 3. Counts aren't set by hand: the app never edits a question or answer after posting,
--    and a new one starts at zero whatever is sent.
revoke update on public.questions, public.answers from anon, authenticated;

create or replace function public.start_counts_at_zero()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.upvotes := 0;
  if tg_table_name = 'questions' then
    new.answer_count := 0;
  end if;
  return new;
end;
$$;

drop trigger if exists start_counts_at_zero on public.questions;
create trigger start_counts_at_zero
  before insert on public.questions
  for each row execute function public.start_counts_at_zero();

drop trigger if exists start_counts_at_zero on public.answers;
create trigger start_counts_at_zero
  before insert on public.answers
  for each row execute function public.start_counts_at_zero();

-- 4. Every count as it should be now.
update public.questions q
set
  upvotes = (select count(*) from public.question_votes v where v.question_id = q.id),
  answer_count = (select count(*) from public.answers a where a.question_id = q.id);

update public.answers a
set upvotes = (select count(*) from public.answer_votes v where v.answer_id = a.id);
