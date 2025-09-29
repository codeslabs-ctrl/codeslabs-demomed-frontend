import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewsService, MedicoEstadisticas, MedicoCompleto } from '../../services/views.service';

@Component({
  selector: 'app-medico-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="medico-stats-container">
      <div class="header">
        <h2>Estadísticas de Médicos</h2>
        <div class="controls">
          <select [(ngModel)]="selectedMedicoId" (change)="onMedicoChange()" class="form-select">
            <option value="">Seleccionar médico...</option>
            <option *ngFor="let medico of medicos" [value]="medico.id">
              {{ medico.nombres }} {{ medico.apellidos }} - {{ medico.nombre_especialidad }}
            </option>
          </select>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>

      <div class="error" *ngIf="error">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <p>{{ error }}</p>
        <button (click)="loadMedicos()" class="btn btn-primary">Reintentar</button>
      </div>

      <div class="stats-content" *ngIf="estadisticas && !loading">
        <!-- Información del médico -->
        <div class="medico-info">
          <div class="medico-header">
            <h3>{{ estadisticas.medico.nombres }} {{ estadisticas.medico.apellidos }}</h3>
            <span class="especialidad">{{ estadisticas.medico.nombre_especialidad }}</span>
          </div>
          <div class="medico-details">
            <div class="detail-item">
              <span class="label">Cédula:</span>
              <span class="value">{{ estadisticas.medico.cedula }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Email:</span>
              <span class="value">{{ estadisticas.medico.email }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Teléfono:</span>
              <span class="value">{{ estadisticas.medico.telefono }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Estado:</span>
              <span class="value" [class.active]="estadisticas.medico.activo" [class.inactive]="!estadisticas.medico.activo">
                {{ estadisticas.medico.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
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
              <h3>{{ estadisticas.estadisticas.total_consultas }}</h3>
              <p>Total Consultas</p>
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
              <h3>{{ estadisticas.estadisticas.pacientes_unicos }}</h3>
              <p>Pacientes Únicos</p>
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
              <h3>{{ formatDate(estadisticas.estadisticas.primera_consulta) }}</h3>
              <p>Primera Consulta</p>
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
              <h3>{{ formatDate(estadisticas.estadisticas.ultima_consulta) }}</h3>
              <p>Última Consulta</p>
            </div>
          </div>
        </div>

        <!-- Historial reciente -->
        <div class="historial-section" *ngIf="estadisticas.historico.length > 0">
          <h3>Historial Reciente</h3>
          <div class="historial-list">
            <div class="historial-item" *ngFor="let item of estadisticas.historico.slice(0, 5)">
              <div class="historial-header">
                <span class="paciente">{{ item.nombre_paciente }}</span>
                <span class="fecha">{{ formatDate(item.fecha_consulta) }}</span>
              </div>
              <div class="historial-content">
                <p class="motivo">{{ item.motivo_consulta }}</p>
                <p class="diagnostico">{{ item.diagnostico }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .medico-stats-container {
      padding: 2rem;
      font-family: 'Montserrat', sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #E91E63;
    }

    .header h2 {
      color: #2C2C2C;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
    }

    .form-select {
      padding: 0.75rem 1rem;
      border: 1px solid #E91E63;
      border-radius: 8px;
      background: white;
      color: #2C2C2C;
      font-family: 'Montserrat', sans-serif;
      min-width: 300px;
    }

    .form-select:focus {
      outline: none;
      border-color: #C2185B;
      box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
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

    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      text-align: center;
      color: #EF4444;
    }

    .error-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }

    .error-icon svg {
      width: 100%;
      height: 100%;
      stroke: #EF4444;
    }

    .medico-info {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
    }

    .medico-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .medico-header h3 {
      color: #2C2C2C;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .especialidad {
      background: linear-gradient(135deg, #EA7EC3, #2F90B0);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .medico-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #F5F5F5;
      border-radius: 8px;
    }

    .detail-item .label {
      font-weight: 600;
      color: #666666;
    }

    .detail-item .value {
      color: #2C2C2C;
      font-weight: 500;
    }

    .detail-item .value.active {
      color: #10B981;
    }

    .detail-item .value.inactive {
      color: #EF4444;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
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

    .historial-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
    }

    .historial-section h3 {
      color: #2C2C2C;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 1.5rem 0;
      border-bottom: 2px solid #E91E63;
      padding-bottom: 0.5rem;
    }

    .historial-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .historial-item {
      padding: 1rem;
      background: #F5F5F5;
      border-radius: 8px;
      border-left: 4px solid #E91E63;
    }

    .historial-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .historial-header .paciente {
      font-weight: 600;
      color: #2C2C2C;
    }

    .historial-header .fecha {
      color: #666666;
      font-size: 0.9rem;
    }

    .historial-content .motivo {
      color: #2C2C2C;
      margin: 0 0 0.5rem 0;
      font-weight: 500;
    }

    .historial-content .diagnostico {
      color: #666666;
      margin: 0;
      font-size: 0.9rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .medico-stats-container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .form-select {
        min-width: auto;
        width: 100%;
      }

      .medico-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .medico-details {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MedicoStatsComponent implements OnInit {
  medicos: MedicoCompleto[] = [];
  estadisticas: MedicoEstadisticas | null = null;
  selectedMedicoId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(private viewsService: ViewsService) {}

  ngOnInit() {
    this.loadMedicos();
  }

  loadMedicos() {
    this.loading = true;
    this.error = null;

    this.viewsService.getMedicosCompleta({ page: 1, limit: 100 }, { activo: true })
      .subscribe({
        next: (response) => {
          this.medicos = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar la lista de médicos';
          this.loading = false;
          console.error('Error loading medicos:', error);
        }
      });
  }

  onMedicoChange() {
    if (this.selectedMedicoId) {
      this.loadEstadisticas(this.selectedMedicoId);
    } else {
      this.estadisticas = null;
    }
  }

  loadEstadisticas(medicoId: number) {
    this.loading = true;
    this.error = null;

    this.viewsService.getMedicoEstadisticas(medicoId)
      .subscribe({
        next: (response) => {
          this.estadisticas = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar las estadísticas del médico';
          this.loading = false;
          console.error('Error loading estadisticas:', error);
        }
      });
  }

  formatDate(dateString: string | null): string {
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
