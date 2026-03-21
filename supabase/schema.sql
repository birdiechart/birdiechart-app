-- ============================================
-- BIRDIE CHART DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- CLUBS TABLE
-- ============================================
create table if not exists clubs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#1D6B3B',
  courses text[] default '{}',
  leaderboard_enabled boolean default true,
  signup_code text not null,
  created_at timestamptz default now()
);

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
create table if not exists users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  home_course text default '',
  club_id uuid references clubs(id) on delete set null,
  selected_tee text default 'tournament',
  eagles_count_toward_goal boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- COURSES TABLE
-- ============================================
create table if not exists courses (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text default '',
  holes integer default 18,
  is_landings boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- HOLE DETAILS TABLE
-- ============================================
create table if not exists hole_details (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  hole_number integer not null check (hole_number between 1 and 18),
  par integer not null check (par between 3 and 5),
  yardage integer default 380,
  tee_name text default null,
  unique(course_id, hole_number, tee_name)
);

-- ============================================
-- USER COURSES TABLE
-- ============================================
create table if not exists user_courses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  added_at timestamptz default now(),
  unique(user_id, course_id)
);

-- ============================================
-- HOLE SCORES TABLE
-- ============================================
create table if not exists hole_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  hole_number integer not null check (hole_number between 1 and 18),
  score_type text not null check (score_type in ('eagle', 'birdie', 'par', 'bogey')),
  scored_at timestamptz default now()
);

-- Index for fast queries
create index if not exists hole_scores_user_course on hole_scores(user_id, course_id);
create index if not exists hole_scores_user on hole_scores(user_id);

-- ============================================
-- USER CLUBS TABLE
-- ============================================
create table if not exists user_clubs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  club_id uuid references clubs(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique(user_id, club_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table users enable row level security;
alter table courses enable row level security;
alter table hole_details enable row level security;
alter table user_courses enable row level security;
alter table hole_scores enable row level security;
alter table clubs enable row level security;
alter table user_clubs enable row level security;

-- Users: can read/write own profile
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

create policy "Club members can view co-members profiles" on users
  for select using (
    exists (
      select 1 from user_clubs uc1
      join user_clubs uc2 on uc1.club_id = uc2.club_id
      where uc1.user_id = auth.uid()
      and uc2.user_id = users.id
    )
  );

-- Courses: everyone can read, authenticated can insert
create policy "Courses are publicly readable" on courses
  for select using (true);

create policy "Authenticated users can insert courses" on courses
  for insert with check (auth.role() = 'authenticated');

-- Hole details: everyone can read
create policy "Hole details are publicly readable" on hole_details
  for select using (true);

create policy "Authenticated users can insert hole details" on hole_details
  for insert with check (auth.role() = 'authenticated');

-- User courses: own records only
create policy "Users can view own courses" on user_courses
  for select using (auth.uid() = user_id);

create policy "Users can insert own courses" on user_courses
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own courses" on user_courses
  for delete using (auth.uid() = user_id);

-- Hole scores: own records only, plus club members for leaderboard
create policy "Users can view own scores" on hole_scores
  for select using (auth.uid() = user_id);

create policy "Club members can view scores of same club" on hole_scores
  for select using (
    exists (
      select 1 from user_clubs uc1
      join user_clubs uc2 on uc1.club_id = uc2.club_id
      where uc1.user_id = auth.uid()
      and uc2.user_id = hole_scores.user_id
    )
  );

create policy "Users can insert own scores" on hole_scores
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own scores" on hole_scores
  for delete using (auth.uid() = user_id);

-- Clubs: publicly readable
create policy "Clubs are publicly readable" on clubs
  for select using (true);

-- User clubs: can view own memberships; also can view co-members for leaderboard
create policy "Users can view own club memberships" on user_clubs
  for select using (auth.uid() = user_id);

create policy "Club members can see co-members" on user_clubs
  for select using (
    exists (
      select 1 from user_clubs my_clubs
      where my_clubs.user_id = auth.uid()
      and my_clubs.club_id = user_clubs.club_id
    )
  );

create policy "Users can join clubs" on user_clubs
  for insert with check (auth.uid() = user_id);

-- ============================================
-- TRIGGER: auto-create user profile on signup
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, home_course)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'home_course', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
