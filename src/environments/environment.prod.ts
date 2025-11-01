export const environment = {
  production: true,
  // Usar ruta relativa para que Apache haga el proxy automáticamente
  apiUrl: '/api/v1',
  // O usar el dominio completo si prefieres:
  // apiUrl: 'https://femimed.codes-labs.com/api/v1',
  appName: 'FemiMed Dashboard',
  version: '1.0.0',
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  },
  dateFormat: 'es-VE',
  currency: 'VES',
  timezone: 'America/Caracas'
};
