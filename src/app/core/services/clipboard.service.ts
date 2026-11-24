import { Injectable } from '@angular/core';
import { Disease } from '../models/disease.model';
import { Treatment } from '../models/treatment.model';
import { Recommendation } from '../models/recommendation.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  constructor(private toast: ToastService) {}

  private async writeText(text: string, title: string, subtitle: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure or restricted contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      this.toast.success(title, subtitle, 'fa-copy');
      return true;
    } catch (err) {
      console.error('Clipboard copy error:', err);
      this.toast.error('Error al copiar', 'No se pudo copiar el texto al portapapeles');
      return false;
    }
  }

  /**
   * Copia Todo: Enfermedad + Esquema + Recomendaciones formateadas listas para Historia Clínica o WhatsApp
   */
  async copyAll(disease: Disease, treatment: Treatment, recommendations: Recommendation[]): Promise<boolean> {
    const divider = '──────────────────────────────────────────';
    
    // Group recommendations by type
    const general = recommendations.filter(r => r.type === 'general');
    const diet = recommendations.filter(r => r.type === 'diet');
    const alarmSigns = recommendations.filter(r => r.type === 'alarm_sign');
    const indications = recommendations.filter(r => r.type === 'indication');

    let text = `🏥 ROYER NOVAMED - PLAN MÉDICO INTEGRAL\n`;
    text += `${divider}\n`;
    text += `🩺 PATOLOGÍA: ${disease.name.toUpperCase()} (CIE-10: ${disease.code})\n`;
    text += `📋 ESQUEMA: ${treatment.name}\n`;
    text += `⏱️ DURACIÓN: ${treatment.duration}\n\n`;

    text += `💊 PRESCRIPCIÓN Y POSOLOGÍA:\n`;
    text += `${treatment.regimen}\n\n`;

    if (treatment.clinicalNotes) {
      text += `📝 NOTAS CLÍNICAS:\n${treatment.clinicalNotes}\n\n`;
    }

    if (recommendations.length > 0) {
      text += `${divider}\n`;
      text += `📌 RECOMENDACIONES Y CUIDADOS AL PACIENTE:\n\n`;

      if (general.length > 0) {
        text += `🔹 CUIDADOS GENERALES:\n`;
        general.forEach(r => {
          text += `  • ${r.title}: ${r.description}\n`;
        });
        text += `\n`;
      }

      if (diet.length > 0) {
        text += `🥗 DIETA Y NUTRICIÓN:\n`;
        diet.forEach(r => {
          text += `  • ${r.title}: ${r.description}\n`;
        });
        text += `\n`;
      }

      if (indications.length > 0) {
        text += `📋 INDICACIONES ESPECIALES:\n`;
        indications.forEach(r => {
          text += `  • ${r.title}: ${r.description}\n`;
        });
        text += `\n`;
      }

      if (alarmSigns.length > 0) {
        text += `🚨 SIGNOS DE ALARMA (CONSULTAR A URGENCIAS SI PRESENTA):\n`;
        alarmSigns.forEach(r => {
          text += `  ⚠️ ${r.title}: ${r.description}\n`;
        });
        text += `\n`;
      }
    }

    text += `${divider}\n`;
    text += `Dr(a). Tratante • Royer NovaMed Clinical System`;

    return this.writeText(
      text,
      '¡Plan completo copiado!',
      'Listo para pegar en Historia Clínica o enviar al paciente vía WhatsApp.'
    );
  }

  /**
   * Copia Solo Esquema de Tratamiento
   */
  async copyTreatment(disease: Disease, treatment: Treatment): Promise<boolean> {
    let text = `💊 TRATAMIENTO: ${disease.name} (${disease.code})\n`;
    text += `Esquema: ${treatment.name}\n`;
    text += `Duración: ${treatment.duration}\n\n`;
    text += `POSOLOGÍA:\n${treatment.regimen}\n`;

    if (treatment.clinicalNotes) {
      text += `\nNotas: ${treatment.clinicalNotes}\n`;
    }

    return this.writeText(
      text,
      '¡Tratamiento copiado!',
      'Esquema farmacológico copiado al portapapeles.'
    );
  }

  /**
   * Copia Solo Recomendaciones
   */
  async copyRecommendations(disease: Disease, recommendations: Recommendation[]): Promise<boolean> {
    let text = `📌 RECOMENDACIONES MÉDICAS - ${disease.name.toUpperCase()}\n\n`;

    recommendations.forEach(r => {
      const typeLabel =
        r.type === 'alarm_sign'
          ? '🚨 SIGNO DE ALARMA'
          : r.type === 'diet'
          ? '🥗 DIETA'
          : r.type === 'general'
          ? '🔹 GENERAL'
          : '📋 INDICACIÓN';
      text += `[${typeLabel}] ${r.title}\n${r.description}\n\n`;
    });

    return this.writeText(
      text,
      '¡Recomendaciones copiadas!',
      `${recommendations.length} recomendaciones copiadas al portapapeles.`
    );
  }
}
