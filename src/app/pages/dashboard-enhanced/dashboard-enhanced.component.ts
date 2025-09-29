import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { ViewsService } from '../../services/views.service';
import { StatisticsComponent } from '../../components/statistics/statistics.component';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-dashboard-enhanced',
  standalone: true,
  imports: [CommonModule, RouterModule, StatisticsComponent],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Dashboard FemiMed</h1>
        <p>Gestión de pacientes y consultas médicas</p>
      </div>

      <!-- Navegación de pestañas -->
      <div class="dashboard-tabs">
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'overview'"
          (click)="setActiveTab('overview')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9,22 9,12 15,12 15,22"></polyline>
          </svg>
          Resumen
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'statistics'"
          (click)="setActiveTab('statistics')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"></path>
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
          </svg>
          Estadísticas
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'recent'"
          (click)="setActiveTab('recent')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Recientes
        </button>
      </div>

      <!-- Contenido de pestañas -->
      <div class="dashboard-content">
        <!-- Pestaña de Resumen -->
        <div *ngIf="activeTab === 'overview'" class="tab-content">
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
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ newThisMonth }}</h3>
                <p>Nuevos este mes</p>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="quick-actions">
            <h3>Acciones Rápidas</h3>
            <div class="actions-grid">
              <a routerLink="/patients/new" class="action-card">
                <div class="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <div class="action-content">
                  <h4>Nuevo Paciente</h4>
                  <p>Registrar nuevo paciente</p>
                </div>
              </a>
              <a routerLink="/patients" class="action-card">
                <div class="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div class="action-content">
                  <h4>Ver Pacientes</h4>
                  <p>Gestionar pacientes</p>
                </div>
              </a>
              <a routerLink="/medicos" class="action-card">
                <div class="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div class="action-content">
                  <h4>Médicos</h4>
                  <p>Ver médicos</p>
                </div>
              </a>
              <a routerLink="/especialidades" class="action-card">
                <div class="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </div>
                <div class="action-content">
                  <h4>Especialidades</h4>
                  <p>Ver especialidades</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Pestaña de Estadísticas -->
        <div *ngIf="activeTab === 'statistics'" class="tab-content">
          <app-statistics 
            [especialidadId]="selectedEspecialidadId"
            [medicoId]="selectedMedicoId">
          </app-statistics>
        </div>

        <!-- Pestaña de Pacientes Recientes -->
        <div *ngIf="activeTab === 'recent'" class="tab-content">
          <div class="recent-section">
            <h3>Pacientes Recientes</h3>
            <div class="separator"></div>
            
            <div class="loading" *ngIf="loadingPatients">
              <div class="spinner"></div>
              <p>Cargando pacientes...</p>
            </div>

            <div class="patients-list" *ngIf="!loadingPatients && recentPatients.length > 0">
              <div class="patient-item" *ngFor="let patient of recentPatients">
                <div class="patient-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div class="patient-info">
                  <h4>{{ patient.nombres }} {{ patient.apellidos }}</h4>
                  <p>{{ patient.edad }} años • {{ patient.sexo }}</p>
                  <p class="patient-date">{{ formatDate(patient.fecha_creacion) }}</p>
                </div>
                <div class="patient-actions">
                  <a [routerLink]="['/patients', patient.id]" class="btn btn-sm btn-primary">
                    Ver
                  </a>
                </div>
              </div>
            </div>

            <div class="no-patients" *ngIf="!loadingPatients && recentPatients.length === 0">
              <div class="no-patients-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h4>No hay pacientes registrados</h4>
              <p>Comienza registrando tu primer paciente</p>
              <a routerLink="/patients/new" class="btn btn-primary">
                Registrar Paciente
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      font-family: 'Montserrat', sans-serif;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: #2C2C2C;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .dashboard-header p {
      color: #666666;
      font-size: 1.1rem;
      margin: 0;
    }

    .dashboard-tabs {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #F5F5F5;
    }

    .tab-button {
      padding: 1rem 2rem;
      border: none;
      background: transparent;
      color: #666666;
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 3px solid transparent;
    }

    .tab-button:hover {
      color: #E91E63;
      background: rgba(233, 30, 99, 0.05);
    }

    .tab-button.active {
      color: #E91E63;
      border-bottom-color: #E91E63;
      background: rgba(233, 30, 99, 0.1);
    }

    .tab-button svg {
      width: 18px;
      height: 18px;
    }

    .dashboard-content {
      min-height: 500px;
    }

    .tab-content {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(44, 44, 44, 0.15);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #EA7EC3, #2F90B0);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon svg {
      width: 24px;
      height: 24px;
      stroke: white;
    }

    .stat-content h3 {
      color: #2C2C2C;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
    }

    .stat-content p {
      color: #666666;
      font-size: 0.9rem;
      margin: 0;
    }

    .quick-actions {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
    }

    .quick-actions h3 {
      color: #2C2C2C;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 1.5rem 0;
      text-align: center;
      border-bottom: 2px solid #E91E63;
      padding-bottom: 0.5rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: #F5F5F5;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .action-card:hover {
      background: white;
      border-color: #E91E63;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(44, 44, 44, 0.15);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #EA7EC3, #2F90B0);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .action-icon svg {
      width: 24px;
      height: 24px;
      stroke: white;
    }

    .action-content h4 {
      color: #2C2C2C;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
    }

    .action-content p {
      color: #666666;
      font-size: 0.9rem;
      margin: 0;
    }

    .recent-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
    }

    .recent-section h3 {
      color: #2C2C2C;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
    }

    .separator {
      height: 2px;
      background: linear-gradient(135deg, #EA7EC3, #2F90B0);
      margin-bottom: 2rem;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: #666666;
    }

    .spinner {
      border: 3px solid #F5F5F5;
      border-top: 3px solid #E91E63;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .patients-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .patient-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #F5F5F5;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .patient-item:hover {
      background: white;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
    }

    .patient-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #EA7EC3, #2F90B0);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .patient-avatar svg {
      width: 24px;
      height: 24px;
      stroke: white;
    }

    .patient-info {
      flex: 1;
    }

    .patient-info h4 {
      color: #2C2C2C;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
    }

    .patient-info p {
      color: #666666;
      font-size: 0.9rem;
      margin: 0;
    }

    .patient-date {
      color: #999999 !important;
      font-size: 0.8rem !important;
    }

    .no-patients {
      text-align: center;
      padding: 3rem 2rem;
      color: #666666;
    }

    .no-patients-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      opacity: 0.5;
    }

    .no-patients-icon svg {
      width: 100%;
      height: 100%;
      stroke: #666666;
    }

    .no-patients h4 {
      color: #2C2C2C;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .no-patients p {
      margin: 0 0 1.5rem 0;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: 'Montserrat', sans-serif;
      border: none;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: #E91E63;
      color: white;
    }

    .btn-primary:hover {
      background: #C2185B;
      transform: translateY(-1px);
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard {
        padding: 1rem;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }

      .dashboard-tabs {
        flex-direction: column;
        gap: 0.5rem;
      }

      .tab-button {
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .patient-item {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class DashboardEnhancedComponent implements OnInit {
  activeTab = 'overview';
  totalPatients = 0;
  femalePatients = 0;
  malePatients = 0;
  newThisMonth = 0;
  recentPatients: Patient[] = [];
  loadingPatients = false;
  selectedEspecialidadId?: number;
  selectedMedicoId?: number;

  constructor(
    private patientService: PatientService,
    private viewsService: ViewsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadRecentPatients();
    this.loadQueryParams();
  }

  loadQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['especialidad_id']) {
        this.selectedEspecialidadId = parseInt(params['especialidad_id']);
        this.activeTab = 'statistics';
      }
      if (params['medico_id']) {
        this.selectedMedicoId = parseInt(params['medico_id']);
        this.activeTab = 'statistics';
      }
      if (params['view']) {
        this.activeTab = 'statistics';
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  loadDashboardData() {
    this.patientService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.totalPatients = response.data.total;
          this.femalePatients = response.data.bySex.Femenino || 0;
          this.malePatients = response.data.bySex.Masculino || 0;
          this.newThisMonth = response.data.newThisMonth || 0;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  loadRecentPatients() {
    this.loadingPatients = true;
    this.patientService.getPatients(1, 5).subscribe({
      next: (response) => {
        if (response.success) {
          this.recentPatients = response.data;
        }
        this.loadingPatients = false;
      },
      error: (error) => {
        console.error('Error loading recent patients:', error);
        this.loadingPatients = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }
}
