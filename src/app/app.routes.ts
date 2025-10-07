import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'patients',
    loadComponent: () => import('./pages/patients/patients.component').then(m => m.PatientsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'patients/new',
    loadComponent: () => import('./pages/patient-form/patient-form.component').then(m => m.PatientFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'patients/:id',
    loadComponent: () => import('./pages/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'patients/:id/edit',
    loadComponent: () => import('./pages/patient-form/patient-form.component').then(m => m.PatientFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/medicos',
    loadComponent: () => import('./pages/admin/medicos/medicos.component').then(m => m.MedicosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/especialidades',
    loadComponent: () => import('./pages/admin/especialidades/especialidades.component').then(m => m.EspecialidadesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/consultas',
    loadComponent: () => import('./pages/admin/consultas/consultas.component').then(m => m.ConsultasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/mensajes',
    loadComponent: () => import('./pages/admin/mensajes/mensajes.component').then(m => m.MensajesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'statistics',
    loadComponent: () => import('./pages/statistics/statistics.component').then(m => m.StatisticsComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
