-- ============================================================
-- GST112 CBT Admin — Supabase setup
-- Paste this entire file into your Supabase SQL Editor and run it.
-- After running, go to Authentication → Users → Add user
-- to create your admin account.
-- ============================================================

-- 1. exam_attempts table
create table if not exists exam_attempts (
  id            uuid        primary key default gen_random_uuid(),
  student_name  text        not null,
  matric_number text        not null,
  score         integer     not null,
  total_questions integer   not null,
  correct_answers integer   not null,
  wrong_answers   integer   not null,
  skipped         integer   not null,
  time_used       integer   not null,   -- seconds
  topic_accuracy  jsonb     not null default '{}',
  questions       jsonb     not null default '[]',
  created_at      timestamptz not null default now()
);

-- RLS: students can INSERT; only authenticated admin can SELECT / DELETE
alter table exam_attempts enable row level security;

drop policy if exists "Anyone can submit attempts"  on exam_attempts;
drop policy if exists "Admin can view attempts"     on exam_attempts;
drop policy if exists "Admin can delete attempts"   on exam_attempts;

create policy "Anyone can submit attempts"
  on exam_attempts for insert
  with check (true);

create policy "Admin can view attempts"
  on exam_attempts for select
  using (auth.role() = 'authenticated');

create policy "Admin can delete attempts"
  on exam_attempts for delete
  using (auth.role() = 'authenticated');

-- 2. questions table
create table if not exists questions (
  id             integer  primary key,
  question       text     not null,
  option_a       text     not null,
  option_b       text     not null,
  option_c       text     not null,
  option_d       text     not null,
  correct_answer char(1)  not null check (correct_answer in ('A','B','C','D')),
  topic          text     not null,
  created_at     timestamptz not null default now()
);

-- RLS: anyone can read questions; only admin can modify
alter table questions enable row level security;

drop policy if exists "Anyone can read questions"  on questions;
drop policy if exists "Admin can manage questions" on questions;

create policy "Anyone can read questions"
  on questions for select
  using (true);

create policy "Admin can manage questions"
  on questions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
