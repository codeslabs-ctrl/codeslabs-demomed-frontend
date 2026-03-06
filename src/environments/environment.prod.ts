export const environment = {
  production: true,
  // URL del backend en producción: usa proxy reverso (sin puerto)
  apiUrl: 'https://api.demomed.codes-labs.com/api/v1',
  /** Si es 1 o true, se muestra el acceso al Chat en el menú. Cambiar a true para habilitar. En build se puede reemplazar por variable de entorno. */
  chatMenuEnabled: false,
  /** Chatbot: '' para usar /api/chat en el mismo origen (proxy Apache al puerto 3999). */
  chatApiUrl: '',
  appName: 'DemoMed Dashboard',
  version: '1.0.0',
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  },
  dateFormat: 'es-VE',
  currency: 'VES',
  timezone: 'America/Caracas'
};
