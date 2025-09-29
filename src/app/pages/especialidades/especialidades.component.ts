import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewsService, EstadisticasEspecialidad } from '../../services/views.service';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="especialidades-container">
      <div class="header">
        <h1>Especialidades Médicas</h1>
        <p class="subtitle">Gestión y estadísticas de especialidades médicas</p>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando especialidades...</p>
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
        <button (click)="loadEspecialidades()" class="btn btn-primary">Reintentar</button>
      </div>

      <div class="content" *ngIf="especialidades && !loading">
        <!-- Estadísticas generales -->
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ especialidades.length }}</h3>
              <p>Total Especialidades</p>
            </div>
          </div>

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
              <h3>{{ getTotalMedicos() }}</h3>
              <p>Total Médicos</p>
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
              <h3>{{ getTotalConsultas() }}</h3>
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
              <h3>{{ getTotalPacientes() }}</h3>
              <p>Pacientes Atendidos</p>
            </div>
          </div>
        </div>

        <!-- Lista de especialidades -->
        <div class="especialidades-list">
          <h2>Especialidades Disponibles</h2>
          <div class="especialidades-grid">
            <div class="especialidad-card" *ngFor="let especialidad of especialidades">
              <div class="especialidad-header">
                <h3>{{ especialidad.nombre_especialidad }}</h3>
                <span class="especialidad-id">ID: {{ especialidad.especialidad_id }}</span>
              </div>
              
              <div class="especialidad-stats">
                <div class="stat-item">
                  <span class="stat-label">Consultas:</span>
                  <span class="stat-value">{{ especialidad.total_consultas }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Pacientes:</span>
                  <span class="stat-value">{{ especialidad.pacientes_atendidos }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Médicos:</span>
                  <span class="stat-value">{{ especialidad.medicos_activos }}</span>
                </div>
              </div>

              <div class="especialidad-dates" *ngIf="especialidad.primera_consulta || especialidad.ultima_consulta">
                <div class="date-item" *ngIf="especialidad.primera_consulta">
                  <span class="date-label">Primera consulta:</span>
                  <span class="date-value">{{ formatDate(especialidad.primera_consulta) }}</span>
                </div>
                <div class="date-item" *ngIf="especialidad.ultima_consulta">
                  <span class="date-label">Última consulta:</span>
                  <span class="date-value">{{ formatDate(especialidad.ultima_consulta) }}</span>
                </div>
              </div>

              <div class="especialidad-actions">
                <button class="btn btn-secondary" (click)="viewMedicos(especialidad.especialidad_id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Ver Médicos
                </button>
                <button class="btn btn-primary" (click)="viewEstadisticas(especialidad.especialidad_id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3v18h18"></path>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                  </svg>
                  Ver Estadísticas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .especialidades-container {
      padding: 2rem;
      font-family: 'Montserrat', sans-serif;
    }

    .header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .header h1 {
      color: #2C2C2C;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: #666666;
      font-size: 1.1rem;
      margin: 0;
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

    .stats-overview {
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

    .especialidades-list h2 {
      color: #2C2C2C;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 2rem 0;
      border-bottom: 2px solid #E91E63;
      padding-bottom: 0.5rem;
    }

    .especialidades-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .especialidad-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .especialidad-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(44, 44, 44, 0.15);
    }

    .especialidad-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #F5F5F5;
    }

    .especialidad-header h3 {
      color: #2C2C2C;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
    }

    .especialidad-id {
      background: #F5F5F5;
      color: #666666;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .especialidad-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 0.75rem;
      background: #F5F5F5;
      border-radius: 8px;
    }

    .stat-label {
      display: block;
      color: #666666;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      display: block;
      color: #2C2C2C;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .especialidad-dates {
      margin-bottom: 1.5rem;
    }

    .date-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #F5F5F5;
    }

    .date-item:last-child {
      border-bottom: none;
    }

    .date-label {
      color: #666666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .date-value {
      color: #2C2C2C;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .especialidad-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
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

    .btn-secondary {
      background: #F5F5F5;
      color: #2C2C2C;
      border: 1px solid #E91E63;
    }

    .btn-secondary:hover {
      background: #E91E63;
      color: white;
      transform: translateY(-1px);
    }

    .btn svg {
      width: 16px;
      height: 16px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .especialidades-container {
        padding: 1rem;
      }

      .header h1 {
        font-size: 2rem;
      }

      .stats-overview {
        grid-template-columns: 1fr;
      }

      .especialidades-grid {
        grid-template-columns: 1fr;
      }

      .especialidad-stats {
        grid-template-columns: 1fr;
      }

      .especialidad-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class EspecialidadesComponent implements OnInit {
  especialidades: EstadisticasEspecialidad[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private viewsService: ViewsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEspecialidades();
  }

  loadEspecialidades() {
    this.loading = true;
    this.error = null;

    this.viewsService.getEstadisticasEspecialidad()
      .subscribe({
        next: (response) => {
          this.especialidades = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar las especialidades';
          this.loading = false;
          console.error('Error loading especialidades:', error);
        }
      });
  }

  getTotalMedicos(): number {
    return this.especialidades.reduce((total, esp) => total + esp.medicos_activos, 0);
  }

  getTotalConsultas(): number {
    return this.especialidades.reduce((total, esp) => total + esp.total_consultas, 0);
  }

  getTotalPacientes(): number {
    return this.especialidades.reduce((total, esp) => total + esp.pacientes_atendidos, 0);
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

  viewMedicos(especialidadId: number) {
    // Navegar a la página de médicos con filtro por especialidad
    this.router.navigate(['/medicos'], { 
      queryParams: { especialidad_id: especialidadId } 
    });
  }

  viewEstadisticas(especialidadId: number) {
    // Mostrar estadísticas detalladas de la especialidad
    this.router.navigate(['/dashboard'], { 
      queryParams: { especialidad_id: especialidadId, view: 'estadisticas' } 
    });
  }
}
