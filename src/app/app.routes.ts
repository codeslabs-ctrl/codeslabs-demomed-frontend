import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-enhanced/dashboard-enhanced.component').then(m => m.DashboardEnhancedComponent)
  },
  {
    path: 'patients',
    loadComponent: () => import('./pages/patients/patients.component').then(m => m.PatientsComponent)
  },
  {
    path: 'patients/new',
    loadComponent: () => import('./pages/patient-form-new/patient-form-new.component').then(m => m.PatientFormNewComponent)
  },
  {
    path: 'patients/:id',
    loadComponent: () => import('./pages/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent)
  },
  {
    path: 'patients/:id/edit',
    loadComponent: () => import('./pages/patient-form-new/patient-form-new.component').then(m => m.PatientFormNewComponent)
  },
  {
    path: 'especialidades',
    loadComponent: () => import('./pages/especialidades/especialidades.component').then(m => m.EspecialidadesComponent)
  },
  {
    path: 'medicos',
    loadComponent: () => import('./pages/medicos/medicos.component').then(m => m.MedicosComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
