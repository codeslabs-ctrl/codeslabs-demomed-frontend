import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Patient, PatientFilters } from '../../models/patient.model';
import { APP_CONFIG } from '../../config/app.config';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmModalComponent],
  template: `
    <div class="patients-page">
      <div class="page-header">
        <h1><i class="fas fa-users"></i> Gestión de Pacientes</h1>
        <a routerLink="/patients/new" class="btn btn-new">
          ➕ Nuevo Paciente
        </a>
      </div>

      <div class="filters-section">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Buscar por nombre</label>
            <input 
              type="text" 
              class="form-input" 
              [(ngModel)]="searchName"
              (input)="onSearchChange()"
              placeholder="Nombre del paciente">
          </div>
          <div class="form-group">
            <label class="form-label">Buscar por cédula</label>
            <input 
              type="text" 
              class="form-input" 
              [(ngModel)]="searchCedula"
              (input)="onCedulaSearchChange()"
              placeholder="V-12345678">
          </div>
          <div class="form-group">
            <label class="form-label">Sexo</label>
            <select class="form-input" [(ngModel)]="filters.sexo" (change)="applyFilters()">
              <option value="">Todos</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Edad mínima</label>
            <input 
              type="number" 
              class="form-input" 
              [(ngModel)]="filters.edad_min"
              (input)="applyFilters()"
              placeholder="Edad mínima">
          </div>
          <div class="form-group">
            <label class="form-label">Edad máxima</label>
            <input 
              type="number" 
              class="form-input" 
              [(ngModel)]="filters.edad_max"
              (input)="applyFilters()"
              placeholder="Edad máxima">
          </div>
        </div>
        <div class="filters-actions">
          <button class="btn btn-clear" (click)="clearFilters()">
            🗑️ Limpiar Filtros
          </button>
        </div>
      </div>

      <div class="patients-table" *ngIf="!loading">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Edad</th>
              <th>Sexo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Motivo Consulta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let patient of patients">
              <td>{{ patient.id }}</td>
              <td>{{ patient.nombres }} {{ patient.apellidos }}</td>
              <td>
                <span class="cedula-badge">{{ patient.cedula || 'N/A' }}</span>
              </td>
              <td>{{ patient.edad }}</td>
              <td>
                <span class="sex-badge" [class.female]="patient.sexo === 'Femenino'">
                  {{ patient.sexo }}
                </span>
              </td>
              <td>{{ patient.email }}</td>
              <td>{{ patient.telefono }}</td>
              <td>{{ patient.motivo_consulta }}</td>
              <td>
                <div class="action-buttons">
                  <a routerLink="/patients/{{ patient.id }}" class="action-btn view-btn" title="Ver detalles">
                    <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    Ver
                  </a>
                  <a routerLink="/patients/{{ patient.id }}/edit" class="action-btn edit-btn" title="Editar paciente">
                    <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Editar
                  </a>
                  <button class="action-btn delete-btn" (click)="deletePatient(patient.id)" title="Eliminar paciente">
                    <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="no-patients" *ngIf="patients.length === 0">
          <p>No se encontraron pacientes con los filtros aplicados.</p>
        </div>
      </div>

      <div class="pagination" *ngIf="pagination && pagination.pages > 1">
        <button 
          class="btn btn-clear" 
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)">
          ← Anterior
        </button>
        <span class="pagination-info">
          Página {{ currentPage }} de {{ pagination.pages }}
        </span>
        <button 
          class="btn btn-clear" 
          [disabled]="currentPage === pagination.pages"
          (click)="changePage(currentPage + 1)">
          Siguiente →
        </button>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando pacientes...</p>
      </div>
    </div>

    <!-- Modal de confirmación eliminar -->
    <app-confirm-modal 
      *ngIf="showConfirmModal"
      [show]="showConfirmModal"
      title="Eliminar Paciente"
      message="¿Estás seguro de que quieres eliminar este paciente?"
      [itemName]="patientToDelete ? patientToDelete.nombres + ' ' + patientToDelete.apellidos : ''"
      warningText="Esta acción eliminará permanentemente todos los datos del paciente, incluyendo historias médicas y archivos."
      confirmText="🗑️ Eliminar"
      cancelText="Cancelar"
      type="danger"
      (confirm)="onConfirmDelete()"
      (cancel)="onCancelDelete()">
    </app-confirm-modal>
  `,
  styles: [`
    .patients-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .filters-section {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .filters-actions {
      display: flex;
      gap: 1rem;
    }

    .patients-table {
      background: white;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .table {
      width: 100%;
      margin: 0;
    }

    .table th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #374151;
      padding: 0.75rem 0.5rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .table td {
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: middle;
      font-size: 0.8rem;
      line-height: 1.4;
    }

    .table tbody tr:nth-child(even) {
      background-color: #fafafa;
    }

    .table tbody tr:hover {
      background-color: #f0f0f0;
    }

    .table tbody tr:nth-child(even):hover {
      background-color: #e8e8e8;
    }

    .sex-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      background-color: #e5e7eb;
      color: #374151;
    }

    .sex-badge.female {
      background-color: #fce7f3;
      color: #be185d;
    }

    .cedula-badge {
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: #e0f2fe;
      color: #0369a1;
      font-family: 'Courier New', monospace;
      white-space: nowrap;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
      flex-wrap: nowrap;
      justify-content: center;
      align-items: center;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border: none;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: auto;
      justify-content: center;
      white-space: nowrap;
    }

    .action-icon {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }

    .view-btn {
      background-color: #3b82f6;
      color: white;
    }

    .view-btn:hover {
      background-color: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }

    .edit-btn {
      background-color: #f59e0b;
      color: white;
    }

    .edit-btn:hover {
      background-color: #d97706;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
    }

    .delete-btn {
      background-color: #ef4444;
      color: white;
    }

    .delete-btn:hover {
      background-color: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
    }

    .no-patients {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .pagination-info {
      color: #64748b;
      font-weight: 500;
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
      .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .table {
        font-size: 0.75rem;
      }

      .table th,
      .table td {
        padding: 0.5rem 0.25rem;
      }

      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }

      .action-btn {
        min-width: 100%;
        padding: 0.375rem 0.5rem;
        font-size: 0.7rem;
      }

      .action-icon {
        width: 10px;
        height: 10px;
      }
    }
  `]
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  loading = true;
  currentPage = 1;
  pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
  pagination: any = null;
  searchName = '';
  searchCedula = '';
  filters: PatientFilters = {};
  pageSizeOptions = APP_CONFIG.PAGINATION.PAGE_SIZE_OPTIONS;
  currentUser: User | null = null;
  
  // Modal de confirmación eliminar
  showConfirmModal: boolean = false;
  patientToDelete: Patient | null = null;

  constructor(
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener el usuario actual
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      this.loadPatients();
    });
  }

  loadPatients() {
    this.loading = true;
    
    if (!this.currentUser) {
      this.loading = false;
      return;
    }

    // Si es administrador, cargar todos los pacientes
    if (this.currentUser.rol === 'administrador') {
      this.patientService.getAllPatients(this.filters, { page: this.currentPage, limit: this.pageSize })
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.patients = response.data;
              this.pagination = response.pagination;
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading patients:', error);
            this.loading = false;
          }
        });
    } 
    // Si es médico, cargar solo sus pacientes
    else if (this.currentUser.rol === 'medico' && this.currentUser.medico_id) {
      this.patientService.getPatientsByMedico(this.currentUser.medico_id, this.currentPage, this.pageSize, this.filters)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.patients = response.data.patients;
              this.pagination = {
                page: response.data.page,
                limit: response.data.limit,
                total: response.data.total,
                pages: response.data.totalPages
              };
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading patients by medico:', error);
            this.loading = false;
          }
        });
    } else {
      this.loading = false;
    }
  }

  onSearchChange() {
    if (this.searchName.trim()) {
      this.patientService.searchPatients(this.searchName).subscribe({
        next: (response) => {
          if (response.success) {
            this.patients = response.data;
            this.pagination = null;
          }
        },
        error: (error) => {
          console.error('Error searching patients:', error);
        }
      });
    } else {
      this.loadPatients();
    }
  }

  onCedulaSearchChange() {
    if (this.searchCedula.trim()) {
      this.patientService.searchPatientsByCedula(this.searchCedula).subscribe({
        next: (response) => {
          if (response.success) {
            this.patients = response.data;
            this.pagination = null;
          }
        },
        error: (error) => {
          console.error('Error searching patients by cedula:', error);
        }
      });
    } else {
      this.loadPatients();
    }
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadPatients();
  }

  clearFilters() {
    this.filters = {};
    this.searchName = '';
    this.searchCedula = '';
    this.currentPage = 1;
    this.loadPatients();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadPatients();
  }

  deletePatient(id: number) {
    const patient = this.patients.find(p => p.id === id);
    if (patient) {
      this.patientToDelete = patient;
      this.showConfirmModal = true;
    }
  }

  onConfirmDelete() {
    if (this.patientToDelete) {
      this.patientService.deletePatient(this.patientToDelete.id!).subscribe({
        next: (response) => {
          if (response.success) {
            alert('✅ Paciente eliminado exitosamente');
            this.loadPatients();
            this.closeConfirmModal();
          } else {
            const errorMessage = (response as any).error?.message || 'Error eliminando paciente';
            alert(`❌ Error eliminando paciente:\n\n${errorMessage}\n\nPor favor, intente nuevamente.`);
          }
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          const errorMessage = error?.error?.message || error?.message || 'Error de conexión eliminando paciente';
          alert(`❌ Error eliminando paciente:\n\n${errorMessage}\n\nPor favor, verifique su conexión e intente nuevamente.`);
        }
      });
    }
  }

  onCancelDelete() {
    this.closeConfirmModal();
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.patientToDelete = null;
  }
}
