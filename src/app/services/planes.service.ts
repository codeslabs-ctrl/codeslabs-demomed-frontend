import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';

export interface PlanComparativaRow {
  id: number;
  caracteristica: string;
  plan_profesional: string;
  plan_clinica_core: string;
  plan_clinica_pro: string;
  orden: number;
}

export interface AddonProgresivoRow {
  id: number;
  complemento: string;
  en_plan_profesional: string;
  en_plan_clinica_core: string;
  en_plan_clinica_pro: string;
  orden: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
}

@Injectable({ providedIn: 'root' })
export class PlanesService {
  private baseUrl = `${APP_CONFIG.API_BASE_URL}/planes`;

  constructor(private http: HttpClient) {}

  getPlanesComparativa(): Observable<ApiResponse<PlanComparativaRow[]>> {
    return this.http.get<ApiResponse<PlanComparativaRow[]>>(`${this.baseUrl}/comparativa`);
  }

  getAddonsProgresivos(): Observable<ApiResponse<AddonProgresivoRow[]>> {
    return this.http.get<ApiResponse<AddonProgresivoRow[]>>(`${this.baseUrl}/addons`);
  }

  solicitarUsuarioPruebas(data: { nombre: string; apellido: string; email: string; telefono?: string; especialidad_id: number; mensaje?: string }): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>(`${this.baseUrl}/solicitud-demo`, data);
  }
}
