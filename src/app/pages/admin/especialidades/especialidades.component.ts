import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from '../../../services/especialidad.service';

export interface Especialidad {
  id?: number;
  nombre: string;
  descripcion: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  especialidadData: Especialidad = {
    nombre: '',
    descripcion: ''
  };

  constructor(private especialidadService: EspecialidadService) {}

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
        console.error('Error loading especialidades:', error);
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
      especialidad.nombre.toLowerCase().includes(this.searchName.toLowerCase()) ||
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
      nombre: '',
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
      nombre: '',
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
        console.error('Error creating especialidad:', error);
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
        console.error('Error updating especialidad:', error);
        this.saving = false;
      }
    });
  }

  deleteEspecialidad(especialidad: Especialidad) {
    if (confirm(`¿Estás seguro de que quieres eliminar la especialidad "${especialidad.nombre}"?`)) {
      this.especialidadService.deleteEspecialidad(especialidad.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadEspecialidades();
          }
        },
        error: (error) => {
          console.error('Error deleting especialidad:', error);
        }
      });
    }
  }
}
