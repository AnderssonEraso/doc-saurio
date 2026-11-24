-- ==============================================================================
-- NOVAMED INITIAL SCHEMA MIGRATION
-- ==============================================================================

-- 1. Profiles (linked with Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null default 'doctor' check (role in ('admin', 'doctor')),
  avatar_url text,
  specialty text default 'Medicina General',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Trigger to automatically create profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, avatar_url, specialty)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'doctor'),
    coalesce(new.raw_user_meta_data->>'avatarUrl', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || encode(new.email::bytea, 'escape')),
    coalesce(new.raw_user_meta_data->>'specialty', 'Medicina General')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Categories
create table if not exists public.categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  description text not null default '',
  color text not null default '#0284c7',
  icon text not null default 'fa-stethoscope',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Diseases
create table if not exists public.diseases (
  id text primary key default gen_random_uuid()::text,
  category_id text references public.categories(id) on delete set null,
  name text not null,
  code text not null default '',
  description text not null default '',
  severity text not null default 'moderate' check (severity in ('mild', 'moderate', 'severe')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Treatments
create table if not exists public.treatments (
  id text primary key default gen_random_uuid()::text,
  disease_id text references public.diseases(id) on delete cascade,
  name text not null,
  regimen text not null default '',
  duration text not null default '',
  clinical_notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. Recommendations
create table if not exists public.recommendations (
  id text primary key default gen_random_uuid()::text,
  treatment_id text references public.treatments(id) on delete cascade,
  type text not null check (type in ('general', 'diet', 'alarm_sign', 'indication')),
  title text not null,
  description text not null default '',
  "order" integer not null default 1,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.diseases enable row level security;
alter table public.treatments enable row level security;
alter table public.recommendations enable row level security;

-- Profiles: Anyone authenticated can read profiles, users can update their own
create policy "Allow authenticated read profiles" on public.profiles
  for select to authenticated using (true);

create policy "Allow users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Categories: Public read, authenticated manage
create policy "Allow public read categories" on public.categories
  for select using (true);

create policy "Allow authenticated manage categories" on public.categories
  for all to authenticated using (true);

-- Diseases: Public read, authenticated manage
create policy "Allow public read diseases" on public.diseases
  for select using (true);

create policy "Allow authenticated manage diseases" on public.diseases
  for all to authenticated using (true);

-- Treatments: Public read, authenticated manage
create policy "Allow public read treatments" on public.treatments
  for select using (true);

create policy "Allow authenticated manage treatments" on public.treatments
  for all to authenticated using (true);

-- Recommendations: Public read, authenticated manage
create policy "Allow public read recommendations" on public.recommendations
  for select using (true);

create policy "Allow authenticated manage recommendations" on public.recommendations
  for all to authenticated using (true);
