import { Injectable, signal } from '@angular/core';
import { Disease } from '../models/disease.model';
import { Category } from '../models/category.model';
import { RecommendationType } from '../models/recommendation.model';
import { ToastService } from './toast.service';

export interface AiGeneratedDraft {
  name: string;
  regimen: string;
  duration: string;
  clinicalNotes: string;
  recommendations: Array<{
    type: RecommendationType;
    title: string;
    description: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class AiAssistantService {
  public readonly isGenerating = signal<boolean>(false);
  public readonly aiStatusMessage = signal<string>('');

  constructor(private toast: ToastService) {}

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simulates generating a complete evidence-based clinical draft for a disease
   */
  async generateDraftFromDisease(disease: Disease, category?: Category | null): Promise<AiGeneratedDraft> {
    this.isGenerating.set(true);
    this.aiStatusMessage.set(`Analizando guías clínicas para: ${disease.name}...`);
    await this.delay(700);

    this.aiStatusMessage.set('Sintetizando posología, interacciones y farmacocinética...');
    await this.delay(700);

    this.aiStatusMessage.set('Estructurando signos de alarma y recomendaciones para el paciente...');
    await this.delay(600);

    this.isGenerating.set(false);
    this.aiStatusMessage.set('');

    const name = disease.name.toLowerCase();

    // Contextual responses based on disease characteristics
    if (name.includes('hipertensión') || name.includes('hta') || name.includes('arterial')) {
      return {
        name: 'Guía Clínica: Triple Terapia Antihipertensiva Optimizada',
        regimen: `1. Telmisartán 80 mg: 1 tableta vía oral cada 24 horas por las mañanas.
2. Amlodipino 5 mg: 1 tableta vía oral cada 24 horas después del desayuno.
3. Hidroclorotiazida 12.5 mg: 1 tableta vía oral por la mañana en ayunas.
4. Registro de presión arterial: Tomar en reposo 2 veces al día (08:00 y 20:00).`,
        duration: 'Tratamiento continuo con control en 3 semanas',
        clinicalNotes: 'Verificar ionograma (potasio/sodio) y tasa de filtrado glomerular a los 21 días. Evaluar tolerancia ortostática.',
        recommendations: [
          {
            type: 'diet',
            title: 'Protocolo Nutricional DASH Estricto',
            description: 'Reducir consumo de sodio a menos de 1500 mg/día. Incrementar frutas ricas en potasio, verduras de hoja verde y cereales enteros.',
          },
          {
            type: 'general',
            title: 'Higiene del Sueño y Reducción del Estrés',
            description: 'Dormir entre 7 y 8 horas diarias de forma regular. Técnicas de respiración diafragmática para manejo de tensión.',
          },
          {
            type: 'alarm_sign',
            title: 'Alerta Roja: Cifras de Emergencia Hipertensiva',
            description: 'Si la presión supera 180/120 mmHg o presenta dolor opresivo precordial, asimetría facial o disartria, acudir inmediatamente al centro de urgencias.',
          },
          {
            type: 'indication',
            title: 'Técnica de Automedición Domiciliaria',
            description: 'Reposo previo de 5 minutos, vejiga vacía, espalda apoyada, sin haber consumido café ni cigarrillo en los 30 minutos previos.',
          },
        ],
      };
    }

    if (name.includes('gastritis') || name.includes('reflujo') || name.includes('erge') || name.includes('estómago')) {
      return {
        name: 'Terapia de Erradicación & Reepitelización Mucosa',
        regimen: `1. Pantoprazol 40 mg: 1 cápsula vía oral 30 minutos antes del desayuno por 28 días.
2. Dimeticona + Hidróxido de Aluminio y Magnesio: 15 ml 1 hora después de cada comida y antes de acostarse.
3. Procinético (Itoprida 50 mg o Cinitaprida 1 mg): 1 comprimido 15 minutos antes de las 3 comidas principales.`,
        duration: '4 semanas consecutivas',
        clinicalNotes: 'Indicar prueba de antígeno en heces para H. pylori si no se ha realizado previamente.',
        recommendations: [
          {
            type: 'diet',
            title: 'Alimentación No Irritante Fraccionada',
            description: 'Evitar café, té negro, gaseosas, condimentos picantes, salsas procesadas, cítricos y alimentos con alto contenido graso.',
          },
          {
            type: 'general',
            title: 'Control Postural y Postprandial',
            description: 'No acostarse de forma horizontal hasta 2.5 a 3 horas después de comer. Caminata suave de 10 minutos tras las comidas.',
          },
          {
            type: 'alarm_sign',
            title: 'Signos de Hemorragia Digestiva',
            description: 'Vómito de aspecto similar a posos de café, heces oscuras/negras con olor fuerte, palidez súbita o mareo al ponerse de pie.',
          },
        ],
      };
    }

    // Default general template adapted to the clinical disease
    return {
      name: `Protocolo Estándar de Atención para ${disease.name}`,
      regimen: `1. Fármaco de primera línea según guías: Administrar dosis inicial ajustada a peso y función renal.
2. Medicación de alivio sintomático: Tomar cada 8 horas con abundante agua en caso de dolor o disconfort.
3. Medidas no farmacológicas de soporte y reposo relativo.`,
      duration: '7 a 14 días con evaluación según respuesta clínica',
      clinicalNotes: `Paciente evaluado en ${category?.name || 'Consulta Médica'}. Monitorear evolución y descartar contraindicaciones o polifarmacia.`,
      recommendations: [
        {
          type: 'general',
          title: 'Reposo y Aislamiento Preventivo',
          description: 'Mantener reposo en cama las primeras 48 horas. Mantener la habitación ventilada e hidratación constante.',
        },
        {
          type: 'diet',
          title: 'Nutrición Balanceada e Hidratación',
          description: 'Dieta blanda de fácil digestión, evitar ultraprocesados y mantener ingesta de al menos 2 litros de agua diarios.',
        },
        {
          type: 'alarm_sign',
          title: 'Signos de Alarma Generales',
          description: 'Fiebre persistente >38.5°C refractaria a antipiréticos por más de 72 horas, disnea progresiva o alteración del estado de conciencia.',
        },
        {
          type: 'indication',
          title: 'Adherencia Farmacológica',
          description: 'Tomar la medicación exactamente en los horarios prescritos sin alterar las dosis ni suspender prematuramente.',
        },
      ],
    };
  }

  /**
   * Simulates AI rewriting to make treatment text crystal clear, friendly, and unambiguous for patients
   */
  async improveRegimenText(currentRegimen: string): Promise<string> {
    this.isGenerating.set(true);
    this.aiStatusMessage.set('Optimizando claridad, pautas horarias y comprensión para el paciente...');
    await this.delay(1200);
    this.isGenerating.set(false);
    this.aiStatusMessage.set('');

    const lines = currentRegimen.split('\n').filter(l => l.trim().length > 0);
    const polishedLines = lines.map((line, idx) => {
      let cleaned = line.replace(/^\d+[\.\-\)]\s*/, '').trim();
      return `💊 Medicamento ${idx + 1}: ${cleaned}\n   ↳ Recomendación: Tomar con 1 vaso completo de agua; respetar estrictamente el intervalo horario.`;
    });

    return `📋 ESQUEMA FARMACOLÓGICO OPTIMIZADO:\n\n${polishedLines.join('\n\n')}\n\n⚠️ Nota para el paciente: No combinar con alcohol ni suspender el tratamiento antes del tiempo indicado sin indicación de su médico tratante.`;
  }
}
