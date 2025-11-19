export const environment = {
  production: true,
  // URL del backend en producción: api.demomed.codes-labs.com:3001
  apiUrl: 'https://api.demomed.codes-labs.com:3001/api/v1',
  // Si usas un proxy reverso que maneja el puerto, puedes usar:
  // apiUrl: 'https://api.demomed.codes-labs.com/api/v1',
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
