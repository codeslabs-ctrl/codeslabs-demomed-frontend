/**
 * Configuración de despliegue - Ejemplo
 * 
 * Copia este archivo a deploy.config.js y ajusta los valores según tu servidor
 */

module.exports = {
  // Información del servidor
  host: 'tu-servidor.com',           // IP o dominio del servidor
  user: 'usuario',                   // Usuario SSH
  remotePath: '/var/www/femimed-frontend',  // Ruta en el servidor donde se copiarán los archivos
  port: 22,                          // Puerto SSH (normalmente 22)
  
  // Método de despliegue: 'scp', 'rsync', o 'ftp'
  method: 'scp',
  
  // Opciones adicionales
  options: {
    // Para rsync: excluir archivos
    exclude: [
      'node_modules',
      '.git',
      '*.log'
    ],
    
    // Para SCP: comprimir antes de enviar (más lento pero usa menos ancho de banda)
    compress: false,
    
    // Backup del directorio anterior antes de desplegar
    backup: false,
    backupPath: '/var/www/femimed-frontend-backup'
  }
};

