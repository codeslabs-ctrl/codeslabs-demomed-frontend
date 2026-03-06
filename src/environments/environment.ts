export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api/v1',
  /** Si es 1 o true, se muestra el acceso al Chat en el menú. Si es 0 o false, no. */
  chatMenuEnabled: true,
  /** Base URL del microservicio chatbot (Deno). En desarrollo: puerto 3999. En producción dejar '' para usar /api/chat en el mismo origen. */
  chatApiUrl: 'http://localhost:3999',
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
