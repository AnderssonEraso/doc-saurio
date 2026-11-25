-- ==============================================================================
-- MED NOTE - ESQUEMA COMPLETO CONSOLIDADO CON AISLAMIENTO DE USUARIOS
-- Cada nota, tratamiento, patología y recomendación pertenece estrictamente
-- al perfil del usuario autenticado (user_id / auth.uid()), impidiendo acceso mutuo.
-- ==============================================================================

-- Habilitar extensión pgcrypto para cifrado seguro de contraseñas y hashes
create extension if not exists pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. TABLA DE PERFILES DE USUARIO (PROFILES)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null default 'doctor' check (role in ('admin', 'doctor')),
  avatar_url text,
  specialty text default 'Medicina General',
  phone text,
  is_active boolean not null default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Función de ayuda de seguridad para comprobar si es administrador (evita recursión RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid() and is_active = true),
    false
  );
$$;

-- Trigger para impedir auto-escalación no autorizada de roles
create or replace function public.prevent_unauthorized_role_escalation()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.role is distinct from new.role then
    if not public.is_admin() and current_user not in ('service_role', 'postgres', 'supabase_admin') then
      raise exception 'Permiso denegado: Solo un administrador puede modificar el rol de un usuario.';
    end if;
  end if;
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_unauthorized_role_escalation();

-- Trigger para crear perfil automáticamente al registrarse en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  assigned_role text;
  total_users integer;
begin
  select count(*) into total_users from public.profiles;
  if total_users = 0 then
    assigned_role := 'admin';
  else
    assigned_role := coalesce(new.raw_user_meta_data->>'role', 'doctor');
  end if;

  insert into public.profiles (id, email, name, role, avatar_url, specialty, phone, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    assigned_role,
    coalesce(new.raw_user_meta_data->>'avatarUrl', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || encode(new.email::bytea, 'escape')),
    coalesce(new.raw_user_meta_data->>'specialty', 'Medicina General'),
    coalesce(new.raw_user_meta_data->>'phone', null),
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(public.profiles.name, excluded.name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    specialty = coalesce(public.profiles.specialty, excluded.specialty),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Vista administrativa
create or replace view public.admin_users_view as
select
  p.id,
  p.name,
  p.email,
  p.role,
  p.specialty,
  p.avatar_url,
  p.phone,
  p.is_active,
  p.created_at,
  p.updated_at
from public.profiles p;

-- ------------------------------------------------------------------------------
-- 2. TABLAS CLÍNICAS VINCULADAS ESTRICTAMENTE POR USUARIO / PERFIL (user_id)
-- ------------------------------------------------------------------------------

-- Categorías
create table if not exists public.categories (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references public.profiles(id) on delete cascade not null default auth.uid(),
  name text not null,
  description text not null default '',
  color text not null default '#0284c7',
  icon text not null default 'fa-stethoscope',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enfermedades
create table if not exists public.diseases (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references public.profiles(id) on delete cascade not null default auth.uid(),
  category_id text references public.categories(id) on delete cascade,
  name text not null,
  code text not null default '',
  description text not null default '',
  severity text not null default 'moderate' check (severity in ('mild', 'moderate', 'severe')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Tratamientos
create table if not exists public.treatments (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references public.profiles(id) on delete cascade not null default auth.uid(),
  disease_id text references public.diseases(id) on delete cascade,
  name text not null,
  regimen text not null default '',
  duration text not null default '',
  clinical_notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Recomendaciones
create table if not exists public.recommendations (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references public.profiles(id) on delete cascade not null default auth.uid(),
  treatment_id text references public.treatments(id) on delete cascade,
  type text not null check (type in ('general', 'diet', 'alarm_sign', 'indication')),
  title text not null,
  description text not null default '',
  "order" integer not null default 1,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Notas Clínicas
create table if not exists public.clinical_notes (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references public.profiles(id) on delete cascade not null default auth.uid(),
  treatment_id text references public.treatments(id) on delete cascade,
  disease_id text references public.diseases(id) on delete set null,
  patient_reference text,
  title text not null,
  content text not null,
  note_type text not null default 'clinical' check (note_type in ('clinical', 'dosage', 'interaction', 'observation', 'alarm')),
  is_pinned boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Trigger de updated_at
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_update_clinical_notes_updated_at on public.clinical_notes;
create trigger trg_update_clinical_notes_updated_at
  before update on public.clinical_notes
  for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists trg_update_treatments_updated_at on public.treatments;
create trigger trg_update_treatments_updated_at
  before update on public.treatments
  for each row execute procedure public.set_current_timestamp_updated_at();

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) - PRIVACIDAD TOTAL ENTRE USUARIOS
-- ------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.diseases enable row level security;
alter table public.treatments enable row level security;
alter table public.recommendations enable row level security;
alter table public.clinical_notes enable row level security;

-- Profiles: cada usuario puede ver su perfil; los admins pueden ver todos
drop policy if exists "Profiles read policy" on public.profiles;
drop policy if exists "Profiles update policy" on public.profiles;
drop policy if exists "Profiles delete policy" on public.profiles;

create policy "Profiles read policy" on public.profiles
  for select to authenticated
  using (public.is_admin() or auth.uid() = id);

create policy "Profiles update policy" on public.profiles
  for update to authenticated
  using (public.is_admin() or auth.uid() = id)
  with check (public.is_admin() or auth.uid() = id);

create policy "Profiles delete policy" on public.profiles
  for delete to authenticated
  using (public.is_admin() and auth.uid() <> id);

-- Categories
drop policy if exists "Categories isolation select" on public.categories;
drop policy if exists "Categories isolation insert" on public.categories;
drop policy if exists "Categories isolation update" on public.categories;
drop policy if exists "Categories isolation delete" on public.categories;

create policy "Categories isolation select" on public.categories for select to authenticated using (auth.uid() = user_id);
create policy "Categories isolation insert" on public.categories for insert to authenticated with check (auth.uid() = user_id);
create policy "Categories isolation update" on public.categories for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Categories isolation delete" on public.categories for delete to authenticated using (auth.uid() = user_id);

-- Diseases
drop policy if exists "Diseases isolation select" on public.diseases;
drop policy if exists "Diseases isolation insert" on public.diseases;
drop policy if exists "Diseases isolation update" on public.diseases;
drop policy if exists "Diseases isolation delete" on public.diseases;

create policy "Diseases isolation select" on public.diseases for select to authenticated using (auth.uid() = user_id);
create policy "Diseases isolation insert" on public.diseases for insert to authenticated with check (auth.uid() = user_id);
create policy "Diseases isolation update" on public.diseases for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Diseases isolation delete" on public.diseases for delete to authenticated using (auth.uid() = user_id);

-- Treatments
drop policy if exists "Treatments isolation select" on public.treatments;
drop policy if exists "Treatments isolation insert" on public.treatments;
drop policy if exists "Treatments isolation update" on public.treatments;
drop policy if exists "Treatments isolation delete" on public.treatments;

create policy "Treatments isolation select" on public.treatments for select to authenticated using (auth.uid() = user_id);
create policy "Treatments isolation insert" on public.treatments for insert to authenticated with check (auth.uid() = user_id);
create policy "Treatments isolation update" on public.treatments for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Treatments isolation delete" on public.treatments for delete to authenticated using (auth.uid() = user_id);

-- Recommendations
drop policy if exists "Recommendations isolation select" on public.recommendations;
drop policy if exists "Recommendations isolation insert" on public.recommendations;
drop policy if exists "Recommendations isolation update" on public.recommendations;
drop policy if exists "Recommendations isolation delete" on public.recommendations;

create policy "Recommendations isolation select" on public.recommendations for select to authenticated using (auth.uid() = user_id);
create policy "Recommendations isolation insert" on public.recommendations for insert to authenticated with check (auth.uid() = user_id);
create policy "Recommendations isolation update" on public.recommendations for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Recommendations isolation delete" on public.recommendations for delete to authenticated using (auth.uid() = user_id);

-- Clinical Notes
drop policy if exists "Notes isolation select" on public.clinical_notes;
drop policy if exists "Notes isolation insert" on public.clinical_notes;
drop policy if exists "Notes isolation update" on public.clinical_notes;
drop policy if exists "Notes isolation delete" on public.clinical_notes;

create policy "Notes isolation select" on public.clinical_notes for select to authenticated using (auth.uid() = user_id);
create policy "Notes isolation insert" on public.clinical_notes for insert to authenticated with check (auth.uid() = user_id);
create policy "Notes isolation update" on public.clinical_notes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Notes isolation delete" on public.clinical_notes for delete to authenticated using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. ÍNDICES DE RENDIMIENTO
-- ------------------------------------------------------------------------------
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_diseases_user_id on public.diseases(user_id);
create index if not exists idx_treatments_user_id on public.treatments(user_id);
create index if not exists idx_recommendations_user_id on public.recommendations(user_id);
create index if not exists idx_clinical_notes_user_id on public.clinical_notes(user_id);
