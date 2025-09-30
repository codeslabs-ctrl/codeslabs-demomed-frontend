import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '../config/app.config';
import { ApiResponse } from '../models/patient.model';

export interface Medico {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad: string;
  email: string;
  telefono: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private baseUrl = `${APP_CONFIG.API_BASE_URL}/medicos`;

  constructor(private http: HttpClient) {}

  getMedicoById(id: number): Observable<Medico | null> {
    return this.http.get<ApiResponse<Medico>>(`${this.baseUrl}/${id}`).pipe(
      map(response => response.success ? response.data : null)
    );
  }

  getAllMedicos(): Observable<Medico[]> {
    return this.http.get<ApiResponse<Medico[]>>(this.baseUrl).pipe(
      map(response => response.success ? response.data : [])
    );
  }
}
