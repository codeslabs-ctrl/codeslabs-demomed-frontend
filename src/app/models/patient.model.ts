// Modelo para datos básicos del paciente
export interface Patient {
  id: number;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: 'Masculino' | 'Femenino' | 'Otro';
  email: string;
  telefono: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Modelo para historia médica del paciente
export interface PatientHistory {
  id: number;
  paciente_id: number;
  medico_id: number;
  motivo_consulta: string;
  diagnostico: string;
  conclusiones: string;
  plan: string;
  fecha_consulta: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Modelo para médico
export interface Medico {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  telefono: string;
  especialidad_id: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Modelo para especialidad
export interface Especialidad {
  id: number;
  nombre_especialidad: string;
  descripcion?: string;
  activa: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Modelo completo para formulario de nuevo paciente con historia
export interface NewPatientWithHistory {
  // Datos del paciente
  paciente: {
    nombres: string;
    apellidos: string;
    edad: number;
    sexo: 'Masculino' | 'Femenino' | 'Otro';
    email: string;
    telefono: string;
  };
  // Historia médica
  historia: {
    medico_id: number;
    motivo_consulta: string;
    diagnostico: string;
    conclusiones: string;
    plan: string;
    fecha_consulta: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
  error?: {
    message: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PatientFilters {
  nombres?: string;
  apellidos?: string;
  sexo?: string;
  edad_min?: number;
  edad_max?: number;
  email?: string;
}
