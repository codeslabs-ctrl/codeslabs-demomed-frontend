import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConsultaService } from '../../../services/consulta.service';
import { PatientService } from '../../../services/patient.service';
import { MedicoService } from '../../../services/medico.service';
import { ConsultaWithDetails, ConsultaFilters, ConsultaFormData } from '../../../models/consulta.model';
import { Patient } from '../../../models/patient.model';
import { Medico } from '../../../services/medico.service';
import { ConsultaFormComponent } from '../../../components/consulta-form/consulta-form.component';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConsultaFormComponent],
  template: `
    <div class="consultas-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Gestión de Consultas</h1>
          <div class="header-actions">
            <button class="btn btn-primary" (click)="openAddModal()">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span class="btn-text">Nueva Consulta</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Buscar</label>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (input)="onSearch()"
              placeholder="Buscar por paciente, médico o motivo..."
              class="form-control">
          </div>
          
          <div class="filter-group">
            <label>Estado</label>
            <select [(ngModel)]="filters.estado_consulta" (change)="loadConsultas()" class="form-control">
              <option value="">Todos los estados</option>
              <option value="agendada">Agendada</option>
              <option value="por_agendar">Por Agendar</option>
              <option value="cancelada">Cancelada</option>
              <option value="finalizada">Finalizada</option>
              <option value="reagendada">Reagendada</option>
              <option value="no_asistio">No Asistió</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Prioridad</label>
            <select [(ngModel)]="filters.prioridad" (change)="loadConsultas()" class="form-control">
              <option value="">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Tipo</label>
            <select [(ngModel)]="filters.tipo_consulta" (change)="loadConsultas()" class="form-control">
              <option value="">Todos los tipos</option>
              <option value="primera_vez">Primera Vez</option>
              <option value="control">Control</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="urgencia">Urgencia</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Fecha Desde</label>
            <input 
              type="date" 
              [(ngModel)]="filters.fecha_desde" 
              (change)="loadConsultas()"
              class="form-control">
          </div>

          <div class="filter-group">
            <label>Fecha Hasta</label>
            <input 
              type="date" 
              [(ngModel)]="filters.fecha_hasta" 
              (change)="loadConsultas()"
              class="form-control">
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn btn-secondary" (click)="clearFilters()">
            Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Tabla de consultas -->
      <div class="table-section">
        <div class="table-container">
          <table class="consultas-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Motivo</th>
                <th>Fecha/Hora</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let consulta of consultas" class="consulta-row">
                <td>
                  <div class="patient-info">
                    <div class="patient-name">{{ consulta.paciente_nombre }} {{ consulta.paciente_apellidos }}</div>
                    <div class="patient-details">{{ consulta.paciente_cedula }} • {{ consulta.paciente_telefono }}</div>
                  </div>
                </td>
                <td>
                  <div class="medico-info">
                    <div class="medico-name">{{ consulta.medico_nombre }} {{ consulta.medico_apellidos }}</div>
                    <div class="especialidad">{{ consulta.especialidad_nombre }}</div>
                  </div>
                </td>
                <td>
                  <div class="motivo-consulta" [title]="consulta.motivo_consulta">
                    {{ truncateText(consulta.motivo_consulta, 50) }}
                  </div>
                </td>
                <td>
                  <div class="datetime-info">
                    <div class="fecha">{{ formatDate(consulta.fecha_pautada) }}</div>
                    <div class="hora">{{ consulta.hora_pautada }}</div>
                  </div>
                </td>
                <td>
                  <span class="estado-badge" [class]="getEstadoClass(consulta.estado_consulta)">
                    {{ getEstadoText(consulta.estado_consulta) }}
                  </span>
                </td>
                <td>
                  <span class="prioridad-badge" [class]="getPrioridadClass(consulta.prioridad)">
                    {{ getPrioridadText(consulta.prioridad) }}
                  </span>
                </td>
                <td>
                  <span class="tipo-badge">
                    {{ getTipoText(consulta.tipo_consulta) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" (click)="viewConsulta(consulta)" title="Ver detalles">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                    <button class="btn btn-sm btn-secondary" (click)="editConsulta(consulta)" title="Editar">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button 
                      *ngIf="consulta.estado_consulta === 'agendada' || consulta.estado_consulta === 'reagendada'"
                      class="btn btn-sm btn-warning" 
                      (click)="cancelConsulta(consulta)" 
                      title="Cancelar">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                    <button 
                      *ngIf="consulta.estado_consulta === 'agendada' || consulta.estado_consulta === 'reagendada'"
                      class="btn btn-sm btn-success" 
                      (click)="finalizarConsulta(consulta)" 
                      title="Finalizar">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button 
            class="btn btn-secondary" 
            [disabled]="currentPage === 1" 
            (click)="goToPage(currentPage - 1)">
            Anterior
          </button>
          <span class="page-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          <button 
            class="btn btn-secondary" 
            [disabled]="currentPage === totalPages" 
            (click)="goToPage(currentPage + 1)">
            Siguiente
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-overlay">
        <div class="loading-spinner">Cargando consultas...</div>
      </div>

      <!-- Formulario de Consulta -->
      <app-consulta-form 
        [show]="showConsultaForm"
        [consulta]="selectedConsulta"
        (closeEvent)="closeConsultaForm()"
        (saveEvent)="onConsultaSaved($event)">
      </app-consulta-form>
    </div>
  `,
  styles: [`
    .consultas-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .header-content h1 {
      color: #2C2C2C;
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      text-decoration: none;
      white-space: nowrap;
    }

    .btn-primary {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
    }

    .btn-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }

    .btn-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
    }

    .btn-warning {
      background: #fbbf24;
      color: #92400e;
    }

    .btn-warning:hover {
      background: #f59e0b;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover {
      background: #059669;
    }

    .filters-section {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      border: 1px solid #e5e7eb;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
    }

    .table-section {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #e5e7eb;
    }

    .table-container {
      overflow-x: auto;
    }

    .consultas-table {
      width: 100%;
      border-collapse: collapse;
    }

    .consultas-table th {
      background: #f8fafc;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
      font-size: 0.875rem;
    }

    .consultas-table td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }

    .consulta-row:hover {
      background: #f9fafb;
    }

    .patient-info, .medico-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .patient-name, .medico-name {
      font-weight: 600;
      color: #2C2C2C;
    }

    .patient-details, .especialidad {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .motivo-consulta {
      max-width: 200px;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .datetime-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .fecha {
      font-weight: 600;
      color: #2C2C2C;
    }

    .hora {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .estado-badge, .prioridad-badge, .tipo-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .estado-badge.agendada { background: #dbeafe; color: #1e40af; }
    .estado-badge.por_agendar { background: #fef3c7; color: #d97706; }
    .estado-badge.cancelada { background: #fee2e2; color: #dc2626; }
    .estado-badge.finalizada { background: #d1fae5; color: #059669; }
    .estado-badge.reagendada { background: #e0e7ff; color: #7c3aed; }
    .estado-badge.no_asistio { background: #f3f4f6; color: #6b7280; }

    .prioridad-badge.baja { background: #f3f4f6; color: #6b7280; }
    .prioridad-badge.normal { background: #dbeafe; color: #1e40af; }
    .prioridad-badge.alta { background: #fef3c7; color: #d97706; }
    .prioridad-badge.urgente { background: #fee2e2; color: #dc2626; }

    .tipo-badge {
      background: #f0f9ff;
      color: #0369a1;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .action-buttons .btn {
      padding: 0.375rem;
      min-width: auto;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-top: 1px solid #e5e7eb;
    }

    .page-info {
      font-weight: 600;
      color: #374151;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .loading-spinner {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      font-weight: 600;
      color: #2C2C2C;
    }

    @media (max-width: 768px) {
      .consultas-page {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class ConsultasComponent implements OnInit {
  consultas: ConsultaWithDetails[] = [];
  loading = false;
  searchQuery = '';
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  // Propiedades para el formulario
  showConsultaForm = false;
  selectedConsulta: ConsultaWithDetails | null = null;

  filters: ConsultaFilters = {
    page: 1,
    limit: 10
  };

  constructor(
    private consultaService: ConsultaService,
    private patientService: PatientService,
    private medicoService: MedicoService
  ) {}

  ngOnInit() {
    this.loadConsultas();
  }

  loadConsultas() {
    this.loading = true;
    this.filters.page = this.currentPage;
    this.filters.limit = this.itemsPerPage;

    this.consultaService.getConsultas(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.consultas = response.data;
          // Calcular total de páginas basado en la respuesta
          this.totalPages = Math.ceil(response.data.length / this.itemsPerPage);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading consultas:', error);
        this.loading = false;
      }
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.consultaService.searchConsultas(this.searchQuery).subscribe({
        next: (response) => {
          if (response.success) {
            this.consultas = response.data;
          }
        },
        error: (error) => {
          console.error('Error searching consultas:', error);
        }
      });
    } else {
      this.loadConsultas();
    }
  }

  clearFilters() {
    this.filters = {
      page: 1,
      limit: 10
    };
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadConsultas();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadConsultas();
    }
  }

  openAddModal() {
    this.selectedConsulta = null;
    this.showConsultaForm = true;
  }

  viewConsulta(consulta: ConsultaWithDetails) {
    // TODO: Implementar vista de detalles
    console.log('Ver detalles de consulta:', consulta);
  }

  editConsulta(consulta: ConsultaWithDetails) {
    this.selectedConsulta = consulta;
    this.showConsultaForm = true;
  }

  closeConsultaForm() {
    this.showConsultaForm = false;
    this.selectedConsulta = null;
  }

  onConsultaSaved(consultaData: ConsultaFormData) {
    console.log('Consulta guardada:', consultaData);
    this.loadConsultas(); // Recargar la lista
    this.closeConsultaForm();
  }

  cancelConsulta(consulta: ConsultaWithDetails) {
    const motivo = prompt('Motivo de cancelación:');
    if (motivo) {
      this.consultaService.cancelarConsulta(consulta.id, motivo).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadConsultas();
          }
        },
        error: (error) => {
          console.error('Error cancelando consulta:', error);
        }
      });
    }
  }

  finalizarConsulta(consulta: ConsultaWithDetails) {
    const diagnostico = prompt('Diagnóstico preliminar:');
    const observaciones = prompt('Observaciones:');
    
    if (diagnostico !== null) {
      this.consultaService.finalizarConsulta(consulta.id, {
        diagnostico_preliminar: diagnostico,
        observaciones: observaciones || undefined
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadConsultas();
          }
        },
        error: (error) => {
          console.error('Error finalizando consulta:', error);
        }
      });
    }
  }

  // Métodos de utilidad
  truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getEstadoClass(estado: string): string {
    return estado.toLowerCase().replace('_', '-');
  }

  getEstadoText(estado: string): string {
    const estados: { [key: string]: string } = {
      'agendada': 'Agendada',
      'por_agendar': 'Por Agendar',
      'cancelada': 'Cancelada',
      'finalizada': 'Finalizada',
      'reagendada': 'Reagendada',
      'no_asistio': 'No Asistió'
    };
    return estados[estado] || estado;
  }

  getPrioridadClass(prioridad: string): string {
    return prioridad.toLowerCase();
  }

  getPrioridadText(prioridad: string): string {
    const prioridades: { [key: string]: string } = {
      'baja': 'Baja',
      'normal': 'Normal',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return prioridades[prioridad] || prioridad;
  }

  getTipoText(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'primera_vez': 'Primera Vez',
      'control': 'Control',
      'seguimiento': 'Seguimiento',
      'urgencia': 'Urgencia'
    };
    return tipos[tipo] || tipo;
  }
}
