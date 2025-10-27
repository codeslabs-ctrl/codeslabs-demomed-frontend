import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MedicoService, Medico } from '../../../../services/medico.service';
import { EspecialidadService, Especialidad } from '../../../../services/especialidad.service';
import { FirmaService } from '../../../../services/firma.service';

@Component({
  selector: 'app-editar-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-medico.component.html',
  styleUrls: ['./editar-medico.component.css']
})
export class EditarMedicoComponent implements OnInit {
  medicoData: Partial<Medico> = {
    id: 0,
    nombres: '',
    apellidos: '',
    cedula: '',
    email: '',
    telefono: '',
    especialidad_id: 0
  };

  especialidades: Especialidad[] = [];
  saving = false;
  loading = true;
  showSnackbar = false;
  snackbarMessage = '';
  snackbarType: 'success' | 'error' = 'success';
  
  // Variables para firma digital
  firmaFile: File | null = null;
  firmaPreview: string | null = null;
  uploadingFirma = false;

  constructor(
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private firmaService: FirmaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadEspecialidades();
    this.loadMedicoData();
  }

  loadMedicoData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.medicoService.getMedicoById(parseInt(id)).subscribe({
        next: (response) => {
          if (response.success) {
            this.medicoData = response.data;
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading medico:', error);
          this.showSnackbarMessage('Error cargando datos del médico', 'error');
          this.loading = false;
        }
      });
    }
  }

  loadEspecialidades() {
    this.especialidadService.getAllEspecialidades().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.especialidades = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading especialidades:', error);
        this.showSnackbarMessage('Error cargando especialidades', 'error');
      }
    });
  }

  onSubmit() {
    if (this.validateForm()) {
      this.saving = true;
      this.hideSnackbar();
      
      console.log('Datos del médico a actualizar:', this.medicoData);
      
      // Asegurar que especialidad_id sea un número y que todos los campos requeridos estén presentes
      const medicoDataToSend = {
        nombres: this.medicoData.nombres!,
        apellidos: this.medicoData.apellidos!,
        cedula: this.medicoData.cedula,
        email: this.medicoData.email!,
        telefono: this.medicoData.telefono!,
        especialidad_id: Number(this.medicoData.especialidad_id),
        firma_digital: this.medicoData.firma_digital
      };
      
      this.medicoService.updateMedico(this.medicoData.id!, medicoDataToSend).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSnackbarMessage(
              `✅ Médico ${this.medicoData.nombres} ${this.medicoData.apellidos} actualizado exitosamente.`,
              'success'
            );
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
              this.router.navigate(['/admin/medicos']);
            }, 2000);
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error updating medico:', error);
          console.error('Error details:', error.error);
          
          let errorMessage = '❌ Error al actualizar el médico. Por favor, intente nuevamente.';
          
          if (error.error && error.error.error && error.error.error.message) {
            errorMessage = `❌ ${error.error.error.message}`;
          }
          
          this.saving = false;
          this.showSnackbarMessage(errorMessage, 'error');
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.medicoData.nombres?.trim()) {
      this.showSnackbarMessage('❌ El nombre es requerido', 'error');
      return false;
    }
    if (!this.medicoData.apellidos?.trim()) {
      this.showSnackbarMessage('❌ Los apellidos son requeridos', 'error');
      return false;
    }
    if (!this.medicoData.email?.trim()) {
      this.showSnackbarMessage('❌ El email es requerido', 'error');
      return false;
    }
    if (!this.medicoData.telefono?.trim()) {
      this.showSnackbarMessage('❌ El teléfono es requerido', 'error');
      return false;
    }
    if (!this.medicoData.especialidad_id || this.medicoData.especialidad_id === 0) {
      this.showSnackbarMessage('❌ La especialidad es requerida', 'error');
      return false;
    }
    return true;
  }

  // Métodos para manejo de firma digital
  onFirmaSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.showSnackbarMessage('❌ Solo se permiten archivos de imagen', 'error');
        return;
      }
      
      // Validar tamaño (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        this.showSnackbarMessage('❌ El archivo no puede ser mayor a 2MB', 'error');
        return;
      }
      
      this.firmaFile = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.firmaPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadFirma() {
    if (!this.firmaFile || !this.medicoData.id) {
      return;
    }
    
    this.uploadingFirma = true;
    
    this.firmaService.subirFirma(this.medicoData.id, this.firmaFile).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.medicoData.firma_digital = response.data.firma_digital;
          this.showSnackbarMessage('✅ Firma digital subida exitosamente', 'success');
          this.firmaFile = null;
          this.firmaPreview = null;
        } else {
          this.showSnackbarMessage('❌ Error al subir firma digital', 'error');
        }
        this.uploadingFirma = false;
      },
      error: (error) => {
        console.error('Error uploading firma:', error);
        let errorMessage = '❌ Error al subir firma digital';
        if (error.error && error.error.error && error.error.error.message) {
          errorMessage = `❌ ${error.error.error.message}`;
        }
        this.showSnackbarMessage(errorMessage, 'error');
        this.uploadingFirma = false;
      }
    });
  }

  removeFirma() {
    this.firmaFile = null;
    this.firmaPreview = null;
  }

  volver() {
    this.router.navigate(['/admin/medicos']);
  }

  showSnackbarMessage(message: string, type: 'success' | 'error') {
    this.snackbarMessage = message;
    this.snackbarType = type;
    this.showSnackbar = true;
    
    setTimeout(() => {
      this.hideSnackbar();
    }, 5000);
  }

  hideSnackbar() {
    this.showSnackbar = false;
  }
}
