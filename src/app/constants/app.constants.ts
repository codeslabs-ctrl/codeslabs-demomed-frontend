export const APP_CONSTANTS = {
  // Messages
  MESSAGES: {
    LOADING: 'Cargando...',
    LOADING_PATIENTS: 'Cargando pacientes...',
    LOADING_PATIENT: 'Cargando datos del paciente...',
    LOADING_STATISTICS: 'Cargando estadísticas...',
    NO_PATIENTS: 'No se encontraron pacientes con los filtros aplicados.',
    PATIENT_NOT_FOUND: 'Paciente no encontrado',
    ERROR_LOADING: 'Error al cargar los datos',
    ERROR_SAVING: 'Error al guardar los datos',
    ERROR_DELETING: 'Error al eliminar el paciente',
    SUCCESS_SAVED: 'Paciente guardado exitosamente',
    SUCCESS_DELETED: 'Paciente eliminado exitosamente',
    CONFIRM_DELETE: '¿Estás seguro de que quieres eliminar este paciente?',
    REQUIRED_FIELD: 'Este campo es requerido',
    INVALID_EMAIL: 'El email debe ser válido',
    INVALID_AGE: 'La edad debe ser entre 0 y 120 años',
    INVALID_PHONE: 'El teléfono debe ser válido'
  },

  // Form Labels
  LABELS: {
    NOMBRES: 'Nombres',
    APELLIDOS: 'Apellidos',
    EDAD: 'Edad',
    SEXO: 'Sexo',
    EMAIL: 'Email',
    TELEFONO: 'Teléfono',
    MOTIVO_CONSULTA: 'Motivo de Consulta',
    DIAGNOSTICO: 'Diagnóstico',
    CONCLUSIONES: 'Conclusiones',
    FECHA_CREACION: 'Fecha de Creación',
    FECHA_ACTUALIZACION: 'Última Actualización',
    BUSCAR: 'Buscar por nombre',
    FILTROS: 'Filtros',
    ACCIONES: 'Acciones'
  },

  // Sex Options
  SEX_OPTIONS: [
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Masculino', label: 'Masculino' }
  ],

  // Table Headers
  TABLE_HEADERS: {
    ID: 'ID',
    NOMBRE: 'Nombre',
    EDAD: 'Edad',
    SEXO: 'Sexo',
    EMAIL: 'Email',
    TELEFONO: 'Teléfono',
    MOTIVO: 'Motivo Consulta',
    ACCIONES: 'Acciones'
  },

  // Button Labels
  BUTTONS: {
    NUEVO_PACIENTE: '➕ Nuevo Paciente',
    VER_PACIENTES: '📋 Ver Todos los Pacientes',
    VER_DETALLES: '👁️ Ver',
    EDITAR: '✏️ Editar',
    ELIMINAR: '🗑️ Eliminar',
    GUARDAR: '💾 Guardar',
    CANCELAR: '❌ Cancelar',
    LIMPIAR_FILTROS: '🗑️ Limpiar Filtros',
    ANTERIOR: '← Anterior',
    SIGUIENTE: 'Siguiente →'
  },

  // Icons
  ICONS: {
    PATIENT: '👥',
    FEMALE: '👩',
    MALE: '👨',
    RECENT: '📅',
    ADD: '➕',
    VIEW: '👁️',
    EDIT: '✏️',
    DELETE: '🗑️',
    SAVE: '💾',
    CANCEL: '❌',
    EMAIL: '📧',
    PHONE: '📞',
    CALENDAR: '📅'
  }
};
