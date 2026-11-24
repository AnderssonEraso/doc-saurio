import { Category } from '../models/category.model';
import { Disease } from '../models/disease.model';
import { Treatment } from '../models/treatment.model';
import { Recommendation } from '../models/recommendation.model';
import { User } from '../models/user.model';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-cardio',
    name: 'Cardiología',
    description: 'Enfermedades cardiovasculares, hipertensión y manejo hemodinámico.',
    color: '#0284c7', // sky-600
    icon: 'fa-heart-pulse',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cat-gastro',
    name: 'Gastroenterología',
    description: 'Trastornos del tracto digestivo, reflujo, mucosa gástrica y hepatobiliares.',
    color: '#0d9488', // teal-600
    icon: 'fa-capsules',
    createdAt: '2026-01-12T09:30:00Z',
  },
  {
    id: 'cat-medgen',
    name: 'Medicina General & Respiratorio',
    description: 'Infecciones agudas, patologías respiratorias comunes y atención primaria.',
    color: '#6366f1', // indigo-500
    icon: 'fa-stethoscope',
    createdAt: '2026-01-15T11:00:00Z',
  },
];

export const INITIAL_DISEASES: Disease[] = [
  {
    id: 'dis-hta',
    categoryId: 'cat-cardio',
    name: 'Hipertensión Arterial Primaria (Grado 1-2)',
    code: 'I10',
    description: 'Elevación sostenida de la presión arterial (PAS ≥ 140 mmHg o PAD ≥ 90 mmHg) sin etiología secundaria identificable.',
    severity: 'moderate',
    createdAt: '2026-01-16T10:00:00Z',
  },
  {
    id: 'dis-ic',
    categoryId: 'cat-cardio',
    name: 'Insuficiencia Cardíaca con FEVI reducida (IC-FEr)',
    code: 'I50.2',
    description: 'Síndrome clínico caracterizado por síntomas típicos (disnea, fatiga) y fracción de eyección del ventrículo izquierdo < 40%.',
    severity: 'severe',
    createdAt: '2026-01-18T14:20:00Z',
  },
  {
    id: 'dis-gastritis',
    categoryId: 'cat-gastro',
    name: 'Gastritis Aguda Erosiva / Dispepsia',
    code: 'K29.0',
    description: 'Inflamación aguda de la mucosa gástrica caracterizada por dolor epigástrico, pirosis, náuseas posprandiales y meteorismo.',
    severity: 'mild',
    createdAt: '2026-01-20T08:45:00Z',
  },
  {
    id: 'dis-erge',
    categoryId: 'cat-gastro',
    name: 'Enfermedad por Reflujo Gastroesofágico (ERGE)',
    code: 'K21.9',
    description: 'Paso retrógrado espontáneo de contenido gástrico hacia el esófago produciendo pirosis retroesternal y regurgitación ácida.',
    severity: 'moderate',
    createdAt: '2026-01-22T16:15:00Z',
  },
  {
    id: 'dis-faringitis',
    categoryId: 'cat-medgen',
    name: 'Faringoamigdalitis Aguda Bacteriana',
    code: 'J03.0',
    description: 'Infección faríngea habitualmente por Streptococcus pyogenes (Streptococcus grupo A) confirmada por criterios de Centor o test rápido.',
    severity: 'moderate',
    createdAt: '2026-01-25T11:00:00Z',
  },
];

export const INITIAL_TREATMENTS: Treatment[] = [
  {
    id: 'treat-hta-1',
    diseaseId: 'dis-hta',
    name: 'Esquema Inicial Dual (ARA II + Calcioantagonista)',
    regimen: `1. Losartán 50 mg: Tomar 1 tableta vía oral cada 24 horas por la mañana.
2. Amlodipino 5 mg: Tomar 1 tableta vía oral cada 24 horas después del almuerzo.
3. Monitoreo diario de TA (mañana y noche) anotado en bitácora por 14 días.`,
    duration: 'Indefinida / Revisión en 30 días',
    clinicalNotes: 'Ideal para pacientes con PAS > 20 mmHg sobre objetivo. Verificar función renal y electrolitos a las 4 semanas.',
    createdAt: '2026-01-16T10:15:00Z',
    updatedAt: '2026-01-16T10:15:00Z',
  },
  {
    id: 'treat-ic-1',
    diseaseId: 'dis-ic',
    name: 'Terapia Cuádruple Estándar (Los 4 Pilares)',
    regimen: `1. Sacubitrilo/Valsartán 24/26 mg: 1 comprimido cada 12 horas.
2. Empagliflozina 10 mg: 1 comprimido cada 24 horas en ayunas.
3. Bisoprolol 2.5 mg: 1 comprimido cada 24 horas por la mañana.
4. Espironolactona 25 mg: 1 comprimido cada 24 horas.`,
    duration: 'Continuo con titulación progresiva mensual',
    clinicalNotes: 'Control de potasio sérico y creatinina cada 2 a 4 semanas tras titulación de dosis.',
    createdAt: '2026-01-18T14:40:00Z',
    updatedAt: '2026-01-18T14:40:00Z',
  },
  {
    id: 'treat-gastritis-1',
    diseaseId: 'dis-gastritis',
    name: 'Inhibición Ácida Intensiva + Citoprotección',
    regimen: `1. Esomeprazol 40 mg: Tomar 1 cápsula vía oral en ayunas, 30 minutos antes del desayuno.
2. Sucralfato suspensión (1g/5ml): Tomar 10 ml 1 hora antes de las comidas y al acostarse (4 veces al día).
3. Magaldrato + Simeticona: 1 cucharada de 10 ml 1 hora después del almuerzo y cena en caso de dolor o ardor.`,
    duration: '14 a 28 días',
    clinicalNotes: 'Evitar consumo concomitante de AINEs (ibuprofeno, naproxeno, ketorolaco). Si persiste >4 semanas solicitar endoscopia digestiva alta.',
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-01-20T09:00:00Z',
  },
  {
    id: 'treat-erge-1',
    diseaseId: 'dis-erge',
    name: 'Control Antisecretor Escalonado',
    regimen: `1. Dexlansoprazol 60 mg: Tomar 1 cápsula vía oral al despertar o con la primera comida del día.
2. Alginato de Sodio + Bicarbonato suspensión: Tomar 10 ml después de almuerzo, cena y al acostarse.`,
    duration: '8 semanas consecutivas',
    clinicalNotes: 'Reevaluar a las 8 semanas para desescalar a dosis mínima efectiva o mantenimiento según síntomas.',
    createdAt: '2026-01-22T16:30:00Z',
    updatedAt: '2026-01-22T16:30:00Z',
  },
  {
    id: 'treat-faringitis-1',
    diseaseId: 'dis-faringitis',
    name: 'Esquema Antimicrobiano Primera Línea + Manejo Sintomático',
    regimen: `1. Amoxicilina 875 mg + Ácido Clavulánico 125 mg: Tomar 1 tableta cada 12 horas con las comidas por 7 días completos.
(Si alergia a Penicilinas: Claritromicina 500 mg cada 12 horas por 10 días).
2. Ibuprofeno 400 mg: Tomar 1 tableta cada 8 horas por 3 días si hay odinofagia o fiebre > 38°C.
3. Bencidamina clorhidrato spray bucal: 3 nebulizaciones en orofaringe cada 6 horas según molestia.`,
    duration: '7 días exactos para el antibiótico',
    clinicalNotes: 'Completar los 7 días de antibiótico obligatoriamente para prevenir fiebre reumática y complicaciones supurativas.',
    createdAt: '2026-01-25T11:20:00Z',
    updatedAt: '2026-01-25T11:20:00Z',
  },
];

export const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  // HTA recommendations
  {
    id: 'rec-hta-1',
    treatmentId: 'treat-hta-1',
    type: 'diet',
    title: 'Restricción Estricta de Sodio (Sal)',
    description: 'Consumir menos de 2 gramos de sodio al día (equivalente a 1 cucharadita rasa de sal). Evitar embutidos, enlatados, caldos concentrados y comidas procesadas.',
    order: 1,
    createdAt: '2026-01-16T10:20:00Z',
  },
  {
    id: 'rec-hta-2',
    treatmentId: 'treat-hta-1',
    type: 'general',
    title: 'Actividad Física Aeróbica Regular',
    description: 'Realizar al menos 150 minutos semanales de ejercicio aeróbico de intensidad moderada (caminata rápida, bicicleta o natación) en sesiones de 30-45 minutos.',
    order: 2,
    createdAt: '2026-01-16T10:21:00Z',
  },
  {
    id: 'rec-hta-3',
    treatmentId: 'treat-hta-1',
    type: 'indication',
    title: 'Registro de Automonitoreo de Presión (AMPA)',
    description: 'Tomar la presión arterial sentado, en reposo previo de 5 minutos, con el brazo apoyado a la altura del corazón. Registrar en la libreta provista.',
    order: 3,
    createdAt: '2026-01-16T10:22:00Z',
  },
  {
    id: 'rec-hta-4',
    treatmentId: 'treat-hta-1',
    type: 'alarm_sign',
    title: 'Crisis Hipertensiva / Signos de Alarma',
    description: 'Acudir de inmediato a Urgencias si la presión supera 180/110 mmHg, o si presenta cefalea intensa en estallido, visión borrosa, dolor en el pecho o falta súbita de aire.',
    order: 4,
    createdAt: '2026-01-16T10:23:00Z',
  },

  // Insuficiencia Cardíaca recommendations
  {
    id: 'rec-ic-1',
    treatmentId: 'treat-ic-1',
    type: 'indication',
    title: 'Control Diario de Peso Matutino',
    description: 'Pesarse todos los días al levantarse, después de orinar y antes del desayuno, con la misma ropa. Anotar el peso en una libreta.',
    order: 1,
    createdAt: '2026-01-18T14:45:00Z',
  },
  {
    id: 'rec-ic-2',
    treatmentId: 'treat-ic-1',
    type: 'diet',
    title: 'Restricción de Líquidos y Sal',
    description: 'Límite de líquidos de 1.5 a 2 litros diarios totales (incluyendo sopas y café). Dieta hiposódica rigurosa.',
    order: 2,
    createdAt: '2026-01-18T14:46:00Z',
  },
  {
    id: 'rec-ic-3',
    treatmentId: 'treat-ic-1',
    type: 'alarm_sign',
    title: 'Descompensación Aguda por Sobrecarga',
    description: 'Aumento de peso repentino de ≥ 2 kg en 3 días, aumento de hinchazón (edema) en tobillos, o necesidad de usar más almohadas para dormir por ahogo nocturno.',
    order: 3,
    createdAt: '2026-01-18T14:47:00Z',
  },

  // Gastritis recommendations
  {
    id: 'rec-gas-1',
    treatmentId: 'treat-gastritis-1',
    type: 'diet',
    title: 'Dieta Gástrica Fraccionada',
    description: 'Comer porciones moderadas cada 3 a 4 horas. Evitar comidas copiosas, condimentos fuertes, fritos, picantes, cítricos, chocolate y café.',
    order: 1,
    createdAt: '2026-01-20T09:10:00Z',
  },
  {
    id: 'rec-gas-2',
    treatmentId: 'treat-gastritis-1',
    type: 'general',
    title: 'Suspensión de Irritantes de Mucosa',
    description: 'Evitar totalmente tabaco, bebidas alcohólicas y bebidas gaseosas durante todo el tratamiento.',
    order: 2,
    createdAt: '2026-01-20T09:11:00Z',
  },
  {
    id: 'rec-gas-3',
    treatmentId: 'treat-gastritis-1',
    type: 'alarm_sign',
    title: 'Sangrado Gastrointestinal',
    description: 'Acudir a emergencias ante vómitos con sangre o restos tipo "cuncho de café", o heces negras fétidas y pastosas (melenas).',
    order: 3,
    createdAt: '2026-01-20T09:12:00Z',
  },

  // ERGE recommendations
  {
    id: 'rec-erge-1',
    treatmentId: 'treat-erge-1',
    type: 'general',
    title: 'Elevación de la Cabecera de la Cama',
    description: 'Elevar la cabecera de la cama 15-20 cm mediante cuña o calces bajo las patas del somier (no solo apilar almohadas).',
    order: 1,
    createdAt: '2026-01-22T16:35:00Z',
  },
  {
    id: 'rec-erge-2',
    treatmentId: 'treat-erge-1',
    type: 'diet',
    title: 'Intervalo Nocturno y Prendas Holgadas',
    description: 'No acostarse hasta transcurridas al menos 2.5 a 3 horas después de cenar. Evitar ropa o cinturones ajustados al abdomen.',
    order: 2,
    createdAt: '2026-01-22T16:36:00Z',
  },
  {
    id: 'rec-erge-3',
    treatmentId: 'treat-erge-1',
    type: 'alarm_sign',
    title: 'Disfagia Progresiva',
    description: 'Dificultad o dolor al tragar alimentos sólidos, sensación de atoro persistente en el pecho o pérdida involuntaria de peso.',
    order: 3,
    createdAt: '2026-01-22T16:37:00Z',
  },

  // Faringitis recommendations
  {
    id: 'rec-far-1',
    treatmentId: 'treat-faringitis-1',
    type: 'indication',
    title: 'Cumplimiento Estricto del Esquema Antibiótico',
    description: 'No suspender la medicación aunque los síntomas mejoren a las 48 horas. Tomar con alimentos para minimizar malestar estomacal.',
    order: 1,
    createdAt: '2026-01-25T11:25:00Z',
  },
  {
    id: 'rec-far-2',
    treatmentId: 'treat-faringitis-1',
    type: 'general',
    title: 'Hidratación Abundante y Reposo Vocal',
    description: 'Ingerir líquidos tibios o a temperatura ambiente en abundancia (agua, infusiones de manzanilla con miel). Evitar hablar en exceso.',
    order: 2,
    createdAt: '2026-01-25T11:26:00Z',
  },
  {
    id: 'rec-far-3',
    treatmentId: 'treat-faringitis-1',
    type: 'alarm_sign',
    title: 'Dificultad Respiratoria o Trismus',
    description: 'Consultar de urgencia si presenta dificultad para respirar, incapacidad absoluta para deglutir saliva (sialorrea) o imposibilidad de abrir la boca (trismus).',
    order: 3,
    createdAt: '2026-01-25T11:27:00Z',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Dr. Royer Nova',
    email: 'dr.royer@novamed.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    specialty: 'Medicina Interna & Cardiología',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'usr-2',
    name: 'Dra. Andrea Méndez',
    email: 'dra.andrea@novamed.com',
    role: 'doctor',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813583-71869e46a783?w=150&auto=format&fit=crop&q=80',
    specialty: 'Gastroenterología Clínica',
    createdAt: '2026-01-05T09:00:00Z',
  },
  {
    id: 'usr-3',
    name: 'Dr. Carlos Benítez',
    email: 'carlos.benitez@novamed.com',
    role: 'doctor',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    specialty: 'Medicina Familiar y Comunitaria',
    createdAt: '2026-01-10T12:00:00Z',
  },
];
