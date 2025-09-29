import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewsService, EstadisticasEspecialidad, MedicoCompleto } from '../../services/views.service';
import { SimpleChartComponent, ChartData, ChartConfig } from '../charts/simple-chart.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, SimpleChartComponent],
  template: `
    <div class="statistics-container">
      <div class="statistics-header">
        <h2>Estadísticas Médicas</h2>
        <p class="subtitle">Análisis y visualización de datos médicos</p>
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
        <button (click)="loadStatistics()" class="btn btn-primary">Reintentar</button>
      </div>

      <div class="statistics-content" *ngIf="!loading && !error">
        <!-- Gráfico de especialidades -->
        <div class="chart-section">
          <app-simple-chart 
            [data]="especialidadesChartData" 
            [config]="especialidadesChartConfig">
          </app-simple-chart>
        </div>

        <!-- Gráfico de médicos por especialidad -->
        <div class="chart-section">
          <app-simple-chart 
            [data]="medicosChartData" 
            [config]="medicosChartConfig">
          </app-simple-chart>
        </div>

        <!-- Gráfico de consultas por especialidad -->
        <div class="chart-section">
          <app-simple-chart 
            [data]="consultasChartData" 
            [config]="consultasChartConfig">
          </app-simple-chart>
        </div>

        <!-- Gráfico de pacientes por especialidad -->
        <div class="chart-section">
          <app-simple-chart 
            [data]="pacientesChartData" 
            [config]="pacientesChartConfig">
          </app-simple-chart>
        </div>

        <!-- Resumen estadístico -->
        <div class="summary-section">
          <h3>Resumen General</h3>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <div class="summary-content">
                <h4>{{ totalEspecialidades }}</h4>
                <p>Especialidades</p>
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="summary-content">
                <h4>{{ totalMedicos }}</h4>
                <p>Médicos Activos</p>
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div class="summary-content">
                <h4>{{ totalConsultas }}</h4>
                <p>Total Consultas</p>
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div class="summary-content">
                <h4>{{ totalPacientes }}</h4>
                <p>Pacientes Atendidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .statistics-container {
      padding: 2rem;
      font-family: 'Montserrat', sans-serif;
    }

    .statistics-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .statistics-header h2 {
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

    .statistics-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .chart-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
    }

    .summary-section {
      grid-column: 1 / -1;
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
    }

    .summary-section h3 {
      color: #2C2C2C;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 2rem 0;
      text-align: center;
      border-bottom: 2px solid #E91E63;
      padding-bottom: 0.5rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: #F5F5F5;
      border-radius: 12px;
      border-left: 4px solid #E91E63;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(44, 44, 44, 0.15);
    }

    .summary-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #EA7EC3, #2F90B0);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .summary-icon svg {
      width: 24px;
      height: 24px;
      stroke: white;
    }

    .summary-content h4 {
      color: #2C2C2C;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
    }

    .summary-content p {
      color: #666666;
      font-size: 0.9rem;
      margin: 0;
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

    /* Responsive */
    @media (max-width: 768px) {
      .statistics-container {
        padding: 1rem;
      }

      .statistics-header h2 {
        font-size: 2rem;
      }

      .statistics-content {
        grid-template-columns: 1fr;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  @Input() especialidadId?: number;
  @Input() medicoId?: number;

  especialidades: EstadisticasEspecialidad[] = [];
  medicos: MedicoCompleto[] = [];
  loading = false;
  error: string | null = null;

  // Datos para gráficos
  especialidadesChartData: ChartData[] = [];
  medicosChartData: ChartData[] = [];
  consultasChartData: ChartData[] = [];
  pacientesChartData: ChartData[] = [];

  // Configuración de gráficos
  especialidadesChartConfig: ChartConfig = {
    type: 'doughnut',
    title: 'Distribución por Especialidades',
    showLegend: true,
    showValues: true,
    height: 300,
    width: 400
  };

  medicosChartConfig: ChartConfig = {
    type: 'bar',
    title: 'Médicos por Especialidad',
    showLegend: false,
    showValues: true,
    height: 300,
    width: 400
  };

  consultasChartConfig: ChartConfig = {
    type: 'bar',
    title: 'Consultas por Especialidad',
    showLegend: false,
    showValues: true,
    height: 300,
    width: 400
  };

  pacientesChartConfig: ChartConfig = {
    type: 'line',
    title: 'Pacientes Atendidos por Especialidad',
    showLegend: false,
    showValues: true,
    height: 300,
    width: 400
  };

  // Totales
  totalEspecialidades = 0;
  totalMedicos = 0;
  totalConsultas = 0;
  totalPacientes = 0;

  constructor(private viewsService: ViewsService) {}

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.loading = true;
    this.error = null;

    // Cargar especialidades y médicos en paralelo
    Promise.all([
      this.viewsService.getEstadisticasEspecialidad(this.especialidadId).toPromise(),
      this.viewsService.getMedicosCompleta({ page: 1, limit: 100 }, { activo: true }).toPromise()
    ]).then(([especialidadesResponse, medicosResponse]) => {
      if (especialidadesResponse?.success) {
        this.especialidades = especialidadesResponse.data;
        this.prepareChartData();
      }

      if (medicosResponse?.success) {
        this.medicos = medicosResponse.data;
      }

      this.loading = false;
    }).catch(error => {
      this.error = 'Error al cargar las estadísticas';
      this.loading = false;
      console.error('Error loading statistics:', error);
    });
  }

  prepareChartData() {
    // Datos para gráfico de especialidades (doughnut)
    this.especialidadesChartData = this.especialidades.map((esp, index) => ({
      label: esp.nombre_especialidad,
      value: esp.total_consultas,
      color: this.getDefaultColor(index)
    }));

    // Datos para gráfico de médicos por especialidad
    this.medicosChartData = this.especialidades.map((esp, index) => ({
      label: esp.nombre_especialidad.length > 15 
        ? esp.nombre_especialidad.substring(0, 15) + '...' 
        : esp.nombre_especialidad,
      value: esp.medicos_activos,
      color: this.getDefaultColor(index)
    }));

    // Datos para gráfico de consultas por especialidad
    this.consultasChartData = this.especialidades.map((esp, index) => ({
      label: esp.nombre_especialidad.length > 15 
        ? esp.nombre_especialidad.substring(0, 15) + '...' 
        : esp.nombre_especialidad,
      value: esp.total_consultas,
      color: this.getDefaultColor(index)
    }));

    // Datos para gráfico de pacientes por especialidad
    this.pacientesChartData = this.especialidades.map((esp, index) => ({
      label: esp.nombre_especialidad.length > 15 
        ? esp.nombre_especialidad.substring(0, 15) + '...' 
        : esp.nombre_especialidad,
      value: esp.pacientes_atendidos,
      color: this.getDefaultColor(index)
    }));

    // Calcular totales
    this.totalEspecialidades = this.especialidades.length;
    this.totalMedicos = this.especialidades.reduce((sum, esp) => sum + esp.medicos_activos, 0);
    this.totalConsultas = this.especialidades.reduce((sum, esp) => sum + esp.total_consultas, 0);
    this.totalPacientes = this.especialidades.reduce((sum, esp) => sum + esp.pacientes_atendidos, 0);
  }

  getDefaultColor(index: number): string {
    const colors = [
      '#E91E63', '#2F90B0', '#EA7EC3', '#4CAF50', '#FF9800',
      '#9C27B0', '#00BCD4', '#8BC34A', '#FF5722', '#607D8B'
    ];
    return colors[index % colors.length];
  }
}
