import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    console.log('🔐 AuthGuard: Usuario autenticado, permitiendo acceso a:', state.url);
    return true;
  } else {
    console.log('🔐 AuthGuard: Usuario no autenticado, redirigiendo a login desde:', state.url);
    router.navigate(['/login']);
    return false;
  }
};
