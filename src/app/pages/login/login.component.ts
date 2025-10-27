import { Component, OnInit } from '@angular/core';
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
          const errorMessage = error?.error?.message || error?.message || 'Error de conexión';
          this.errorMessage = errorMessage;
          console.error('Error de login:', error);
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
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
}
