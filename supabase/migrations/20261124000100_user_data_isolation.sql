-- ==============================================================================
-- MED NOTE MIGRATION: AISLAMIENTO ESTRICTO DE DATOS POR USUARIO (MULTI-TENANCY)
-- Fecha: 2026-11-24
-- ==============================================================================

-- 1. AÑADIR user_id A TODAS LAS TABLAS CLÍNICAS
-- ------------------------------------------------------------------------------

-- Categories
alter table public.categories
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- Diseases
alter table public.diseases
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- Treatments
alter table public.treatments
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- Recommendations
alter table public.recommendations
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- Clinical Notes
alter table public.clinical_notes
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 2. POLÍTICAS RLS ESTRICTAS: CADA USUARIO SOLO PUEDE VER Y MODIFICAR SUS DATOS
-- ------------------------------------------------------------------------------

-- Categories
drop policy if exists "Allow public read categories" on public.categories;
drop policy if exists "Allow authenticated manage categories" on public.categories;
drop policy if exists "Allow authenticated update categories" on public.categories;
drop policy if exists "Allow admin delete categories" on public.categories;
drop policy if exists "Categories read policy" on public.categories;
drop policy if exists "Categories insert policy" on public.categories;
drop policy if exists "Categories update policy" on public.categories;
drop policy if exists "Categories delete policy" on public.categories;
drop policy if exists "Categories user isolation select" on public.categories;
drop policy if exists "Categories user isolation insert" on public.categories;
drop policy if exists "Categories user isolation update" on public.categories;
drop policy if exists "Categories user isolation delete" on public.categories;

create policy "Categories user isolation select" on public.categories
  for select to authenticated using (auth.uid() = user_id);

create policy "Categories user isolation insert" on public.categories
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Categories user isolation update" on public.categories
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Categories user isolation delete" on public.categories
  for delete to authenticated using (auth.uid() = user_id);

-- Diseases
drop policy if exists "Allow public read diseases" on public.diseases;
drop policy if exists "Allow authenticated manage diseases" on public.diseases;
drop policy if exists "Allow authenticated update diseases" on public.diseases;
drop policy if exists "Allow admin delete diseases" on public.diseases;
drop policy if exists "Diseases read policy" on public.diseases;
drop policy if exists "Diseases insert policy" on public.diseases;
drop policy if exists "Diseases update policy" on public.diseases;
drop policy if exists "Diseases delete policy" on public.diseases;
drop policy if exists "Diseases user isolation select" on public.diseases;
drop policy if exists "Diseases user isolation insert" on public.diseases;
drop policy if exists "Diseases user isolation update" on public.diseases;
drop policy if exists "Diseases user isolation delete" on public.diseases;

create policy "Diseases user isolation select" on public.diseases
  for select to authenticated using (auth.uid() = user_id);

create policy "Diseases user isolation insert" on public.diseases
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Diseases user isolation update" on public.diseases
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Diseases user isolation delete" on public.diseases
  for delete to authenticated using (auth.uid() = user_id);

-- Treatments
drop policy if exists "Allow public read treatments" on public.treatments;
drop policy if exists "Allow authenticated manage treatments" on public.treatments;
drop policy if exists "Treatments read policy" on public.treatments;
drop policy if exists "Treatments manage policy" on public.treatments;
drop policy if exists "Treatments user isolation select" on public.treatments;
drop policy if exists "Treatments user isolation insert" on public.treatments;
drop policy if exists "Treatments user isolation update" on public.treatments;
drop policy if exists "Treatments user isolation delete" on public.treatments;

create policy "Treatments user isolation select" on public.treatments
  for select to authenticated using (auth.uid() = user_id);

create policy "Treatments user isolation insert" on public.treatments
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Treatments user isolation update" on public.treatments
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Treatments user isolation delete" on public.treatments
  for delete to authenticated using (auth.uid() = user_id);

-- Recommendations
drop policy if exists "Allow public read recommendations" on public.recommendations;
drop policy if exists "Allow authenticated manage recommendations" on public.recommendations;
drop policy if exists "Recommendations read policy" on public.recommendations;
drop policy if exists "Recommendations manage policy" on public.recommendations;
drop policy if exists "Recommendations user isolation select" on public.recommendations;
drop policy if exists "Recommendations user isolation insert" on public.recommendations;
drop policy if exists "Recommendations user isolation update" on public.recommendations;
drop policy if exists "Recommendations user isolation delete" on public.recommendations;

create policy "Recommendations user isolation select" on public.recommendations
  for select to authenticated using (auth.uid() = user_id);

create policy "Recommendations user isolation insert" on public.recommendations
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Recommendations user isolation update" on public.recommendations
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Recommendations user isolation delete" on public.recommendations
  for delete to authenticated using (auth.uid() = user_id);

-- Clinical Notes
drop policy if exists "Allow read clinical_notes" on public.clinical_notes;
drop policy if exists "Allow insert clinical_notes" on public.clinical_notes;
drop policy if exists "Allow update clinical_notes" on public.clinical_notes;
drop policy if exists "Allow delete clinical_notes" on public.clinical_notes;
drop policy if exists "Notes read policy" on public.clinical_notes;
drop policy if exists "Notes insert policy" on public.clinical_notes;
drop policy if exists "Notes update policy" on public.clinical_notes;
drop policy if exists "Notes delete policy" on public.clinical_notes;
drop policy if exists "Notes user isolation select" on public.clinical_notes;
drop policy if exists "Notes user isolation insert" on public.clinical_notes;
drop policy if exists "Notes user isolation update" on public.clinical_notes;
drop policy if exists "Notes user isolation delete" on public.clinical_notes;

create policy "Notes user isolation select" on public.clinical_notes
  for select to authenticated using (auth.uid() = user_id);

create policy "Notes user isolation insert" on public.clinical_notes
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Notes user isolation update" on public.clinical_notes
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Notes user isolation delete" on public.clinical_notes
  for delete to authenticated using (auth.uid() = user_id);

-- 3. ÍNDICES DE RENDIMIENTO PARA user_id
-- ------------------------------------------------------------------------------
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_diseases_user_id on public.diseases(user_id);
create index if not exists idx_treatments_user_id on public.treatments(user_id);
create index if not exists idx_recommendations_user_id on public.recommendations(user_id);
create index if not exists idx_clinical_notes_user_id on public.clinical_notes(user_id);
