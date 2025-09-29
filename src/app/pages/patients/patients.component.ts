import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient, PatientFilters } from '../../models/patient.model';
import { APP_CONFIG } from '../../config/app.config';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmationModalComponent],
  template: `
    <div class="patients-page">
      <div class="page-header">
        <h1>Gestión de Pacientes</h1>
        <a routerLink="/patients/new" class="btn btn-primary">
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
          <button class="btn btn-secondary" (click)="clearFilters()">
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
              <th>Edad</th>
              <th>Sexo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let patient of patients">
              <td>{{ patient.id }}</td>
              <td>{{ patient.nombres }} {{ patient.apellidos }}</td>
              <td>{{ patient.edad }}</td>
              <td>
                <span class="sex-badge" [class.female]="patient.sexo === 'Femenino'">
                  {{ patient.sexo }}
                </span>
              </td>
              <td>{{ patient.email }}</td>
              <td>{{ patient.telefono }}</td>
              <td>
                <span class="status-badge" [class.active]="patient.activo" [class.inactive]="!patient.activo">
                  {{ patient.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <a routerLink="/patients/{{ patient.id }}" class="btn btn-sm btn-primary">
                    👁️ Ver
                  </a>
                  <a routerLink="/patients/{{ patient.id }}/edit" class="btn btn-sm btn-secondary">
                    ✏️ Editar
                  </a>
                  <button class="btn btn-sm btn-danger" (click)="showDeleteConfirmation(patient)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
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
          class="btn btn-secondary" 
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)">
          ← Anterior
        </button>
        <span class="pagination-info">
          Página {{ currentPage }} de {{ pagination.pages }}
        </span>
        <button 
          class="btn btn-secondary" 
          [disabled]="currentPage === pagination.pages"
          (click)="changePage(currentPage + 1)">
          Siguiente →
        </button>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando pacientes...</p>
      </div>

      <!-- Modal de confirmación -->
      <app-confirmation-modal
        [isVisible]="showDeleteModal"
        [title]="'Eliminar Paciente'"
        [message]="'¿Estás seguro de que quieres eliminar este paciente? Esta acción no se puede deshacer.'"
        [confirmText]="'Eliminar Paciente'"
        [details]="selectedPatientDetails"
        [loading]="deletingPatient"
        (confirm)="confirmDelete()"
        (cancel)="cancelDelete()">
      </app-confirmation-modal>
    </div>
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
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    .table td {
      padding: 1rem 0.75rem;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: middle;
      text-align: left;
    }

    .table th:last-child,
    .table td:last-child {
      text-align: center;
      width: 220px;
    }

    .table tbody tr:hover {
      background-color: #f8fafc;
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

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: nowrap;
      justify-content: center;
      align-items: center;
      min-width: 200px;
    }

    .action-buttons .btn {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
      white-space: nowrap;
      min-width: 65px;
      text-align: center;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }

    .action-buttons .btn:hover {
      transform: translateY(-1px);
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
        font-size: 0.875rem;
      }

      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
        min-width: 150px;
      }

      .action-buttons .btn {
        min-width: 120px;
        font-size: 0.75rem;
        padding: 0.4rem 0.6rem;
      }
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
  `]
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  loading = true;
  currentPage = 1;
  pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
  pagination: any = null;
  searchName = '';
  filters: PatientFilters = {};
  pageSizeOptions = APP_CONFIG.PAGINATION.PAGE_SIZE_OPTIONS;
  
  // Modal de confirmación
  showDeleteModal = false;
  deletingPatient = false;
  selectedPatient: Patient | null = null;
  selectedPatientDetails: { label: string; value: string }[] = [];

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
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

  applyFilters() {
    this.currentPage = 1;
    this.loadPatients();
  }

  clearFilters() {
    this.filters = {};
    this.searchName = '';
    this.currentPage = 1;
    this.loadPatients();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadPatients();
  }

  showDeleteConfirmation(patient: Patient) {
    this.selectedPatient = patient;
    this.selectedPatientDetails = [
      { label: 'Nombre', value: `${patient.nombres} ${patient.apellidos}` },
      { label: 'Edad', value: `${patient.edad} años` },
      { label: 'Sexo', value: patient.sexo },
      { label: 'Email', value: patient.email }
    ];
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.selectedPatient) {
      this.deletingPatient = true;
      this.patientService.deletePatient(this.selectedPatient.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showDeleteModal = false;
            this.selectedPatient = null;
            this.selectedPatientDetails = [];
            this.loadPatients();
          }
          this.deletingPatient = false;
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          this.deletingPatient = false;
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.selectedPatient = null;
    this.selectedPatientDetails = [];
    this.deletingPatient = false;
  }
}
