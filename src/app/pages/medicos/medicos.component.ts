import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewsService, MedicoCompleto, MedicoEstadisticas } from '../../services/views.service';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="medicos-container">
      <div class="header">
        <h1>Médicos</h1>
        <p class="subtitle">Gestión y estadísticas de médicos</p>
      </div>

      <!-- Filtros -->
      <div class="filters">
        <div class="filter-group">
          <label for="especialidadFilter">Especialidad:</label>
          <select id="especialidadFilter" [(ngModel)]="selectedEspecialidad" (change)="applyFilters()" class="form-select">
            <option value="">Todas las especialidades</option>
            <option *ngFor="let esp of especialidades" [value]="esp.especialidad_id">
              {{ esp.nombre_especialidad }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="estadoFilter">Estado:</label>
          <select id="estadoFilter" [(ngModel)]="selectedEstado" (change)="applyFilters()" class="form-select">
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="searchInput">Buscar:</label>
          <input 
            id="searchInput" 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="applyFilters()" 
            placeholder="Buscar por nombre, cédula o email..."
            class="form-input"
          >
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando médicos...</p>
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

      <div class="content" *ngIf="medicos && !loading">
        <!-- Estadísticas generales -->
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ medicos.length }}</h3>
              <p>Total Médicos</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ getMedicosActivos() }}</h3>
              <p>Médicos Activos</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ getEspecialidadesUnicas() }}</h3>
              <p>Especialidades</p>
            </div>
          </div>
        </div>

        <!-- Lista de médicos -->
        <div class="medicos-list">
          <h2>Lista de Médicos</h2>
          <div class="medicos-grid">
            <div class="medico-card" *ngFor="let medico of medicosFiltrados">
              <div class="medico-header">
                <div class="medico-info">
                  <h3>{{ medico.nombres }} {{ medico.apellidos }}</h3>
                  <span class="especialidad">{{ medico.nombre_especialidad }}</span>
                </div>
                <div class="medico-status">
                  <span class="status-badge" [class.active]="medico.activo" [class.inactive]="!medico.activo">
                    {{ medico.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
              
              <div class="medico-details">
                <div class="detail-item">
                  <span class="detail-label">Cédula:</span>
                  <span class="detail-value">{{ medico.cedula }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ medico.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Teléfono:</span>
                  <span class="detail-value">{{ medico.telefono }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fecha de registro:</span>
                  <span class="detail-value">{{ formatDate(medico.fecha_creacion) }}</span>
                </div>
              </div>

              <div class="medico-actions">
                <button class="btn btn-secondary" (click)="viewEstadisticas(medico.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3v18h18"></path>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                  </svg>
                  Estadísticas
                </button>
                <button class="btn btn-primary" (click)="viewPacientes(medico.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Ver Pacientes
                </button>
              </div>
            </div>
          </div>

          <div class="no-results" *ngIf="medicosFiltrados.length === 0 && medicos.length > 0">
            <div class="no-results-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
            </div>
            <h3>No se encontraron médicos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .medicos-container {
      padding: 2rem;
      font-family: 'Montserrat', sans-serif;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
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

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .filter-group label {
      color: #2C2C2C;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .form-select, .form-input {
      padding: 0.75rem;
      border: 1px solid #E91E63;
      border-radius: 8px;
      background: white;
      color: #2C2C2C;
      font-family: 'Montserrat', sans-serif;
      font-size: 0.9rem;
    }

    .form-select:focus, .form-input:focus {
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

    .medicos-list h2 {
      color: #2C2C2C;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 2rem 0;
      border-bottom: 2px solid #E91E63;
      padding-bottom: 0.5rem;
    }

    .medicos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .medico-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .medico-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(44, 44, 44, 0.15);
    }

    .medico-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #F5F5F5;
    }

    .medico-info h3 {
      color: #2C2C2C;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .especialidad {
      background: linear-gradient(135deg, #EA7EC3, #2F90B0);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-badge.active {
      background: #10B981;
      color: white;
    }

    .status-badge.inactive {
      background: #EF4444;
      color: white;
    }

    .medico-details {
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #F5F5F5;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-label {
      color: #666666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .detail-value {
      color: #2C2C2C;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .medico-actions {
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

    .no-results {
      text-align: center;
      padding: 4rem 2rem;
      color: #666666;
    }

    .no-results-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      opacity: 0.5;
    }

    .no-results-icon svg {
      width: 100%;
      height: 100%;
      stroke: #666666;
    }

    .no-results h3 {
      color: #2C2C2C;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .no-results p {
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .medicos-container {
        padding: 1rem;
      }

      .header h1 {
        font-size: 2rem;
      }

      .filters {
        flex-direction: column;
        gap: 1rem;
      }

      .stats-overview {
        grid-template-columns: 1fr;
      }

      .medicos-grid {
        grid-template-columns: 1fr;
      }

      .medico-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .medico-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class MedicosComponent implements OnInit {
  medicos: MedicoCompleto[] = [];
  medicosFiltrados: MedicoCompleto[] = [];
  especialidades: any[] = [];
  loading = false;
  error: string | null = null;

  // Filtros
  selectedEspecialidad: string = '';
  selectedEstado: string = '';
  searchTerm: string = '';

  constructor(
    private viewsService: ViewsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMedicos();
    this.loadEspecialidades();
    this.loadFiltersFromRoute();
  }

  loadFiltersFromRoute() {
    this.route.queryParams.subscribe(params => {
      if (params['especialidad_id']) {
        this.selectedEspecialidad = params['especialidad_id'];
        this.applyFilters();
      }
    });
  }

  loadMedicos() {
    this.loading = true;
    this.error = null;

    this.viewsService.getMedicosCompleta({ page: 1, limit: 100 })
      .subscribe({
        next: (response) => {
          this.medicos = response.data;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar la lista de médicos';
          this.loading = false;
          console.error('Error loading medicos:', error);
        }
      });
  }

  loadEspecialidades() {
    this.viewsService.getEstadisticasEspecialidad()
      .subscribe({
        next: (response) => {
          this.especialidades = response.data;
        },
        error: (error) => {
          console.error('Error loading especialidades:', error);
        }
      });
  }

  applyFilters() {
    let filtered = [...this.medicos];

    // Filtrar por especialidad
    if (this.selectedEspecialidad) {
      filtered = filtered.filter(medico => 
        medico.especialidad_id === parseInt(this.selectedEspecialidad)
      );
    }

    // Filtrar por estado
    if (this.selectedEstado !== '') {
      const isActive = this.selectedEstado === 'true';
      filtered = filtered.filter(medico => medico.activo === isActive);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(medico => 
        medico.nombres.toLowerCase().includes(term) ||
        medico.apellidos.toLowerCase().includes(term) ||
        medico.cedula.toLowerCase().includes(term) ||
        medico.email.toLowerCase().includes(term)
      );
    }

    this.medicosFiltrados = filtered;
  }

  getMedicosActivos(): number {
    return this.medicos.filter(medico => medico.activo).length;
  }

  getEspecialidadesUnicas(): number {
    const especialidadesUnicas = new Set(this.medicos.map(medico => medico.especialidad_id));
    return especialidadesUnicas.size;
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

  viewEstadisticas(medicoId: number) {
    // Navegar a dashboard con estadísticas del médico
    this.router.navigate(['/dashboard'], { 
      queryParams: { medico_id: medicoId, view: 'medico-stats' } 
    });
  }

  viewPacientes(medicoId: number) {
    // Navegar a lista de pacientes con filtro por médico
    this.router.navigate(['/patients'], { 
      queryParams: { medico_id: medicoId } 
    });
  }
}
