import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService } from '../../../services/medico.service';
import { EspecialidadService, Especialidad as EspecialidadFromService } from '../../../services/especialidad.service';

export interface Medico {
  id?: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  especialidad_id: number;
  especialidad_nombre?: string;
}

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicos.component.html',
  styleUrls: ['./medicos.component.css']
})
export class MedicosComponent implements OnInit {
  medicos: Medico[] = [];
  especialidades: EspecialidadFromService[] = [];
  filteredMedicos: Medico[] = [];
  loading = true;
  showModal = false;
  isEditing = false;
  saving = false;
  searchName = '';
  selectedEspecialidad = '';

  medicoData: Medico = {
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    especialidad_id: 0
  };

  constructor(
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService
  ) {}

  ngOnInit() {
    this.loadMedicos();
    this.loadEspecialidades();
  }

  loadMedicos() {
    this.loading = true;
    this.medicoService.getAllMedicos().subscribe({
      next: (response) => {
        if (response.success) {
          this.medicos = response.data;
          this.filteredMedicos = [...this.medicos];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading medicos:', error);
        this.loading = false;
      }
    });
  }

  loadEspecialidades() {
    this.especialidadService.getAllEspecialidades().subscribe({
      next: (response) => {
        if (response.success) {
          this.especialidades = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading especialidades:', error);
      }
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onEspecialidadChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.medicos];

    if (this.searchName.trim()) {
      filtered = filtered.filter(medico =>
        medico.nombres.toLowerCase().includes(this.searchName.toLowerCase()) ||
        medico.apellidos.toLowerCase().includes(this.searchName.toLowerCase()) ||
        medico.email.toLowerCase().includes(this.searchName.toLowerCase())
      );
    }

    if (this.selectedEspecialidad) {
      filtered = filtered.filter(medico => medico.especialidad_id === parseInt(this.selectedEspecialidad));
    }

    this.filteredMedicos = filtered;
  }

  clearFilters() {
    this.searchName = '';
    this.selectedEspecialidad = '';
    this.filteredMedicos = [...this.medicos];
  }

  openAddModal() {
    this.isEditing = false;
    this.medicoData = {
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      especialidad_id: 0
    };
    this.showModal = true;
  }

  openEditModal(medico: Medico) {
    this.isEditing = true;
    this.medicoData = { ...medico };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.medicoData = {
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      especialidad_id: 0
    };
  }

  onSubmit() {
    if (this.isEditing) {
      this.updateMedico();
    } else {
      this.createMedico();
    }
  }

  createMedico() {
    this.saving = true;
    this.medicoService.createMedico(this.medicoData).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadMedicos();
          this.closeModal();
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Error creating medico:', error);
        this.saving = false;
      }
    });
  }

  updateMedico() {
    this.saving = true;
    this.medicoService.updateMedico(this.medicoData.id!, this.medicoData).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadMedicos();
          this.closeModal();
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Error updating medico:', error);
        this.saving = false;
      }
    });
  }

  deleteMedico(medico: Medico) {
    if (confirm(`¿Estás seguro de que quieres eliminar al médico "${medico.nombres} ${medico.apellidos}"?`)) {
      this.medicoService.deleteMedico(medico.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMedicos();
          }
        },
        error: (error) => {
          console.error('Error deleting medico:', error);
        }
      });
    }
  }
}