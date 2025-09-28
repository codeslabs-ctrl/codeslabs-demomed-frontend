import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient, ApiResponse, Pagination, PatientFilters } from '../models/patient.model';
import { APP_CONFIG } from '../config/app.config';
import { SanitizationService } from './sanitization.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private baseUrl = `${APP_CONFIG.API_BASE_URL}${APP_CONFIG.API_ENDPOINTS.PATIENTS}`;

  constructor(
    private http: HttpClient,
    private sanitizationService: SanitizationService
  ) {}

  getAllPatients(filters: PatientFilters = {}, pagination: { page: number, limit: number } = { page: 1, limit: APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE }): Observable<ApiResponse<Patient[]>> {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('limit', pagination.limit.toString());

    // Add filters to params
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof PatientFilters];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Patient[]>>(`${this.baseUrl}`, { params });
  }

  getPatientById(id: number): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.API_ENDPOINTS.PATIENT_BY_ID(id)}`);
  }

  getPatientByEmail(email: string): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.API_ENDPOINTS.PATIENT_BY_EMAIL(email)}`);
  }

  createPatient(patient: Omit<Patient, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Observable<ApiResponse<Patient>> {
    // Validar datos antes de enviar
    const validation = this.sanitizationService.validatePatientData(patient);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
    }

    // Sanitizar datos antes de enviar
    const sanitizedPatient = this.sanitizePatientData(patient);
    return this.http.post<ApiResponse<Patient>>(`${this.baseUrl}`, sanitizedPatient);
  }

  updatePatient(id: number, patient: Partial<Patient>): Observable<ApiResponse<Patient>> {
    // Validar datos antes de enviar
    const validation = this.sanitizationService.validatePatientData(patient);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
    }

    // Sanitizar datos antes de enviar
    const sanitizedPatient = this.sanitizePatientData(patient);
    return this.http.put<ApiResponse<Patient>>(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.API_ENDPOINTS.PATIENT_BY_ID(id)}`, sanitizedPatient);
  }

  deletePatient(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.API_ENDPOINTS.PATIENT_BY_ID(id)}`);
  }

  searchPatients(name: string): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.API_ENDPOINTS.PATIENT_SEARCH}`, {
      params: { name }
    });
  }

  getPatientsByAgeRange(minAge: number, maxAge: number): Observable<ApiResponse<Patient[]>> {
    return this.http.get<ApiResponse<Patient[]>>(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.API_ENDPOINTS.PATIENT_AGE_RANGE}`, {
      params: { minAge: minAge.toString(), maxAge: maxAge.toString() }
    });
  }

  getPatientStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.API_ENDPOINTS.PATIENT_STATISTICS}`);
  }

  /**
   * Sanitiza los datos del paciente antes de enviarlos al servidor
   * @param patient - Datos del paciente a sanitizar
   * @returns Datos del paciente sanitizados
   */
  private sanitizePatientData(patient: any): any {
    const sanitized = { ...patient };

    // Sanitizar campos de texto
    if (sanitized.nombres) {
      sanitized.nombres = this.sanitizationService.sanitizeText(sanitized.nombres);
    }

    if (sanitized.apellidos) {
      sanitized.apellidos = this.sanitizationService.sanitizeText(sanitized.apellidos);
    }

    if (sanitized.email) {
      sanitized.email = this.sanitizationService.sanitizeText(sanitized.email).toLowerCase();
    }

    if (sanitized.telefono) {
      sanitized.telefono = this.sanitizationService.sanitizeText(sanitized.telefono);
    }

    // Sanitizar campos HTML
    if (sanitized.motivo_consulta) {
      sanitized.motivo_consulta = this.sanitizationService.cleanHtmlForStorage(sanitized.motivo_consulta);
    }

    if (sanitized.diagnostico) {
      sanitized.diagnostico = this.sanitizationService.cleanHtmlForStorage(sanitized.diagnostico);
    }

    if (sanitized.conclusiones) {
      sanitized.conclusiones = this.sanitizationService.cleanHtmlForStorage(sanitized.conclusiones);
    }

    // Validar y sanitizar edad
    if (sanitized.edad) {
      const edad = parseInt(sanitized.edad);
      if (isNaN(edad) || edad < 0 || edad > 150) {
        throw new Error('La edad debe ser un número válido entre 0 y 150');
      }
      sanitized.edad = edad;
    }

    // Validar sexo
    if (sanitized.sexo && !['Masculino', 'Femenino', 'Otro'].includes(sanitized.sexo)) {
      sanitized.sexo = 'Otro';
    }

    return sanitized;
  }
}
