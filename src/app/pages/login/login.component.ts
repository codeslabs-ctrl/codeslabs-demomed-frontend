import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  isRateLimited = false;
  timeRemaining = 0;
  private countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Si ya está autenticado, redirigir según el rol
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          console.log('🔐 Login successful, response:', response);
          this.isLoading = false;
          // Esperar un momento para que el usuario se cargue completamente
          setTimeout(() => {
            this.redirectBasedOnRole();
          }, 100);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.getErrorMessage(error);
          console.error('Error de login:', error);
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private getErrorMessage(error: any): string {
    console.log('🔍 Error details:', error);
    
    // Error de red/conexión
    if (error.status === 0) {
      return '❌ Error de conexión. Verifica que el servidor esté funcionando.';
    }
    
    // Error 401 - No autorizado
    if (error.status === 401) {
      // Verificar si es un error de rate limiting
      if (error.error?.message && error.error.message.includes('Demasiados intentos')) {
        this.startRateLimitCountdown();
        return '🚫 Demasiados intentos de login. Debes esperar 15 minutos antes de intentar nuevamente.';
      }
      return '❌ Usuario o contraseña incorrectos. Verifica tus credenciales.';
    }
    
    // Error 403 - Prohibido
    if (error.status === 403) {
      return '❌ Acceso denegado. Tu cuenta puede estar deshabilitada.';
    }
    
    // Error 429 - Too Many Requests (Rate Limiting)
    if (error.status === 429) {
      this.startRateLimitCountdown();
      return '🚫 Demasiados intentos de login. Debes esperar 15 minutos antes de intentar nuevamente.';
    }
    
    // Error 404 - No encontrado
    if (error.status === 404) {
      return '❌ Servicio no disponible. Contacta al administrador.';
    }
    
    // Error 500 - Error del servidor
    if (error.status === 500) {
      return '❌ Error interno del servidor. Intenta nuevamente más tarde.';
    }
    
    // Error 503 - Servicio no disponible
    if (error.status === 503) {
      return '❌ Servicio temporalmente no disponible. Intenta más tarde.';
    }
    
    // Error de timeout
    if (error.name === 'TimeoutError') {
      return '❌ Tiempo de espera agotado. Verifica tu conexión a internet.';
    }
    
    // Error de validación del backend
    if (error.error?.message) {
      return `❌ ${error.error.message}`;
    }
    
    // Error de validación de campos
    if (error.error?.errors) {
      const firstError = error.error.errors[0];
      return `❌ ${firstError.message || firstError.msg || 'Error de validación'}`;
    }
    
    // Error genérico con status
    if (error.status) {
      return `❌ Error del servidor (${error.status}). Intenta nuevamente.`;
    }
    
    // Error de conexión genérico
    if (error.message) {
      return `❌ ${error.message}`;
    }
    
    // Error completamente desconocido
    return '❌ Error inesperado. Verifica tu conexión e intenta nuevamente.';
  }

  private startRateLimitCountdown() {
    this.isRateLimited = true;
    this.timeRemaining = 15 * 60; // 15 minutos en segundos
    
    this.countdownInterval = setInterval(() => {
      this.timeRemaining--;
      
      if (this.timeRemaining <= 0) {
        this.isRateLimited = false;
        this.errorMessage = '';
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  private stopRateLimitCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.isRateLimited = false;
    this.timeRemaining = 0;
  }

  getFormattedTimeRemaining(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private redirectBasedOnRole() {
    const currentUser = this.authService.getCurrentUser();
    console.log('🔍 Current user for redirection:', currentUser);
    console.log('🔍 User role:', currentUser?.rol);
    console.log('🔍 Role comparison:', currentUser?.rol === 'finanzas');
    
    if (currentUser?.rol === 'finanzas') {
      console.log('✅ Redirecting to finanzas panel');
      // Redirigir directamente al panel de finanzas
      this.router.navigate(['/admin/finanzas']);
    } else {
      console.log('✅ Redirecting to general dashboard');
      // Para otros roles, ir al dashboard general
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    this.stopRateLimitCountdown();
  }
}
