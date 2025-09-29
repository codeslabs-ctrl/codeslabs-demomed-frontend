import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';
import { NewPatientWithHistory, Patient, PatientHistory } from '../models/patient.model';

// Interfaces para las respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PatientWithHistoryResponse {
  paciente: Patient;
  historia: PatientHistory;
  completeData?: any;
  message: string;
}

export interface PatientWithHistorialResponse {
  paciente: Patient;
  historial: PatientHistory[];
}

export interface PatientStatsResponse {
  total_consultas: number;
  medicos_unicos: number;
  especialidades_unicas: number;
  primera_consulta: string | null;
  ultima_consulta: string | null;
  historial: PatientHistory[];
}

@Injectable({
  providedIn: 'root'
})
export class PatientWithHistoryService {
  private baseUrl = `${APP_CONFIG.API_BASE_URL}/patients-with-history`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo paciente con su historia médica
   * @param patientData - Datos del paciente y su historia médica
   * @returns Observable con la respuesta del servidor
   */
  createPatientWithHistory(patientData: NewPatientWithHistory): Observable<ApiResponse<PatientWithHistoryResponse>> {
    return this.http.post<ApiResponse<PatientWithHistoryResponse>>(`${this.baseUrl}`, patientData);
  }

  /**
   * Obtener un paciente con su historial completo
   * @param patientId - ID del paciente
   * @returns Observable con los datos del paciente y su historial
   */
  getPatientWithHistory(patientId: number): Observable<ApiResponse<PatientWithHistorialResponse>> {
    return this.http.get<ApiResponse<PatientWithHistorialResponse>>(`${this.baseUrl}/${patientId}`);
  }

  /**
   * Actualizar un paciente con nueva historia médica
   * @param patientId - ID del paciente
   * @param updateData - Datos a actualizar
   * @returns Observable con la respuesta del servidor
   */
  updatePatientWithHistory(patientId: number, updateData: Partial<NewPatientWithHistory>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${patientId}`, updateData);
  }

  /**
   * Obtener estadísticas de un paciente específico
   * @param patientId - ID del paciente
   * @returns Observable con las estadísticas del paciente
   */
  getPatientStatistics(patientId: number): Observable<ApiResponse<PatientStatsResponse>> {
    return this.http.get<ApiResponse<PatientStatsResponse>>(`${this.baseUrl}/${patientId}/estadisticas`);
  }

  /**
   * Validar datos del paciente antes de enviar
   * @param patientData - Datos del paciente a validar
   * @returns Objeto con resultado de validación
   */
  validatePatientData(patientData: NewPatientWithHistory): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar datos del paciente
    if (!patientData.paciente.nombres?.trim()) {
      errors.push('Los nombres del paciente son requeridos');
    }

    if (!patientData.paciente.apellidos?.trim()) {
      errors.push('Los apellidos del paciente son requeridos');
    }

    if (!patientData.paciente.edad || patientData.paciente.edad < 0 || patientData.paciente.edad > 120) {
      errors.push('La edad debe estar entre 0 y 120 años');
    }

    if (!patientData.paciente.sexo) {
      errors.push('El sexo del paciente es requerido');
    }

    if (!patientData.paciente.email?.trim()) {
      errors.push('El email del paciente es requerido');
    } else if (!this.isValidEmail(patientData.paciente.email)) {
      errors.push('El email del paciente no es válido');
    }

    if (!patientData.paciente.telefono?.trim()) {
      errors.push('El teléfono del paciente es requerido');
    }

    // Validar datos de la historia
    if (!patientData.historia.medico_id) {
      errors.push('Debe seleccionar un médico');
    }

    if (!patientData.historia.motivo_consulta?.trim()) {
      errors.push('El motivo de consulta es requerido');
    }

    if (!patientData.historia.diagnostico?.trim()) {
      errors.push('El diagnóstico es requerido');
    }

    if (!patientData.historia.conclusiones?.trim()) {
      errors.push('Las conclusiones son requeridas');
    }

    if (!patientData.historia.fecha_consulta) {
      errors.push('La fecha de consulta es requerida');
    } else if (!this.isValidDateTime(patientData.historia.fecha_consulta)) {
      errors.push('La fecha de consulta no es válida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitizar datos del paciente antes de enviar
   * @param patientData - Datos del paciente a sanitizar
   * @returns Datos sanitizados
   */
  sanitizePatientData(patientData: NewPatientWithHistory): NewPatientWithHistory {
    const sanitized = { ...patientData };

    // Sanitizar datos del paciente
    sanitized.paciente = {
      ...sanitized.paciente,
      nombres: this.sanitizeText(sanitized.paciente.nombres),
      apellidos: this.sanitizeText(sanitized.paciente.apellidos),
      email: this.sanitizeText(sanitized.paciente.email).toLowerCase(),
      telefono: this.sanitizeText(sanitized.paciente.telefono)
    };

    // Sanitizar datos de la historia
    sanitized.historia = {
      ...sanitized.historia,
      motivo_consulta: this.sanitizeHtml(sanitized.historia.motivo_consulta),
      diagnostico: this.sanitizeHtml(sanitized.historia.diagnostico),
      conclusiones: this.sanitizeHtml(sanitized.historia.conclusiones),
      plan: this.sanitizeHtml(sanitized.historia.plan || '')
    };

    return sanitized;
  }

  /**
   * Validar email
   * @param email - Email a validar
   * @returns true si es válido
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Validar fecha y hora
   * @param dateTime - Fecha y hora a validar
   * @returns true si es válida
   */
  private isValidDateTime(dateTime: string): boolean {
    const date = new Date(dateTime);
    return !isNaN(date.getTime()) && date <= new Date();
  }

  /**
   * Sanitizar texto
   * @param text - Texto a sanitizar
   * @returns Texto sanitizado
   */
  private sanitizeText(text: string): string {
    if (!text) return '';
    return text.trim().replace(/[<>]/g, '');
  }

  /**
   * Sanitizar HTML
   * @param html - HTML a sanitizar
   * @returns HTML sanitizado
   */
  private sanitizeHtml(html: string): string {
    if (!html) return '';
    
    // Lista de tags permitidos
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
    // Crear un elemento temporal para procesar el HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Función recursiva para sanitizar nodos
    const sanitizeNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        if (allowedTags.includes(tagName)) {
          const attributes = Array.from(element.attributes)
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(' ');
          
          const children = Array.from(element.childNodes)
            .map(child => sanitizeNode(child))
            .join('');
          
          return `<${tagName}${attributes ? ' ' + attributes : ''}>${children}</${tagName}>`;
        } else {
          // Si el tag no está permitido, solo devolver el contenido
          return Array.from(element.childNodes)
            .map(child => sanitizeNode(child))
            .join('');
        }
      }
      
      return '';
    };
    
    return Array.from(temp.childNodes)
      .map(child => sanitizeNode(child))
      .join('');
  }
}
