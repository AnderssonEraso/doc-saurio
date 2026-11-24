-- ==============================================================================
-- NOVAMED INITIAL SEED DATA
-- ==============================================================================

-- 1. Categorías iniciales
insert into public.categories (id, name, description, color, icon, created_at)
values
  ('cat-cardio', 'Cardiología', 'Enfermedades cardiovasculares, hipertensión y manejo hemodinámico.', '#0284c7', 'fa-heart-pulse', '2026-01-10T08:00:00Z'),
  ('cat-gastro', 'Gastroenterología', 'Trastornos del tracto digestivo, reflujo, mucosa gástrica y hepatobiliares.', '#0d9488', 'fa-capsules', '2026-01-12T09:30:00Z'),
  ('cat-medgen', 'Medicina General & Respiratorio', 'Infecciones agudas, patologías respiratorias comunes y atención primaria.', '#6366f1', 'fa-stethoscope', '2026-01-15T11:00:00Z')
on conflict (id) do nothing;

-- 2. Enfermedades iniciales
insert into public.diseases (id, category_id, name, code, description, severity, created_at)
values
  ('dis-hta', 'cat-cardio', 'Hipertensión Arterial Primaria (Grado 1-2)', 'I10', 'Elevación sostenida de la presión arterial (PAS ≥ 140 mmHg o PAD ≥ 90 mmHg) sin etiología secundaria identificable.', 'moderate', '2026-01-16T10:00:00Z'),
  ('dis-ic', 'cat-cardio', 'Insuficiencia Cardíaca con FEVI reducida (IC-FEr)', 'I50.2', 'Síndrome clínico caracterizado por síntomas típicos (disnea, fatiga) y fracción de eyección del ventrículo izquierdo < 40%.', 'severe', '2026-01-18T14:20:00Z'),
  ('dis-gastritis', 'cat-gastro', 'Gastritis Aguda Erosiva / Dispepsia', 'K29.0', 'Inflamación aguda de la mucosa gástrica caracterizada por dolor epigástrico, pirosis, náuseas posprandiales y meteorismo.', 'mild', '2026-01-20T08:45:00Z'),
  ('dis-erge', 'cat-gastro', 'Enfermedad por Reflujo Gastroesofágico (ERGE)', 'K21.9', 'Paso retrógrado espontáneo de contenido gástrico hacia el esófago produciendo pirosis retroesternal y regurgitación ácida.', 'moderate', '2026-01-22T16:15:00Z'),
  ('dis-faringitis', 'cat-medgen', 'Faringoamigdalitis Aguda Bacteriana', 'J03.0', 'Infección faríngea habitualmente por Streptococcus pyogenes (Streptococcus grupo A) confirmada por criterios de Centor o test rápido.', 'moderate', '2026-01-25T11:00:00Z')
on conflict (id) do nothing;

-- 3. Tratamientos iniciales
insert into public.treatments (id, disease_id, name, regimen, duration, clinical_notes, created_at, updated_at)
values
  ('treat-hta-1', 'dis-hta', 'Esquema Inicial Dual (ARA II + Calcioantagonista)', '1. Losartán 50 mg: Tomar 1 tableta vía oral cada 24 horas por la mañana.
2. Amlodipino 5 mg: Tomar 1 tableta vía oral cada 24 horas después del almuerzo.
3. Monitoreo diario de TA (mañana y noche) anotado en bitácora por 14 días.', 'Indefinida / Revisión en 30 días', 'Ideal para pacientes con PAS > 20 mmHg sobre objetivo. Verificar función renal y electrolitos a las 4 semanas.', '2026-01-16T10:15:00Z', '2026-01-16T10:15:00Z'),
  ('treat-ic-1', 'dis-ic', 'Terapia Cuádruple Estándar (Los 4 Pilares)', '1. Sacubitrilo/Valsartán 24/26 mg: 1 comprimido cada 12 horas.
2. Empagliflozina 10 mg: 1 comprimido cada 24 horas en ayunas.
3. Bisoprolol 2.5 mg: 1 comprimido cada 24 horas por la mañana.
4. Espironolactona 25 mg: 1 comprimido cada 24 horas.', 'Continuo con titulación progresiva mensual', 'Control de potasio sérico y creatinina cada 2 a 4 semanas tras titulación de dosis.', '2026-01-18T14:40:00Z', '2026-01-18T14:40:00Z'),
  ('treat-gastritis-1', 'dis-gastritis', 'Inhibición Ácida Intensiva + Citoprotección', '1. Esomeprazol 40 mg: Tomar 1 cápsula vía oral en ayunas, 30 minutos antes del desayuno.
2. Sucralfato suspensión (1g/5ml): Tomar 10 ml 1 hora antes de las comidas y al acostarse (4 veces al día).
3. Magaldrato + Simeticona: 1 cucharada de 10 ml 1 hora después del almuerzo y cena en caso de dolor o ardor.', '14 a 28 días', 'Evitar consumo concomitante de AINEs (ibuprofeno, naproxeno, ketorolaco). Si persiste >4 semanas solicitar endoscopia digestiva alta.', '2026-01-20T09:00:00Z', '2026-01-20T09:00:00Z'),
  ('treat-erge-1', 'dis-erge', 'Control Antisecretor Escalonado', '1. Dexlansoprazol 60 mg: Tomar 1 cápsula vía oral al despertar o con la primera comida del día.
2. Alginato de Sodio + Bicarbonato suspensión: Tomar 10 ml después de almuerzo, cena y al acostarse.', '8 semanas consecutivas', 'Reevaluar a las 8 semanas para desescalar a dosis mínima efectiva o mantenimiento según síntomas.', '2026-01-22T16:30:00Z', '2026-01-22T16:30:00Z'),
  ('treat-faringitis-1', 'dis-faringitis', 'Esquema Antimicrobiano Primera Línea + Manejo Sintomático', '1. Amoxicilina 875 mg + Ácido Clavulánico 125 mg: Tomar 1 tableta cada 12 horas con las comidas por 7 días completos.
(Si alergia a Penicilinas: Claritromicina 500 mg cada 12 horas por 10 días).
2. Ibuprofeno 400 mg: Tomar 1 tableta cada 8 horas por 3 días si hay odinofagia o fiebre > 38°C.
3. Bencidamina clorhidrato spray bucal: 3 nebulizaciones en orofaringe cada 6 horas según molestia.', '7 días exactos para el antibiótico', 'Completar los 7 días de antibiótico obligatoriamente para prevenir fiebre reumática y complicaciones supurativas.', '2026-01-25T11:20:00Z', '2026-01-25T11:20:00Z')
on conflict (id) do nothing;

-- 4. Recomendaciones iniciales
insert into public.recommendations (id, treatment_id, type, title, description, "order", created_at)
values
  ('rec-hta-1', 'treat-hta-1', 'diet', 'Restricción Estricta de Sodio (Sal)', 'Consumir menos de 2 gramos de sodio al día (equivalente a 1 cucharadita rasa de sal). Evitar embutidos, enlatados, caldos concentrados y comidas procesadas.', 1, '2026-01-16T10:20:00Z'),
  ('rec-hta-2', 'treat-hta-1', 'general', 'Actividad Física Aeróbica Regular', 'Realizar al menos 150 minutos semanales de ejercicio aeróbico de intensidad moderada (caminata rápida, bicicleta o natación) en sesiones de 30-45 minutos.', 2, '2026-01-16T10:21:00Z'),
  ('rec-hta-3', 'treat-hta-1', 'indication', 'Registro de Automonitoreo de Presión (AMPA)', 'Tomar la presión arterial sentado, en reposo previo de 5 minutos, con el brazo apoyado a la altura del corazón. Registrar en la libreta provista.', 3, '2026-01-16T10:22:00Z'),
  ('rec-hta-4', 'treat-hta-1', 'alarm_sign', 'Crisis Hipertensiva / Signos de Alarma', 'Acudir de inmediato a Urgencias si la presión supera 180/110 mmHg, o si presenta cefalea intensa en estallido, visión borrosa, dolor en el pecho o falta súbita de aire.', 4, '2026-01-16T10:23:00Z'),
  ('rec-ic-1', 'treat-ic-1', 'indication', 'Control Diario de Peso Matutino', 'Pesarse todos los días al levantarse, después de orinar y antes del desayuno, con la misma ropa. Anotar el peso en una libreta.', 1, '2026-01-18T14:45:00Z'),
  ('rec-ic-2', 'treat-ic-1', 'diet', 'Restricción de Líquidos y Sal', 'Límite de líquidos de 1.5 a 2 litros diarios totales (incluyendo sopas y café). Dieta hiposódica rigurosa.', 2, '2026-01-18T14:46:00Z')
on conflict (id) do nothing;
