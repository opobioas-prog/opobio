-- Supabase schema for Entrenador de Oposiciones
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.test_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  code text,
  subtopic text,
  filename text not null,
  source text not null default 'import',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, filename)
);

create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.test_topics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  question_order integer not null default 0,
  question_key text not null,
  text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_letter text not null check (correct_letter in ('A', 'B', 'C', 'D')),
  explanation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id, question_key)
);

create table if not exists public.question_progress (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  question_id uuid not null references public.test_questions(id) on delete cascade,
  attempts integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  last_answer text check (last_answer is null or last_answer in ('A', 'B', 'C', 'D')),
  last_correct boolean,
  last_answered_at timestamptz,
  is_favorite boolean not null default false,
  relevance_rating smallint check (relevance_rating between 1 and 5),
  delete_suggested boolean not null default false,
  review_note text,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists idx_test_topics_user_code on public.test_topics(user_id, code);
create index if not exists idx_test_questions_topic on public.test_questions(topic_id);
create index if not exists idx_question_progress_user_fav on public.question_progress(user_id, is_favorite);
create index if not exists idx_question_progress_user_delete on public.question_progress(user_id, delete_suggested);

alter table public.test_topics enable row level security;
alter table public.test_questions enable row level security;
alter table public.question_progress enable row level security;

drop policy if exists "Users manage own test topics" on public.test_topics;
create policy "Users manage own test topics"
on public.test_topics
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own test questions" on public.test_questions;
create policy "Users manage own test questions"
on public.test_questions
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own question progress" on public.question_progress;
create policy "Users manage own question progress"
on public.question_progress
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

