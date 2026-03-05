-- ============================================================
-- ConferenceHub - Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── conferences ──────────────────────────────────────────────
create table if not exists conferences (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  short_description text,
  banner_url    text,
  video_url     text,
  location      text,
  start_date    date not null,
  end_date      date not null,
  status        text not null default 'draft' check (status in ('draft','published','archived')),
  created_at    timestamptz default now()
);

-- ── agenda ───────────────────────────────────────────────────
create table if not exists agenda (
  id              uuid primary key default uuid_generate_v4(),
  conference_id   uuid not null references conferences(id) on delete cascade,
  day_number      int not null default 1,
  time_start      time not null,
  time_end        time not null,
  title           text not null,
  description     text,
  speaker_id      uuid,
  created_at      timestamptz default now()
);

-- ── speakers ─────────────────────────────────────────────────
create table if not exists speakers (
  id              uuid primary key default uuid_generate_v4(),
  conference_id   uuid not null references conferences(id) on delete cascade,
  name            text not null,
  title           text,
  company         text,
  bio             text,
  avatar_url      text,
  created_at      timestamptz default now()
);

-- ── registrations ─────────────────────────────────────────────
create table if not exists registrations (
  id              uuid primary key default uuid_generate_v4(),
  conference_id   uuid not null references conferences(id) on delete cascade,
  name            text not null,
  email           text not null,
  organization    text,
  created_at      timestamptz default now(),
  unique(conference_id, email)
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

alter table conferences    enable row level security;
alter table agenda         enable row level security;
alter table speakers       enable row level security;
alter table registrations  enable row level security;

-- Anyone can read published conferences
create policy "Public read published conferences"
  on conferences for select
  using (status = 'published');

-- Anyone can read agenda/speakers of published conferences
create policy "Public read agenda"
  on agenda for select
  using (
    exists (select 1 from conferences c where c.id = agenda.conference_id and c.status = 'published')
  );

create policy "Public read speakers"
  on speakers for select
  using (
    exists (select 1 from conferences c where c.id = speakers.conference_id and c.status = 'published')
  );

-- Anyone can insert registrations
create policy "Public insert registrations"
  on registrations for insert
  with check (true);

-- Allow full access for POC (remove in production!)
create policy "Anon full access conferences"
  on conferences for all using (true) with check (true);

create policy "Anon full access agenda"
  on agenda for all using (true) with check (true);

create policy "Anon full access speakers"
  on speakers for all using (true) with check (true);

create policy "Anon full access registrations"
  on registrations for all using (true) with check (true);


-- ============================================================
-- Sample seed data
-- ============================================================

insert into conferences (title, short_description, description, banner_url, location, start_date, end_date, status)
values (
  'AI Summit 2025',
  'The world''s largest gathering of AI researchers and practitioners.',
  'Join thousands of AI professionals, researchers, and enthusiasts for three days of cutting-edge talks, workshops, and networking. Covering topics from LLMs and computer vision to AI ethics and deployment at scale.',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format',
  'San Francisco, CA',
  '2025-09-15',
  '2025-09-17',
  'published'
);
