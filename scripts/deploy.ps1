# Script de despliegue para Windows PowerShell
# Envía los archivos compilados al servidor usando SCP

param(
    [string]$Host = $env:DEPLOY_HOST,
    [string]$User = $env:DEPLOY_USER,
    [string]$RemotePath = $env:DEPLOY_REMOTE_PATH,
    [int]$Port = 22,
    [string]$Method = "scp"
)

# Colores para la consola
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) {
    Write-ColorOutput Green "✅ $message"
}

function Write-Error-Custom($message) {
    Write-ColorOutput Red "❌ $message"
}

function Write-Info($message) {
    Write-ColorOutput Cyan "ℹ️  $message"
}

function Write-Warning-Custom($message) {
    Write-ColorOutput Yellow "⚠️  $message"
}

# Verificar valores por defecto
if (-not $Host) { $Host = "tu-servidor.com" }
if (-not $User) { $User = "usuario" }
if (-not $RemotePath) { $RemotePath = "/var/www/femimed-frontend" }

Write-Info "Iniciando despliegue..."
Write-Info "Servidor: ${User}@${Host}:${Port}"
Write-Info "Ruta remota: $RemotePath"
Write-Info "Método: $Method"

# Verificar que existe el directorio dist
$distPath = Join-Path $PSScriptRoot "..\dist\femimed-dashboard"
if (-not (Test-Path $distPath)) {
    Write-Error-Custom "No se encontró el directorio dist/femimed-dashboard"
    Write-Info "Ejecuta primero: npm run build"
    exit 1
}

# Función para desplegar con SCP (requiere PSCP de PuTTY o OpenSSH)
function Deploy-SCP {
    Write-Info "Desplegando con SCP..."
    
    # Verificar si scp está disponible
    $scpAvailable = Get-Command scp -ErrorAction SilentlyContinue
    
    if (-not $scpAvailable) {
        Write-Error-Custom "SCP no está disponible. Instala OpenSSH o PuTTY."
        Write-Info "Para instalar OpenSSH en Windows:"
        Write-Info "  Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0"
        exit 1
    }
    
    try {
        Write-Info "Enviando archivos al servidor..."
        $scpCommand = "scp -r -P $Port `"$distPath\*`" ${User}@${Host}:${RemotePath}/"
        
        Invoke-Expression $scpCommand
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Despliegue completado con SCP"
        } else {
            Write-Error-Custom "Error en el despliegue. Código de salida: $LASTEXITCODE"
            exit 1
        }
    } catch {
        Write-Error-Custom "Error en despliegue SCP: $_"
        exit 1
    }
}

# Función para desplegar con FTP
function Deploy-FTP {
    Write-Error-Custom "Despliegue con FTP no está implementado en este script."
    Write-Info "Usa SCP en su lugar."
    exit 1
}

# Ejecutar despliegue según el método
switch ($Method.ToLower()) {
    "scp" {
        Deploy-SCP
    }
    "ftp" {
        Deploy-FTP
    }
    default {
        Write-Error-Custom "Método de despliegue desconocido: $Method"
        Write-Info "Métodos disponibles: scp, ftp"
        exit 1
    }
}

Write-Success "🎉 Despliegue completado exitosamente!"

