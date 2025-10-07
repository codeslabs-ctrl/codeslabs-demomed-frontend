import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService } from '../../../services/medico.service';
import { EspecialidadService, Especialidad as EspecialidadFromService } from '../../../services/especialidad.service';

export interface Medico {
  id?: number;
  nombres: string;
  apellidos: string;
  cedula?: string;
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
  showSuccessMessage = false;
  successMessage = '';
  showSnackbar = false;
  snackbarMessage = '';
  snackbarType: 'success' | 'error' | 'info' | 'warning' = 'info';
  snackbarAction: (() => void) | null = null;
  snackbarActionText = '';

  medicoData: Medico = {
    nombres: '',
    apellidos: '',
    cedula: '',
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
    this.showSuccessMessage = false;
    this.hideSnackbar();
    this.resetForm();
  }

  resetForm() {
    this.medicoData = {
      nombres: '',
      apellidos: '',
      cedula: '',
      email: '',
      telefono: '',
      especialidad_id: 0
    };
  }

  showSnackbarMessage(message: string, type: 'success' | 'error' | 'info' | 'warning', action?: () => void, actionText?: string) {
    this.snackbarMessage = message;
    this.snackbarType = type;
    this.snackbarAction = action || null;
    this.snackbarActionText = actionText || '';
    this.showSnackbar = true;
    
    // Auto-hide después de 5 segundos (excepto para confirmaciones)
    if (!action) {
      setTimeout(() => {
        this.hideSnackbar();
      }, 5000);
    }
  }

  executeSnackbarAction() {
    if (this.snackbarAction) {
      this.snackbarAction();
    }
    this.hideSnackbar();
  }

  hideSnackbar() {
    this.showSnackbar = false;
    this.snackbarMessage = '';
    this.snackbarAction = null;
    this.snackbarActionText = '';
  }

  onSubmit() {
    if (this.isEditing) {
      this.updateMedico();
    } else {
      this.confirmCreateMedico();
    }
  }

  confirmCreateMedico() {
    this.showSnackbarMessage(
      `¿Crear médico ${this.medicoData.nombres} ${this.medicoData.apellidos}? Se creará usuario y enviará email.`,
      'info',
      () => this.createMedico(),
      'Confirmar'
    );
  }

  createMedico() {
    this.saving = true;
    this.hideSnackbar();
    
    console.log('Datos del médico a crear:', this.medicoData);
    console.log('Tipo de especialidad_id:', typeof this.medicoData.especialidad_id);
    console.log('Valor de especialidad_id:', this.medicoData.especialidad_id);
    
    // Asegurar que especialidad_id sea un número
    const medicoDataToSend = {
      ...this.medicoData,
      especialidad_id: Number(this.medicoData.especialidad_id)
    };
    
    console.log('Datos procesados para envío:', medicoDataToSend);
    
    this.medicoService.createMedico(medicoDataToSend).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSnackbarMessage(
            `✅ Médico ${this.medicoData.nombres} ${this.medicoData.apellidos} creado exitosamente. Email enviado.`,
            'success'
          );
          
          // Limpiar formulario
          this.resetForm();
          
          // Recargar lista de médicos
          this.loadMedicos();
          
          // Cerrar modal después de 2 segundos
          setTimeout(() => {
            this.closeModal();
          }, 2000);
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Error creating medico:', error);
        console.error('Error details:', error.error);
        console.error('Error message:', error.error?.error?.message);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        
        let errorMessage = '❌ Error al crear el médico. Por favor, intente nuevamente.';
        
        if (error.error && error.error.error && error.error.error.message) {
          errorMessage = `❌ ${error.error.error.message}`;
        }
        
        this.saving = false;
        this.showSnackbarMessage(errorMessage, 'error');
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

  deleteMedico(id: number, nombres: string, apellidos: string) {
    if (confirm(`¿Está seguro de eliminar al médico ${nombres} ${apellidos}? Esta acción no se puede deshacer.`)) {
      this.medicoService.deleteMedico(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackbarMessage(
              `Médico ${nombres} ${apellidos} eliminado exitosamente.`,
              'success'
            );
            this.loadMedicos();
          }
        },
        error: (error) => {
          console.error('Error deleting medico:', error);
          this.showSnackbarMessage(
            'Error al eliminar el médico. Por favor, intente nuevamente.',
            'error'
          );
        }
      });
    }
  }
}