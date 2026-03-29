import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { PlanesService, PlanComparativo, AddonProgresivoRow } from '../../services/planes.service';
import { EspecialidadService, Especialidad } from '../../services/especialidad.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  solicitudForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  isRateLimited = false;
  timeRemaining = 0;
  currentYear = new Date().getFullYear();
  private countdownInterval: any;

  showPlanesModal = false;
  showSolicitudModal = false;
  planes: PlanComparativo[] = [];
  addonsProgresivos: AddonProgresivoRow[] = [];
  planesLoading = false;
  solicitudSending = false;
  solicitudSuccess = '';
  solicitudError = '';
  especialidades: Especialidad[] = [];
  especialidadesLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private errorHandler: ErrorHandlerService,
    private planesService: PlanesService,
    private especialidadService: EspecialidadService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.solicitudForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      especialidad_id: [null as number | null, Validators.required],
      mensaje: ['']
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
          this.errorHandler.logError(error, 'iniciar sesión');
          this.errorMessage = this.getLoginErrorMessage(error);
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private getLoginErrorMessage(error: any): string {
    // Error de rate limiting - manejo específico para login
    if (error.status === 401 && error.error?.message && error.error.message.includes('Demasiados intentos')) {
      this.startRateLimitCountdown();
      return '🚫 Demasiados intentos de login. Debes esperar 15 minutos antes de intentar nuevamente.';
    }
    
    if (error.status === 429) {
      this.startRateLimitCountdown();
      return '🚫 Demasiados intentos de login. Debes esperar 15 minutos antes de intentar nuevamente.';
    }
    
    // Error 401 - No autorizado (sin rate limiting): credenciales inválidas
    if (error.status === 401) {
      return 'La contraseña es incorrecta.';
    }
    
    // Error 403 - Prohibido
    if (error.status === 403) {
      return '❌ Acceso denegado. Tu cuenta puede estar deshabilitada.';
    }
    
    // Para otros errores, usar el ErrorHandlerService
    return this.errorHandler.getSafeErrorMessage(error, 'iniciar sesión');
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

  openPlanesModal() {
    this.showPlanesModal = true;
    this.planesLoading = true;
    this.planes = [];
    this.addonsProgresivos = [];
    this.planesService.getPlanesComparativa().subscribe({
      next: (r) => { if (r.success && r.data) this.planes = r.data; },
      error: () => { this.planesLoading = false; },
      complete: () => { this.planesLoading = false; }
    });
    this.planesService.getAddonsProgresivos().subscribe({
      next: (r) => { if (r.success && r.data) this.addonsProgresivos = r.data; },
      error: () => { this.planesLoading = false; },
      complete: () => { this.planesLoading = false; }
    });
  }

  closePlanesModal() {
    this.showPlanesModal = false;
  }

  openSolicitudModal() {
    this.showSolicitudModal = true;
    this.solicitudForm.reset({ nombre: '', apellido: '', email: '', telefono: '', especialidad_id: null, mensaje: '' });
    this.solicitudSuccess = '';
    this.solicitudError = '';
    this.especialidades = [];
    this.especialidadesLoading = true;
    this.especialidadService.getAllEspecialidades().subscribe({
      next: (r) => { if (r.success && r.data) this.especialidades = r.data; },
      error: () => { this.especialidadesLoading = false; },
      complete: () => { this.especialidadesLoading = false; }
    });
  }

  closeSolicitudModal() {
    this.showSolicitudModal = false;
  }

  onSubmitSolicitud() {
    if (this.solicitudForm.invalid || this.solicitudSending) return;
    this.solicitudSending = true;
    this.solicitudSuccess = '';
    this.solicitudError = '';
    const v = this.solicitudForm.value;
    this.planesService.solicitarUsuarioPruebas({
      nombre: v.nombre,
      apellido: v.apellido,
      email: v.email,
      telefono: v.telefono || undefined,
      especialidad_id: Number(v.especialidad_id),
      mensaje: v.mensaje || undefined
    }).subscribe({
      next: (r) => {
        this.solicitudSending = false;
        if (r.success && r.data?.message) {
          const msg = r.data.message;
          this.solicitudSuccess = '';
          this.solicitudError = '';
          this.solicitudForm.reset();
          this.closeSolicitudModal();
          alert(msg);
        } else {
          const msg = r.error?.message || 'Error al enviar la solicitud.';
          this.solicitudError = msg;
          alert(msg);
        }
      },
      error: (err) => {
        this.solicitudSending = false;
        const msg = err?.error?.error?.message || err?.message || 'Error de conexión. Intenta de nuevo.';
        this.solicitudError = msg;
        alert(msg);
      }
    });
  }

  ngOnDestroy() {
    this.stopRateLimitCountdown();
  }
}
