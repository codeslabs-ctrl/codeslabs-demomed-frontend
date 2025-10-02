import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';
import { ApiResponse } from '../models/patient.model';

export interface HistoricoData {
  id: number;
  paciente_id: number;
  medico_id: number;
  motivo_consulta: string;
  diagnostico?: string;
  conclusiones?: string;
  antecedentes_medicos?: string;
  medicamentos?: string;
  alergias?: string;
  observaciones?: string;
  fecha_consulta: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface HistoricoWithDetails extends HistoricoData {
  paciente_nombre?: string;
  paciente_apellidos?: string;
  medico_nombre?: string;
  medico_apellidos?: string;
  nombre_medico?: string; // Field that actually comes from the backend
}

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  private baseUrl = `${APP_CONFIG.API_BASE_URL}/historico`;

  constructor(private http: HttpClient) {}

  // Obtener historial por paciente
  getHistoricoByPaciente(pacienteId: number): Observable<ApiResponse<HistoricoWithDetails[]>> {
    return this.http.get<ApiResponse<HistoricoWithDetails[]>>(`${this.baseUrl}/by-paciente/${pacienteId}`);
  }

  // Obtener el historial más reciente por paciente
  getLatestHistoricoByPaciente(pacienteId: number): Observable<ApiResponse<HistoricoWithDetails>> {
    return this.http.get<ApiResponse<HistoricoWithDetails>>(`${this.baseUrl}/by-paciente/${pacienteId}/latest`);
  }

  // Obtener historial por médico
  getHistoricoByMedico(medicoId: number): Observable<ApiResponse<HistoricoWithDetails[]>> {
    return this.http.get<ApiResponse<HistoricoWithDetails[]>>(`${this.baseUrl}/by-medico/${medicoId}`);
  }

  // Obtener historial completo
  getHistoricoCompleto(): Observable<ApiResponse<HistoricoWithDetails[]>> {
    return this.http.get<ApiResponse<HistoricoWithDetails[]>>(this.baseUrl);
  }

  // Obtener historial filtrado
  getHistoricoFiltrado(pacienteId?: number, medicoId?: number): Observable<ApiResponse<HistoricoWithDetails[]>> {
    let params = new HttpParams();
    
    if (pacienteId) {
      params = params.set('paciente_id', pacienteId.toString());
    }
    
    if (medicoId) {
      params = params.set('medico_id', medicoId.toString());
    }

    return this.http.get<ApiResponse<HistoricoWithDetails[]>>(`${this.baseUrl}/filtrado`, { params });
  }
}
