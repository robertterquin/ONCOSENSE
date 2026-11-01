-- Questions can name the cancer they're about (design refresh Phase 21), so cancer pages
-- show their questions and Community can filter by the person's cancer. Optional: older
-- questions and general ones have none. Safe to run twice.

alter table public.questions
  add column if not exists cancer_type_id uuid references public.cancer_types (id) on delete set null;

create index if not exists questions_cancer_type_id_idx on public.questions (cancer_type_id);

-- The public view gains the column at the end (the rest is unchanged from 20261025000000).
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
  tags,
  cancer_type_id
from public.questions;

-- Posting a question reads its columns back; the app may read this one too.
grant select (cancer_type_id) on public.questions to anon, authenticated;
