-- ==============================================================================
-- MED NOTE - DATOS BASE Y USUARIOS INICIALES CON AISLAMIENTO TOTAL
-- ==============================================================================

create extension if not exists pgcrypto;

do $$
declare
  royer_id uuid;
  eraso_id uuid;
begin
  -- ----------------------------------------------------------------------------
  -- 1. USUARIO PRINCIPAL: sarmientoroyer27@gmail.com (psw: 726513)
  -- ----------------------------------------------------------------------------
  select id into royer_id from auth.users where email = 'sarmientoroyer27@gmail.com';

  if royer_id is null then
    royer_id := gen_random_uuid();
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change_token_current,
      email_change,
      reauthentication_token
    ) values (
      royer_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'sarmientoroyer27@gmail.com',
      crypt('726513', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Dr. Royer Sarmiento","specialty":"Medicina Interna & Cardiología","role":"admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      '',
      '',
      ''
    );
  else
    update auth.users
    set
      encrypted_password = crypt('726513', gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_user_meta_data = '{"name":"Dr. Royer Sarmiento","specialty":"Medicina Interna & Cardiología","role":"admin"}'::jsonb,
      confirmation_token = coalesce(confirmation_token, ''),
      recovery_token = coalesce(recovery_token, ''),
      email_change_token_new = coalesce(email_change_token_new, ''),
      email_change_token_current = coalesce(email_change_token_current, ''),
      email_change = coalesce(email_change, ''),
      reauthentication_token = coalesce(reauthentication_token, ''),
      updated_at = now()
    where id = royer_id;
  end if;

  -- Crear/actualizar identidad en auth.identities requerida por GoTrue (Supabase Auth)
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    royer_id,
    royer_id,
    format('{"sub":"%s","email":"%s"}', royer_id::text, 'sarmientoroyer27@gmail.com')::jsonb,
    'email',
    royer_id::text,
    now(),
    now(),
    now()
  )
  on conflict (provider, provider_id) do update set
    identity_data = excluded.identity_data,
    updated_at = now();

  -- Perfil en public.profiles (admin)
  insert into public.profiles (id, email, name, role, avatar_url, specialty, is_active)
  values (
    royer_id,
    'sarmientoroyer27@gmail.com',
    'Dr. Royer Sarmiento',
    'admin',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    'Medicina Interna & Cardiología',
    true
  )
  on conflict (id) do update set
    name = excluded.name,
    role = 'admin',
    specialty = excluded.specialty,
    is_active = true,
    updated_at = now();

  -- ----------------------------------------------------------------------------
  -- 2. CATEGORÍAS ASOCIADAS A DR. ROYER (user_id = royer_id)
  -- ----------------------------------------------------------------------------
  insert into public.categories (id, user_id, name, description, color, icon, created_at)
  values
    ('cat-cardio-royer', royer_id, 'Cardiología', 'Enfermedades cardiovasculares, hipertensión y manejo hemodinámico.', '#0284c7', 'fa-heart-pulse', now()),
    ('cat-gastro-royer', royer_id, 'Gastroenterología', 'Trastornos del tracto digestivo, reflujo, mucosa gástrica y hepatobiliares.', '#0d9488', 'fa-capsules', now()),
    ('cat-respi-royer', royer_id, 'Medicina General & Respiratorio', 'Infecciones agudas, patologías respiratorias comunes y atención primaria.', '#6366f1', 'fa-stethoscope', now())
  on conflict (id) do update set
    user_id = excluded.user_id,
    name = excluded.name;

  -- ----------------------------------------------------------------------------
  -- 3. PATOLOGÍAS ASOCIADAS A DR. ROYER
  -- ----------------------------------------------------------------------------
  insert into public.diseases (id, user_id, category_id, name, code, description, severity, created_at)
  values
    ('dis-hta-royer', royer_id, 'cat-cardio-royer', 'Hipertensión Arterial Primaria (Grado 1-2)', 'I10', 'Elevación sostenida de la presión arterial (PAS ≥ 140 mmHg o PAD ≥ 90 mmHg) sin etiología secundaria identificable.', 'moderate', now()),
    ('dis-ic-royer', royer_id, 'cat-cardio-royer', 'Insuficiencia Cardíaca con FEVI reducida (IC-FEr)', 'I50.2', 'Síndrome caracterizado por disnea, fatiga y fracción de eyección ventricular < 40%.', 'severe', now()),
    ('dis-gastritis-royer', royer_id, 'cat-gastro-royer', 'Gastritis Aguda Erosiva / Dispepsia', 'K29.0', 'Inflamación aguda de la mucosa gástrica con dolor epigástrico, pirosis y náuseas.', 'mild', now()),
    ('dis-erge-royer', royer_id, 'cat-gastro-royer', 'Enfermedad por Reflujo Gastroesofágico (ERGE)', 'K21.9', 'Paso retrógrado de contenido gástrico hacia el esófago con pirosis retroesternal.', 'moderate', now()),
    ('dis-faringitis-royer', royer_id, 'cat-respi-royer', 'Faringoamigdalitis Aguda Bacteriana', 'J03.0', 'Infección faríngea habitualmente por Streptococcus pyogenes (Streptococcus grupo A).', 'moderate', now())
  on conflict (id) do update set
    user_id = excluded.user_id,
    name = excluded.name;

  -- ----------------------------------------------------------------------------
  -- 4. TRATAMIENTOS ASOCIADOS A DR. ROYER
  -- ----------------------------------------------------------------------------
  insert into public.treatments (id, user_id, disease_id, name, regimen, duration, clinical_notes, created_at, updated_at)
  values
    ('treat-hta-royer', royer_id, 'dis-hta-royer', 'Esquema Inicial Dual (ARA II + Calcioantagonista)',
     '1. Losartán 50 mg: Tomar 1 tableta VO cada 24 horas por la mañana.
2. Amlodipino 5 mg: Tomar 1 tableta VO cada 24 horas después del almuerzo.
3. Monitoreo diario de TA (mañana y noche) anotado en bitácora por 14 días.',
     'Indefinida / Revisión en 30 días',
     'Ideal para pacientes con PAS > 20 mmHg sobre objetivo. Verificar función renal y electrolitos a las 4 semanas.',
     now(), now()),

    ('treat-ic-royer', royer_id, 'dis-ic-royer', 'Terapia Cuádruple Estándar (Los 4 Pilares)',
     '1. Sacubitrilo/Valsartán 24/26 mg: 1 comprimido cada 12 horas.
2. Empagliflozina 10 mg: 1 comprimido cada 24 horas en ayunas.
3. Bisoprolol 2.5 mg: 1 comprimido cada 24 horas por la mañana.
4. Espironolactona 25 mg: 1 comprimido cada 24 horas.',
     'Continuo con titulación progresiva mensual',
     'Control de potasio sérico y creatinina cada 2 a 4 semanas tras titulación de dosis.',
     now(), now()),

    ('treat-gastritis-royer', royer_id, 'dis-gastritis-royer', 'Inhibición Ácida Intensiva + Citoprotección',
     '1. Esomeprazol 40 mg: Tomar 1 cápsula VO en ayunas, 30 minutos antes del desayuno.
2. Sucralfato suspensión (1g/5ml): Tomar 10 ml 1 hora antes de comidas y al acostarse.
3. Magaldrato + Simeticona: 1 cucharada de 10 ml 1 hora postprandial ante dolor o ardor.',
     '14 a 28 días',
     'Evitar consumo concomitante de AINEs. Si persiste >4 semanas solicitar endoscopia digestiva alta.',
     now(), now()),

    ('treat-faringitis-royer', royer_id, 'dis-faringitis-royer', 'Esquema Antimicrobiano Primera Línea + Manejo Sintomático',
     '1. Amoxicilina 875 mg + Ácido Clavulánico 125 mg: Tomar 1 tableta cada 12 horas con comidas por 7 días completos.
2. Ibuprofeno 400 mg: Tomar 1 tableta cada 8 horas por 3 días si hay odinofagia o fiebre > 38°C.
3. Bencidamina spray: 3 aplicaciones orofaríngeas cada 6 horas según molestia.',
     '7 días exactos',
     'Completar los 7 días de antibiótico obligatoriamente para prevenir complicaciones supurativas y fiebre reumática.',
     now(), now())
  on conflict (id) do update set
    user_id = excluded.user_id,
    name = excluded.name;

  -- ----------------------------------------------------------------------------
  -- 5. RECOMENDACIONES ASOCIADAS A DR. ROYER
  -- ----------------------------------------------------------------------------
  insert into public.recommendations (id, user_id, treatment_id, type, title, description, "order", created_at)
  values
    ('rec-hta-royer-1', royer_id, 'treat-hta-royer', 'diet', 'Restricción Estricta de Sodio (Sal)', 'Consumir menos de 2 gramos de sodio al día (1 cucharadita rasa de sal). Evitar embutidos, enlatados y comidas procesadas.', 1, now()),
    ('rec-hta-royer-2', royer_id, 'treat-hta-royer', 'general', 'Actividad Física Aeróbica Regular', 'Realizar al menos 150 minutos semanales de ejercicio aeróbico de intensidad moderada (caminata rápida o natación).', 2, now()),
    ('rec-hta-royer-3', royer_id, 'treat-hta-royer', 'alarm_sign', 'Crisis Hipertensiva / Signos de Alarma', 'Acudir de inmediato a Urgencias si la presión supera 180/110 mmHg, o si presenta cefalea en estallido, visión borrosa o dolor torácico.', 3, now()),
    ('rec-gas-royer-1', royer_id, 'treat-gastritis-royer', 'diet', 'Dieta Gástrica Fraccionada', 'Comer porciones moderadas cada 3 a 4 horas. Evitar comidas copiosas, condimentos fuertes, fritos, picantes, café y alcohol.', 1, now()),
    ('rec-gas-royer-2', royer_id, 'treat-gastritis-royer', 'alarm_sign', 'Sangrado Gastrointestinal', 'Acudir a emergencias ante vómitos con sangre, posos de café o heces negras fétidas (melenas).', 2, now()),
    ('rec-far-royer-1', royer_id, 'treat-faringitis-royer', 'indication', 'Cumplimiento Estricto del Esquema', 'No suspender la medicación aunque los síntomas mejoren a las 48 horas. Tomar con alimentos para minimizar malestar estomacal.', 1, now())
  on conflict (id) do update set
    user_id = excluded.user_id,
    title = excluded.title;

  -- ----------------------------------------------------------------------------
  -- 6. NOTAS CLÍNICAS ASOCIADAS A DR. ROYER
  -- ----------------------------------------------------------------------------
  insert into public.clinical_notes (id, user_id, treatment_id, disease_id, patient_reference, title, content, note_type, is_pinned, created_at, updated_at)
  values
    ('note-hta-royer', royer_id, 'treat-hta-royer', 'dis-hta-royer', 'Población General Adulta', 'Control de Electrolitos y Función Renal', 'Revisar niveles de potasio plasmático y creatinina a las 3-4 semanas de iniciado el tratamiento con ARA II. Ajustar dosis si creatinina se eleva >30%.', 'dosage', true, now(), now()),
    ('note-ic-royer', royer_id, 'treat-ic-royer', 'dis-ic-royer', 'Adultos con IC-FEr', 'Regla de Titulación y Monitoreo de Hipotensión', 'Iniciar sacubitrilo/valsartán tras mínimo 36 horas de lavado de IECA previo. Monitorear hipotensión ortostática en las primeras 48 horas.', 'clinical', true, now(), now()),
    ('note-gas-royer', royer_id, 'treat-gastritis-royer', 'dis-gastritis-royer', 'Casos Recurrentes', 'Protocolo ante Sospecha de H. Pylori', 'Si los síntomas persisten tras 14 días de antisecretor, indicar prueba de antígeno en heces para H. pylori antes de prolongar el tratamiento.', 'observation', false, now(), now())
  on conflict (id) do update set
    user_id = excluded.user_id,
    title = excluded.title;

  -- ----------------------------------------------------------------------------
  -- 7. SEGUNDO USUARIO MÉDICO: eraso.luis@mednote.com (psw: secret)
  -- Para verificar que el aislamiento funciona al 100%
  -- ----------------------------------------------------------------------------
  select id into eraso_id from auth.users where email = 'eraso.luis@mednote.com';

  if eraso_id is null then
    eraso_id := gen_random_uuid();
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new,
      email_change_token_current, email_change, reauthentication_token
    ) values (
      eraso_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'eraso.luis@mednote.com', crypt('secret', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Dr. Luis Eraso","specialty":"Pediatría & Medicina General","role":"doctor"}'::jsonb,
      now(), now(),
      '', '', '', '', '', ''
    );
  else
    update auth.users
    set encrypted_password = crypt('secret', gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmation_token = coalesce(confirmation_token, ''),
        recovery_token = coalesce(recovery_token, ''),
        email_change_token_new = coalesce(email_change_token_new, ''),
        email_change_token_current = coalesce(email_change_token_current, ''),
        email_change = coalesce(email_change, ''),
        reauthentication_token = coalesce(reauthentication_token, ''),
        updated_at = now()
    where id = eraso_id;
  end if;

  -- Identidad requerida por GoTrue (Supabase Auth)
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    eraso_id,
    eraso_id,
    format('{"sub":"%s","email":"%s"}', eraso_id::text, 'eraso.luis@mednote.com')::jsonb,
    'email',
    eraso_id::text,
    now(),
    now(),
    now()
  )
  on conflict (provider, provider_id) do update set
    identity_data = excluded.identity_data,
    updated_at = now();

  insert into public.profiles (id, email, name, role, avatar_url, specialty, is_active)
  values (
    eraso_id,
    'eraso.luis@mednote.com',
    'Dr. Luis Eraso',
    'doctor',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    'Pediatría & Medicina General',
    true
  )
  on conflict (id) do update set
    name = excluded.name,
    specialty = excluded.specialty,
    updated_at = now();

  -- Categoría propia y aislada para Dr. Luis Eraso (user_id = eraso_id)
  insert into public.categories (id, user_id, name, description, color, icon, created_at)
  values
    ('cat-pediatria-eraso', eraso_id, 'Pediatría y Desarrollo Infantil', 'Patologías comunes en edad pediátrica y control de niño sano.', '#f59e0b', 'fa-baby', now())
  on conflict (id) do update set
    user_id = excluded.user_id,
    name = excluded.name;

  insert into public.diseases (id, user_id, category_id, name, code, description, severity, created_at)
  values
    ('dis-bronquiolitis-eraso', eraso_id, 'cat-pediatria-eraso', 'Bronquiolitis Aguda Lactante', 'J21.9', 'Infección viral del tracto respiratorio inferior en menores de 2 años (habitual por VRS).', 'moderate', now())
  on conflict (id) do update set
    user_id = excluded.user_id,
    name = excluded.name;

  insert into public.treatments (id, user_id, disease_id, name, regimen, duration, clinical_notes, created_at, updated_at)
  values
    ('treat-bronquiolitis-eraso', eraso_id, 'dis-bronquiolitis-eraso', 'Soporte Hidroelectrolítico y Lavados Nasales',
     '1. Lavados nasales con Solución Salina Fisiológica al 0.9%: 2 a 3 ml en cada fosa nasal antes de tomas de leche y antes de dormir.
2. Fraccionar tomas de lactancia materna o fórmula para evitar fatiga.
3. Posición semiincorporada (30°) en la cuna.',
     '5 a 7 días',
     'No se recomienda uso rutinario de broncodilatadores ni corticoides sistémicos salvo antecedentes atópicos.',
     now(), now())
  on conflict (id) do update set
    user_id = excluded.user_id,
    name = excluded.name;

  insert into public.recommendations (id, user_id, treatment_id, type, title, description, "order", created_at)
  values
    ('rec-bronq-eraso-1', eraso_id, 'treat-bronquiolitis-eraso', 'alarm_sign', 'Signos de Dificultad Respiratoria', 'Acudir inmediatamente a urgencias si presenta tiraje intercostal (se hunden las costillas), aleteo nasal o coloración azulada peribucal (cianosis).', 1, now())
  on conflict (id) do update set
    user_id = excluded.user_id,
    title = excluded.title;

end $$;
