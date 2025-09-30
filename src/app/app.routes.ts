import { Routes } from '@angular/router';

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
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'patients',
    loadComponent: () => import('./pages/patients/patients.component').then(m => m.PatientsComponent)
  },
  {
    path: 'patients/new',
    loadComponent: () => import('./pages/patient-form/patient-form.component').then(m => m.PatientFormComponent)
  },
  {
    path: 'patients/:id',
    loadComponent: () => import('./pages/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent)
  },
  {
    path: 'patients/:id/edit',
    loadComponent: () => import('./pages/patient-form/patient-form.component').then(m => m.PatientFormComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
