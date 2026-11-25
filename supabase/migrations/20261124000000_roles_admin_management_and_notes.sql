-- ==============================================================================
-- NOVAMED MIGRATION: ROLES, GESTIÓN DE ADMINISTRADOR Y NOTAS CLÍNICAS
-- Fecha: 2026-11-24
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ACTUALIZACIÓN DE LA TABLA PROFILES Y CONTROL DE ROLES
-- ------------------------------------------------------------------------------

-- Añadir columnas complementarias a public.profiles si no existen
alter table public.profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists phone text;

-- Asegurar restricción de valores válidos de rol
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'doctor'));

-- Función de ayuda de seguridad para comprobar si el usuario actual es administrador
-- Usamos SECURITY DEFINER para evitar recursión infinita en las políticas RLS
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

-- Función para obtener el rol del usuario autenticado
create or replace function public.get_current_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'doctor'
  );
$$;

-- Trigger para impedir que usuarios regulares se auto-asciendan a administradores
create or replace function public.prevent_unauthorized_role_escalation()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Si el rol está cambiando
  if old.role is distinct from new.role then
    -- Si quien ejecuta no es administrador ni el service_role de supabase
    if not public.is_admin() and current_user not in ('service_role', 'postgres', 'supabase_admin') then
      raise exception 'Permiso denegado: Solo un administrador puede modificar el rol de un usuario.';
    end if;
  end if;

  -- Actualizar timestamp
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row
  execute procedure public.prevent_unauthorized_role_escalation();

-- Trigger actualizado para inserción de nuevos usuarios de Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  assigned_role text;
  total_users integer;
begin
  -- Contar si es el primer usuario del sistema para convertirlo en admin automáticamente
  select count(*) into total_users from public.profiles;

  if total_users = 0 then
    assigned_role := 'admin';
  else
    assigned_role := coalesce(new.raw_user_meta_data->>'role', 'doctor');
  end if;

  insert into public.profiles (
    id,
    email,
    name,
    role,
    avatar_url,
    specialty,
    phone,
    is_active
  )
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

-- ------------------------------------------------------------------------------
-- 2. VISTA Y FUNCIONES RPC PARA QUE EL ADMIN VEA Y GESTIONE USUARIOS
-- ------------------------------------------------------------------------------

-- Vista completa de administración de usuarios (solo accesible por administradores)
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

-- RPC: Obtener lista completa de usuarios con control de permisos
create or replace function public.admin_get_users()
returns setof public.admin_users_view
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acceso denegado: se requieren privilegios de Administrador.';
  end if;

  return query
  select * from public.admin_users_view
  order by created_at desc;
end;
$$;

-- RPC: Cambiar rol de un usuario (Admin Only)
create or replace function public.admin_set_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acceso denegado: se requieren privilegios de Administrador.';
  end if;

  if new_role not in ('admin', 'doctor') then
    raise exception 'Rol inválido. Los roles permitidos son "admin" o "doctor".';
  end if;

  update public.profiles
  set
    role = new_role,
    updated_at = timezone('utc'::text, now())
  where id = target_user_id;

  if not found then
    raise exception 'Usuario no encontrado con ID %', target_user_id;
  end if;
end;
$$;

-- RPC: Activar o desactivar usuario (Admin Only)
create or replace function public.admin_toggle_user_status(target_user_id uuid, new_status boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acceso denegado: se requieren privilegios de Administrador.';
  end if;

  if auth.uid() = target_user_id and new_status = false then
    raise exception 'Operación no permitida: no puedes desactivar tu propio usuario en sesión.';
  end if;

  update public.profiles
  set
    is_active = new_status,
    updated_at = timezone('utc'::text, now())
  where id = target_user_id;
end;
$$;

-- RPC: Eliminar un usuario del sistema (Admin Only)
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acceso denegado: se requieren privilegios de Administrador.';
  end if;

  if auth.uid() = target_user_id then
    raise exception 'Operación no permitida: no puedes eliminar tu propio usuario de administración.';
  end if;

  delete from public.profiles where id = target_user_id;
end;
$$;

-- ------------------------------------------------------------------------------
-- 3. TABLA FALTANTE: NOTAS CLÍNICAS (clinical_notes)
-- ------------------------------------------------------------------------------

create table if not exists public.clinical_notes (
  id text primary key default gen_random_uuid()::text,
  treatment_id text references public.treatments(id) on delete cascade,
  disease_id text references public.diseases(id) on delete set null,
  doctor_id uuid references public.profiles(id) on delete set null,
  patient_reference text,
  title text not null,
  content text not null,
  note_type text not null default 'clinical' check (note_type in ('clinical', 'dosage', 'interaction', 'observation', 'alarm')),
  is_pinned boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Triggers de actualización automática de timestamps
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
-- 4. POLÍTICAS DE ROW LEVEL SECURITY (RLS) ACTUALIZADAS Y ROBUSTAS
-- ------------------------------------------------------------------------------

-- RLS en profiles
alter table public.profiles enable row level security;

drop policy if exists "Allow authenticated read profiles" on public.profiles;
drop policy if exists "Allow users update own profile" on public.profiles;
drop policy if exists "Profiles read policy" on public.profiles;
drop policy if exists "Profiles update policy" on public.profiles;
drop policy if exists "Profiles admin delete policy" on public.profiles;

-- Lectura: los administradores ven todos; los usuarios activos ven perfiles públicos de doctores
create policy "Profiles read policy" on public.profiles
  for select to authenticated
  using (public.is_admin() or is_active = true or auth.uid() = id);

-- Actualización: el admin puede actualizar cualquiera; el doctor puede actualizar sus datos personales
create policy "Profiles update policy" on public.profiles
  for update to authenticated
  using (public.is_admin() or auth.uid() = id)
  with check (public.is_admin() or auth.uid() = id);

-- Eliminación: solo administradores
create policy "Profiles admin delete policy" on public.profiles
  for delete to authenticated
  using (public.is_admin() and auth.uid() <> id);

-- RLS en clinical_notes
alter table public.clinical_notes enable row level security;

drop policy if exists "Allow read clinical_notes" on public.clinical_notes;
drop policy if exists "Allow insert clinical_notes" on public.clinical_notes;
drop policy if exists "Allow update clinical_notes" on public.clinical_notes;
drop policy if exists "Allow delete clinical_notes" on public.clinical_notes;

create policy "Allow read clinical_notes" on public.clinical_notes
  for select using (true);

create policy "Allow insert clinical_notes" on public.clinical_notes
  for insert to authenticated
  with check (true);

create policy "Allow update clinical_notes" on public.clinical_notes
  for update to authenticated
  using (public.is_admin() or auth.uid() = doctor_id);

create policy "Allow delete clinical_notes" on public.clinical_notes
  for delete to authenticated
  using (public.is_admin() or auth.uid() = doctor_id);

-- RLS en categories (lectura pública, gestión por admin y doctores, borrado exclusivo admin)
alter table public.categories enable row level security;
drop policy if exists "Allow public read categories" on public.categories;
drop policy if exists "Allow authenticated manage categories" on public.categories;
drop policy if exists "Allow admin delete categories" on public.categories;

create policy "Allow public read categories" on public.categories
  for select using (true);

create policy "Allow authenticated manage categories" on public.categories
  for insert to authenticated
  with check (true);

create policy "Allow authenticated update categories" on public.categories
  for update to authenticated
  using (true);

create policy "Allow admin delete categories" on public.categories
  for delete to authenticated
  using (public.is_admin());

-- RLS en diseases
alter table public.diseases enable row level security;
drop policy if exists "Allow public read diseases" on public.diseases;
drop policy if exists "Allow authenticated manage diseases" on public.diseases;
drop policy if exists "Allow admin delete diseases" on public.diseases;

create policy "Allow public read diseases" on public.diseases
  for select using (true);

create policy "Allow authenticated manage diseases" on public.diseases
  for insert to authenticated
  with check (true);

create policy "Allow authenticated update diseases" on public.diseases
  for update to authenticated
  using (true);

create policy "Allow admin delete diseases" on public.diseases
  for delete to authenticated
  using (public.is_admin());

-- RLS en treatments
alter table public.treatments enable row level security;
drop policy if exists "Allow public read treatments" on public.treatments;
drop policy if exists "Allow authenticated manage treatments" on public.treatments;

create policy "Allow public read treatments" on public.treatments
  for select using (true);

create policy "Allow authenticated manage treatments" on public.treatments
  for all to authenticated
  using (true);

-- RLS en recommendations
alter table public.recommendations enable row level security;
drop policy if exists "Allow public read recommendations" on public.recommendations;
drop policy if exists "Allow authenticated manage recommendations" on public.recommendations;

create policy "Allow public read recommendations" on public.recommendations
  for select using (true);

create policy "Allow authenticated manage recommendations" on public.recommendations
  for all to authenticated
  using (true);

-- ------------------------------------------------------------------------------
-- 5. ÍNDICES DE RENDIMIENTO Y OPTIMIZACIÓN
-- ------------------------------------------------------------------------------

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_is_active on public.profiles(is_active);
create index if not exists idx_diseases_category_id on public.diseases(category_id);
create index if not exists idx_treatments_disease_id on public.treatments(disease_id);
create index if not exists idx_recommendations_treatment_id on public.recommendations(treatment_id);
create index if not exists idx_recommendations_type on public.recommendations(type);
create index if not exists idx_clinical_notes_treatment_id on public.clinical_notes(treatment_id);
create index if not exists idx_clinical_notes_disease_id on public.clinical_notes(disease_id);
create index if not exists idx_clinical_notes_doctor_id on public.clinical_notes(doctor_id);
create index if not exists idx_clinical_notes_note_type on public.clinical_notes(note_type);

-- Permisos explícitos sobre la vista y funciones para roles de Supabase
grant select on public.admin_users_view to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_current_role() to authenticated;
grant execute on function public.admin_get_users() to authenticated;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
grant execute on function public.admin_toggle_user_status(uuid, boolean) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
