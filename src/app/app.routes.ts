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
    path: 'admin/consultas/nueva',
    loadComponent: () => import('./pages/admin/nueva-consulta/nueva-consulta.component').then(m => m.NuevaConsultaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/mensajes',
    loadComponent: () => import('./pages/admin/mensajes/mensajes.component').then(m => m.MensajesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/mensajes/new',
    loadComponent: () => import('./pages/admin/mensajes/editar-mensaje/editar-mensaje.component').then(m => m.EditarMensajeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/mensajes/:id/edit',
    loadComponent: () => import('./pages/admin/mensajes/editar-mensaje/editar-mensaje.component').then(m => m.EditarMensajeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/informes-medicos',
    loadComponent: () => import('./pages/admin/informes-medicos/informe-medico-dashboard/informe-medico-dashboard.component').then(m => m.InformeMedicoDashboardComponent),
    canActivate: [authGuard]
  },
  // Rutas para administración de plantillas (DEBEN estar antes que las rutas generales)
  {
    path: 'admin/informes-medicos/plantillas',
    loadComponent: () => import('./pages/admin/informes-medicos/templates-admin/template-list.component').then(m => m.TemplateListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/informes-medicos/plantillas/nueva',
    loadComponent: () => import('./pages/admin/informes-medicos/templates-admin/template-form.component').then(m => m.TemplateFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/informes-medicos/plantillas/:id',
    loadComponent: () => import('./pages/admin/informes-medicos/templates-admin/template-detail.component').then(m => m.TemplateDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/informes-medicos/plantillas/:id/editar',
    loadComponent: () => import('./pages/admin/informes-medicos/templates-admin/template-form.component').then(m => m.TemplateFormComponent),
    canActivate: [authGuard]
  },
  // Rutas para informes médicos (después de las rutas específicas de plantillas)
  {
    path: 'admin/informes-medicos/nuevo',
    loadComponent: () => import('./pages/admin/informes-medicos/informe-medico-form/informe-medico-form.component').then(m => m.InformeMedicoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/informes-medicos/:id',
    loadComponent: () => import('./pages/admin/informes-medicos/informe-medico-detail/informe-medico-detail.component').then(m => m.InformeMedicoDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/informes-medicos/:id/editar',
    loadComponent: () => import('./pages/admin/informes-medicos/informe-medico-form/informe-medico-form.component').then(m => m.InformeMedicoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/informes-medicos/:id/firmar',
    loadComponent: () => import('./pages/admin/informes-medicos/firmar-informe/firmar-informe.component').then(m => m.FirmarInformeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/informes-medicos/:id/enviar',
    loadComponent: () => import('./pages/admin/informes-medicos/enviar-informe/enviar-informe.component').then(m => m.EnviarInformeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/informes-medicos/:id/resumen',
    loadComponent: () => import('./pages/admin/informes-medicos/informe-resumen/informe-resumen.component').then(m => m.InformeResumenComponent),
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
