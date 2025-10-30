import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspecialidadService, Especialidad } from '../../../services/especialidad.service';
import { ErrorHandlerService } from '../../../services/error-handler.service';
import { ConfirmModalComponent } from '../../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.css']
})
export class EspecialidadesComponent implements OnInit {
  especialidades: Especialidad[] = [];
  filteredEspecialidades: Especialidad[] = [];
  loading = true;
  showModal = false;
  isEditing = false;
  saving = false;
  searchName = '';
  
  // Modal de confirmación eliminar
  showConfirmModal: boolean = false;
  especialidadToDelete: Especialidad | null = null;

  especialidadData: Especialidad = {
    nombre_especialidad: '',
    descripcion: ''
  };

  constructor(
    private especialidadService: EspecialidadService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.loadEspecialidades();
  }

  loadEspecialidades() {
    this.loading = true;
    this.especialidadService.getAllEspecialidades().subscribe({
      next: (response) => {
        if (response.success) {
          this.especialidades = response.data;
          this.filteredEspecialidades = [...this.especialidades];
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorHandler.logError(error, 'cargar especialidades');
        this.loading = false;
      }
    });
  }

  onSearchChange() {
    if (!this.searchName.trim()) {
      this.filteredEspecialidades = [...this.especialidades];
      return;
    }

    this.filteredEspecialidades = this.especialidades.filter(especialidad =>
      especialidad.nombre_especialidad.toLowerCase().includes(this.searchName.toLowerCase()) ||
      especialidad.descripcion.toLowerCase().includes(this.searchName.toLowerCase())
    );
  }

  clearFilters() {
    this.searchName = '';
    this.filteredEspecialidades = [...this.especialidades];
  }

  openAddModal() {
    this.isEditing = false;
    this.especialidadData = {
      nombre_especialidad: '',
      descripcion: ''
    };
    this.showModal = true;
  }

  openEditModal(especialidad: Especialidad) {
    this.isEditing = true;
    this.especialidadData = { ...especialidad };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.especialidadData = {
      nombre_especialidad: '',
      descripcion: ''
    };
  }

  onSubmit() {
    if (this.isEditing) {
      this.updateEspecialidad();
    } else {
      this.createEspecialidad();
    }
  }

  createEspecialidad() {
    this.saving = true;
    this.especialidadService.createEspecialidad(this.especialidadData).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadEspecialidades();
          this.closeModal();
        }
        this.saving = false;
      },
      error: (error) => {
        this.errorHandler.logError(error, 'crear especialidad');
        this.saving = false;
      }
    });
  }

  updateEspecialidad() {
    this.saving = true;
    this.especialidadService.updateEspecialidad(this.especialidadData.id!, this.especialidadData).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadEspecialidades();
          this.closeModal();
        }
        this.saving = false;
      },
      error: (error) => {
        this.errorHandler.logError(error, 'actualizar especialidad');
        this.saving = false;
      }
    });
  }

  deleteEspecialidad(especialidad: Especialidad) {
    this.especialidadToDelete = especialidad;
    this.showConfirmModal = true;
  }

  onConfirmDelete() {
    if (this.especialidadToDelete) {
      this.especialidadService.deleteEspecialidad(this.especialidadToDelete.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadEspecialidades();
            this.closeConfirmModal();
          }
        },
        error: (error) => {
          this.errorHandler.logError(error, 'eliminar especialidad');
        }
      });
    }
  }

  onCancelDelete() {
    this.closeConfirmModal();
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.especialidadToDelete = null;
  }
}
