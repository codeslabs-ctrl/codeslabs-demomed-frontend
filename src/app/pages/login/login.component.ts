import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <img src="assets/LogoFemiMed.svg" alt="FemiMed Logo" class="logo-image">
            <p>Centro Médico Especializado</p>
          </div>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username" 
              placeholder="Ingresa tu usuario"
              [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
            >
            <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" class="error-message">
              El usuario es requerido
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="password-input-container">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password" 
                formControlName="password" 
                placeholder="Ingresa tu contraseña"
                [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                class="password-input"
              >
              <button 
                type="button" 
                class="password-toggle" 
                (click)="togglePasswordVisibility()"
                [title]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <span class="password-icon">{{ showPassword ? '🙈' : '👁️' }}</span>
              </button>
            </div>
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error-message">
              La contraseña es requerida
            </div>
          </div>

          <button 
            type="submit" 
            class="login-btn" 
            [disabled]="loginForm.invalid || isLoading"
            [class.loading]="isLoading"
          >
            <span *ngIf="!isLoading">Iniciar Sesión</span>
            <span *ngIf="isLoading">Iniciando...</span>
          </button>

          <div class="forgot-password-container">
            <a routerLink="/forgot-password" class="forgot-password-link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(240, 147, 251, 0.8) 0%, rgba(245, 87, 108, 0.8) 100%);
      padding: 2rem;
    }

    .login-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 3rem;
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-image {
      width: 150px;
      height: auto;
      margin-bottom: 1rem;
    }

    .logo p {
      color: #6b7280;
      margin: 0.5rem 0 0 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }

    .form-group input {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group input.error {
      border-color: #ef4444;
    }

    .password-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input {
      padding-right: 3rem;
      width: 100%;
    }

    .password-toggle {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .password-toggle:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .password-toggle:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    .password-icon {
      font-size: 1.2rem;
      user-select: none;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .login-btn {
      background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 1rem;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(233, 30, 99, 0.3);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-btn.loading {
      position: relative;
    }

    .forgot-password-container {
      text-align: center;
      margin-top: 1rem;
    }

    .forgot-password-link {
      color: #E91E63;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .forgot-password-link:hover {
      color: #C2185B;
      text-decoration: underline;
    }


    @media (max-width: 480px) {
      .login-container {
        padding: 1rem;
      }

      .login-card {
        padding: 2rem;
      }

      .logo-image {
        width: 120px;
      }

      .password-toggle {
        right: 0.5rem;
        padding: 0.5rem;
      }

      .password-icon {
        font-size: 1rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

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
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Usuario o contraseña incorrectos';
          console.error('Error de login:', error);
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
