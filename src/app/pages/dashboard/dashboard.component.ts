import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Dashboard FemiMed</h1>
        <p>Gestión de pacientes y consultas médicas</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ totalPatients }}</h3>
            <p>Total Pacientes</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ femalePatients }}</h3>
            <p>Pacientes Femeninas</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ malePatients }}</h3>
            <p>Pacientes Masculinos</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nuevo Paciente
        </a>
        <a routerLink="/patients" class="btn btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
          </svg>
          Ver Todos los Pacientes
        </a>
      </div>

      <div class="recent-patients" *ngIf="recentPatientsList.length > 0">
        <div class="section-divider"></div>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
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
      color: #2C2C2C;
      margin-bottom: 0.5rem;
      font-family: 'Montserrat', sans-serif;
    }

    .dashboard-header p {
      font-size: 1.1rem;
      color: #666666;
      font-family: 'Montserrat', sans-serif;
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
      background: linear-gradient(135deg, #E91E63, #C2185B);
      border-radius: 50%;
      color: white;
      box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
      transition: all 0.3s ease;
    }

    .stat-icon svg {
      width: 28px;
      height: 28px;
    }

    .stat-card:hover .stat-icon {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(233, 30, 99, 0.4);
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #2C2C2C;
      margin: 0;
      font-family: 'Montserrat', sans-serif;
    }

    .stat-content p {
      color: #666666;
      margin: 0;
      font-family: 'Montserrat', sans-serif;
    }

    .dashboard-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      font-family: 'Montserrat', sans-serif;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn svg {
      width: 18px;
      height: 18px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #E91E63, #C2185B);
      color: white;
      box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(233, 30, 99, 0.4);
    }

    .btn-secondary {
      background: #F5F5F5;
      color: #2C2C2C;
      border: 1px solid #E91E63;
    }

    .btn-secondary:hover {
      background: #E91E63;
      color: white;
      transform: translateY(-2px);
    }

    .section-divider {
      height: 3px;
      background: linear-gradient(90deg, #E91E63, #F5F5F5, #E91E63);
      margin: 2rem 0 1.5rem 0;
      border-radius: 2px;
      box-shadow: 0 2px 4px rgba(233, 30, 99, 0.2);
    }

    .recent-patients h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2C2C2C;
      margin-bottom: 1rem;
      font-family: 'Montserrat', sans-serif;
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
      color: #2C2C2C;
      margin-bottom: 0.25rem;
      font-family: 'Montserrat', sans-serif;
    }

    .patient-info p {
      color: #666666;
      font-size: 0.9rem;
      margin: 0;
      font-family: 'Montserrat', sans-serif;
    }

    .patient-email {
      color: #E91E63 !important;
    }

    .patient-actions .btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-family: 'Montserrat', sans-serif;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-sm svg {
      width: 14px;
      height: 14px;
    }

    .loading {
      text-align: center;
      padding: 2rem;
    }

    .loading p {
      margin-top: 1rem;
      color: #666666;
      font-family: 'Montserrat', sans-serif;
    }

    @media (max-width: 768px) {
      .dashboard-header h1 {
        font-size: 1.5rem;
      }

      .dashboard-header p {
        font-size: 0.9rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .stat-card {
        padding: 1rem;
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
      }

      .stat-icon {
        width: 50px;
        height: 50px;
        font-size: 2rem;
      }

      .stat-content h3 {
        font-size: 1.5rem;
      }

      .stat-content p {
        font-size: 0.8rem;
      }

      .dashboard-actions {
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .patients-grid {
        grid-template-columns: 1fr;
      }

      .patient-card {
        padding: 1rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .dashboard-header h1 {
        font-size: 1.25rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .stat-card {
        padding: 0.75rem;
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
      }

      .stat-content h3 {
        font-size: 1.25rem;
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

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load patient statistics
    this.patientService.getPatientStatistics().subscribe({
      next: (response) => {
        if (response.success) {
          this.totalPatients = response.data.total || 0;
          this.femalePatients = response.data.bySex?.Femenino || 0;
          this.malePatients = response.data.bySex?.Masculino || 0;
          this.recentPatients = response.data.recent || 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.loading = false;
      }
    });

    // Load recent patients
    this.patientService.getAllPatients({}, { page: 1, limit: 6 }).subscribe({
      next: (response) => {
        if (response.success) {
          this.recentPatientsList = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading recent patients:', error);
      }
    });
  }
}
