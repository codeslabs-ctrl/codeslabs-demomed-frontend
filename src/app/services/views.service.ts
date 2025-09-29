import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '../config/app.config';

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

// Interfaces para los datos de las vistas
export interface HistoricoFiltrado {
  id: number;
  motivo_consulta: string;
  diagnostico: string;
  conclusiones: string;
  plan: string;
  fecha_consulta: string;
  paciente_id: number;
  medico_id: number;
  nombre_paciente: string;
  nombres_paciente: string;
  apellidos_paciente: string;
  edad: number;
  sexo: string;
  email_paciente: string;
  telefono_paciente: string;
  nombre_medico: string;
  nombres_medico: string;
  apellidos_medico: string;
  cedula_medico: string;
  email_medico: string;
  telefono_medico: string;
  especialidad_id: number;
  nombre_especialidad: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface MedicoCompleto {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  telefono: string;
  especialidad_id: number;
  nombre_especialidad: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface EstadisticasEspecialidad {
  especialidad_id: number;
  nombre_especialidad: string;
  total_consultas: number;
  pacientes_atendidos: number;
  medicos_activos: number;
  primera_consulta: string;
  ultima_consulta: string;
}

export interface MedicoEstadisticas {
  medico: MedicoCompleto;
  estadisticas: {
    total_consultas: number;
    pacientes_unicos: number;
    primera_consulta: string | null;
    ultima_consulta: string | null;
  };
  historico: HistoricoFiltrado[];
}

export interface PacienteEstadisticas {
  paciente: {
    id: number;
    nombres: string;
    apellidos: string;
    edad: number;
    sexo: string;
    email: string;
    telefono: string;
    activo: boolean;
    fecha_creacion: string;
  };
  estadisticas: {
    total_consultas: number;
    medicos_unicos: number;
    especialidades_unicas: number;
    primera_consulta: string | null;
    ultima_consulta: string | null;
  };
  historial: HistoricoFiltrado[];
}

// Interfaces para filtros
export interface HistoricoFiltros {
  medico_id?: number;
  paciente_id?: number;
  especialidad_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sexo?: string;
}

export interface MedicosFiltros {
  especialidad_id?: number;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ViewsService {
  private baseUrl = `${APP_CONFIG.API_BASE_URL}/views`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene historial filtrado usando la función obtener_historico_filtrado
   * @param medicoId - ID del médico (opcional)
   * @param pacienteId - ID del paciente (opcional)
   * @returns Observable con el historial filtrado
   */
  getHistoricoFiltrado(medicoId?: number, pacienteId?: number): Observable<ApiResponse<HistoricoFiltrado[]>> {
    let params = new HttpParams();
    
    if (medicoId) {
      params = params.set('medico_id', medicoId.toString());
    }
    
    if (pacienteId) {
      params = params.set('paciente_id', pacienteId.toString());
    }

    return this.http.get<ApiResponse<HistoricoFiltrado[]>>(`${this.baseUrl}/historico-filtrado`, { params });
  }

  /**
   * Obtiene la vista completa de médicos
   * @param pagination - Información de paginación
   * @param filtros - Filtros opcionales
   * @returns Observable con la lista de médicos
   */
  getMedicosCompleta(
    pagination: { page: number, limit: number } = { page: 1, limit: 10 },
    filtros: MedicosFiltros = {}
  ): Observable<ApiResponse<MedicoCompleto[]>> {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('limit', pagination.limit.toString());

    if (filtros.especialidad_id) {
      params = params.set('especialidad_id', filtros.especialidad_id.toString());
    }

    if (filtros.activo !== undefined) {
      params = params.set('activo', filtros.activo.toString());
    }

    return this.http.get<ApiResponse<MedicoCompleto[]>>(`${this.baseUrl}/medicos-completa`, { params });
  }

  /**
   * Obtiene estadísticas por especialidad
   * @param especialidadId - ID de la especialidad (opcional)
   * @returns Observable con las estadísticas
   */
  getEstadisticasEspecialidad(especialidadId?: number): Observable<ApiResponse<EstadisticasEspecialidad[]>> {
    let params = new HttpParams();
    
    if (especialidadId) {
      params = params.set('especialidad_id', especialidadId.toString());
    }

    return this.http.get<ApiResponse<EstadisticasEspecialidad[]>>(`${this.baseUrl}/estadisticas-especialidad`, { params });
  }

  /**
   * Obtiene historial completo con filtros adicionales
   * @param pagination - Información de paginación
   * @param filtros - Filtros opcionales
   * @returns Observable con el historial completo
   */
  getHistoricoCompleto(
    pagination: { page: number, limit: number } = { page: 1, limit: 10 },
    filtros: HistoricoFiltros = {}
  ): Observable<ApiResponse<HistoricoFiltrado[]>> {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('limit', pagination.limit.toString());

    if (filtros.medico_id) {
      params = params.set('medico_id', filtros.medico_id.toString());
    }

    if (filtros.paciente_id) {
      params = params.set('paciente_id', filtros.paciente_id.toString());
    }

    if (filtros.especialidad_id) {
      params = params.set('especialidad_id', filtros.especialidad_id.toString());
    }

    if (filtros.fecha_desde) {
      params = params.set('fecha_desde', filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      params = params.set('fecha_hasta', filtros.fecha_hasta);
    }

    if (filtros.sexo) {
      params = params.set('sexo', filtros.sexo);
    }

    return this.http.get<ApiResponse<HistoricoFiltrado[]>>(`${this.baseUrl}/historico-completo`, { params });
  }

  /**
   * Obtiene estadísticas detalladas de un médico específico
   * @param medicoId - ID del médico
   * @returns Observable con las estadísticas del médico
   */
  getMedicoEstadisticas(medicoId: number): Observable<ApiResponse<MedicoEstadisticas>> {
    return this.http.get<ApiResponse<MedicoEstadisticas>>(`${this.baseUrl}/medico-estadisticas/${medicoId}`);
  }

  /**
   * Obtiene estadísticas detalladas de un paciente específico
   * @param pacienteId - ID del paciente
   * @returns Observable con las estadísticas del paciente
   */
  getPacienteEstadisticas(pacienteId: number): Observable<ApiResponse<PacienteEstadisticas>> {
    return this.http.get<ApiResponse<PacienteEstadisticas>>(`${this.baseUrl}/paciente-estadisticas/${pacienteId}`);
  }

  /**
   * Obtiene todos los pacientes de un médico específico
   * @param medicoId - ID del médico
   * @returns Observable con la lista de pacientes del médico
   */
  getPacientesDeMedico(medicoId: number): Observable<ApiResponse<HistoricoFiltrado[]>> {
    return this.getHistoricoFiltrado(medicoId);
  }

  /**
   * Obtiene el historial completo de un paciente específico
   * @param pacienteId - ID del paciente
   * @returns Observable con el historial del paciente
   */
  getHistorialDePaciente(pacienteId: number): Observable<ApiResponse<HistoricoFiltrado[]>> {
    return this.getHistoricoFiltrado(undefined, pacienteId);
  }

  /**
   * Obtiene el historial de un paciente con un médico específico
   * @param medicoId - ID del médico
   * @param pacienteId - ID del paciente
   * @returns Observable con el historial específico
   */
  getHistorialPacienteMedico(medicoId: number, pacienteId: number): Observable<ApiResponse<HistoricoFiltrado[]>> {
    return this.getHistoricoFiltrado(medicoId, pacienteId);
  }

  /**
   * Obtiene estadísticas resumidas de un médico
   * @param medicoId - ID del médico
   * @returns Observable con estadísticas resumidas
   */
  getMedicoEstadisticasResumidas(medicoId: number): Observable<ApiResponse<{
    total_consultas: number;
    pacientes_unicos: number;
    primera_consulta: string | null;
    ultima_consulta: string | null;
  }>> {
    return this.http.get<ApiResponse<MedicoEstadisticas>>(`${this.baseUrl}/medico-estadisticas/${medicoId}`).pipe(
      // Mapear solo las estadísticas
      map(response => ({
        ...response,
        data: response.data.estadisticas
      }))
    );
  }

  /**
   * Obtiene estadísticas resumidas de un paciente
   * @param pacienteId - ID del paciente
   * @returns Observable con estadísticas resumidas
   */
  getPacienteEstadisticasResumidas(pacienteId: number): Observable<ApiResponse<{
    total_consultas: number;
    medicos_unicos: number;
    especialidades_unicas: number;
    primera_consulta: string | null;
    ultima_consulta: string | null;
  }>> {
    return this.http.get<ApiResponse<PacienteEstadisticas>>(`${this.baseUrl}/paciente-estadisticas/${pacienteId}`).pipe(
      // Mapear solo las estadísticas
      map(response => ({
        ...response,
        data: response.data.estadisticas
      }))
    );
  }
}
