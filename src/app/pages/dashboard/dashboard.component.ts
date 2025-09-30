import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { RemisionService } from '../../services/remision.service';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <p *ngIf="currentUser?.rol === 'administrador'">Panel de administración - Todos los pacientes</p>
        <p *ngIf="currentUser?.rol === 'medico'">Mis pacientes y consultas médicas</p>
        <p *ngIf="!currentUser">Gestion de pacientes y consultas médicas</p>
        <p class="doctor-info" *ngIf="currentUser">
          <span *ngIf="currentUser.rol === 'administrador'">👑 Administrador</span>
          <span *ngIf="currentUser.rol === 'medico'">
            👨‍⚕️ Dr. {{ getDoctorFullName() }}
            <span *ngIf="currentUser.especialidad" class="specialty">- {{ currentUser.especialidad }}</span>
          </span>
        </p>
        <p class="info-note" *ngIf="currentUser?.rol === 'medico' && !currentUser?.medico_id">
          ⚠️ ID de médico no disponible - mostrando todos los pacientes
        </p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 7H16c-.8 0-1.54.5-1.85 1.26L13.5 12H11v8h2v-6h2.5l1.5 6H20zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9.5C9 8.12 7.88 7 6.5 7S4 8.12 4 9.5V15h-.5v7h4z"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ totalPatients }}</h3>
            <p>Total Pacientes</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ femalePatients }}</h3>
            <p>Pacientes Femeninas</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ malePatients }}</h3>
            <p>Pacientes Masculinos</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ recentPatients }}</h3>
            <p>Nuevos este mes</p>
          </div>
        </div>
      </div>

      <div class="dashboard-actions">
        <a routerLink="/patients/new" class="btn btn-primary">
          ➕ Nuevo Paciente
        </a>
        <a routerLink="/patients" class="btn btn-secondary">
          📋 Ver Todos los Pacientes
        </a>
      </div>

      <div class="recent-patients" *ngIf="recentPatientsList.length > 0">
        <h2>Pacientes Recientes</h2>
        <div class="patients-grid">
          <div class="patient-card" *ngFor="let patient of recentPatientsList">
            <div class="patient-info">
              <h4>{{ patient.nombres }} {{ patient.apellidos }}</h4>
              <p>{{ patient.edad }} años • {{ patient.sexo }}</p>
              <p class="patient-email">{{ patient.email }}</p>
            </div>
            <div class="patient-actions">
              <a routerLink="/patients/{{ patient.id }}" class="btn btn-sm btn-primary">
                Ver Detalles
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .dashboard-header p {
      font-size: 1.1rem;
      color: #64748b;
      margin: 0.25rem 0;
    }

    .doctor-info {
      font-weight: 600;
      color: #E91E63 !important;
      font-size: 1rem !important;
    }

    .specialty {
      font-style: italic;
      color: #666;
      font-weight: 400;
      font-size: 0.9rem;
    }

    .info-note {
      font-size: 0.85rem !important;
      color: #f59e0b !important;
      font-style: italic;
      margin-top: 0.5rem !important;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      color: white;
      margin-bottom: 1rem;
    }

    .stat-icon svg {
      width: 2rem;
      height: 2rem;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .stat-content p {
      color: #64748b;
      margin: 0;
    }

    .dashboard-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .recent-patients h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .patients-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .patient-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .patient-info h4 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .patient-info p {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }

    .patient-email {
      color: #3b82f6 !important;
    }

    .patient-actions .btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
    }

    .loading p {
      margin-top: 1rem;
      color: #64748b;
    }

    @media (max-width: 768px) {
      .dashboard-actions {
        flex-direction: column;
        align-items: center;
      }

      .patients-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalPatients = 0;
  femalePatients = 0;
  malePatients = 0;
  recentPatients = 0;
  recentPatientsList: Patient[] = [];
  loading = true;
  currentUser: User | null = null;

  constructor(
    private patientService: PatientService,
    private remisionService: RemisionService,
    private authService: AuthService
  ) {
    console.log('🏗️ Dashboard component constructor called');
  }

  ngOnInit() {
    console.log('🚀 Dashboard ngOnInit called');
    
    // Obtener el usuario actual
    this.authService.currentUser$.subscribe(user => {
      console.log('👤 Current user from auth service:', user);
      this.currentUser = user;
      this.loadDashboardData();
    });
  }

  loadDashboardData() {
    console.log('🔄 Loading dashboard data...', this.currentUser);
    console.log('👤 Current user details:', {
      rol: this.currentUser?.rol,
      medico_id: this.currentUser?.medico_id,
      username: this.currentUser?.username
    });
    this.loading = true;
    
    // Check user role and load appropriate data
    if (this.currentUser?.rol === 'administrador') {
      // Admin can see all patients using the same function with null medico_id
      console.log('👑 Loading all patients for admin using unified function');
      this.loadPatientsByMedico(null); // null = all patients
    } else if (this.currentUser?.rol === 'medico' && this.currentUser?.medico_id) {
      // Doctor can see only their patients using get_pacientes_medico function
      console.log('👨‍⚕️ Loading patients for doctor ID:', this.currentUser.medico_id);
      this.loadPatientsByMedico(this.currentUser.medico_id);
    } else {
      // Fallback: load all patients
      console.warn('⚠️ User role or medico_id not available, loading all patients');
      console.warn('⚠️ User role:', this.currentUser?.rol);
      console.warn('⚠️ Medico ID:', this.currentUser?.medico_id);
      this.loadPatientsByMedico(null); // null = all patients
    }
  }

  loadAllPatients() {
    this.patientService.getAllPatients({}, { page: 1, limit: 1000 }).subscribe({
      next: (response) => {
        console.log('✅ All patients response:', response);
        this.processPatientsData(response.data);
      },
      error: (error) => {
        console.error('❌ Error loading all patients:', error);
        this.loading = false;
      }
    });
  }

  loadPatientsByMedico(medicoId: number | null) {
    console.log('🔄 Starting loadPatientsByMedico with medicoId:', medicoId);
    console.log('🔍 MedicoId type:', typeof medicoId, 'Value:', medicoId);
    this.loading = true;
    
    // Use the specific method for statistics (gets all patients without pagination)
    this.patientService.getPatientsByMedicoForStats(medicoId).subscribe({
      next: (patients) => {
        console.log('✅ Patients for stats received:', patients);
        console.log('📊 Patients array length:', patients?.length);
        console.log('🔍 First patient (if any):', patients?.[0]);
        
        if (patients && patients.length > 0) {
          this.processPatientsData(patients);
          this.loading = false;
          if (medicoId) {
            console.log('👨‍⚕️ Loaded', patients.length, 'patients for doctor statistics');
          } else {
            console.log('👑 Loaded', patients.length, 'patients for admin statistics');
          }
        } else {
          console.log('🔄 No patients found, falling back to all patients');
          this.loadAllPatients();
        }
      },
      error: (error) => {
        console.error('❌ Error loading patients for stats:', error);
        console.log('🔄 Falling back to all patients due to error');
        this.loading = false;
        // Fallback to all patients if specific query fails
        this.loadAllPatients();
      }
    });
  }

  processPatientsData(patients: Patient[]) {
    console.log('📊 Processing patients data:', patients);
    
    // Calculate statistics
    this.totalPatients = patients.length;
    this.femalePatients = patients.filter(p => p.sexo === 'Femenino').length;
    this.malePatients = patients.filter(p => p.sexo === 'Masculino').length;
    
    // Get recent patients (last 6)
    this.recentPatientsList = patients.slice(0, 6);
    
    // Calculate recent patients (this month)
    this.calculateRecentPatients(patients);
    
    console.log('📈 Statistics calculated:', {
      total: this.totalPatients,
      female: this.femalePatients,
      male: this.malePatients,
      recent: this.recentPatients
    });
    
    this.loading = false;
    console.log('✅ Dashboard loading completed');
  }

  calculateRecentPatients(allPatients: Patient[]) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    this.recentPatients = allPatients.filter(patient => {
      if (patient.fecha_creacion) {
        const patientDate = new Date(patient.fecha_creacion);
        return patientDate.getMonth() === currentMonth && patientDate.getFullYear() === currentYear;
      }
      return false;
    }).length;
  }

  getDoctorFullName(): string {
    if (this.currentUser?.nombres && this.currentUser?.apellidos) {
      return `${this.currentUser.nombres} ${this.currentUser.apellidos}`;
    }
    // Si no hay nombres, usar el username pero formateado
    if (this.currentUser?.username) {
      return this.currentUser.username.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Médico';
  }
}
