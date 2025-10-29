import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit {
  patient: Partial<Patient> = {
    nombres: '',
    apellidos: '',
    cedula: '',
    edad: 0,
    sexo: 'Femenino',
    email: '',
    telefono: ''
  };
  isEdit = false;
  loading = false;
  patientId: number | null = null;
  showSuccessActions = false;
  patientCreated = false;
  
  // Variables para validación de email
  emailExists = false;
  emailChecked = false;
  emailValidationTimeout: any;
  
  // Variables para lógica de médico
  currentMedicoId: number | null = null;
  shouldCreateNewHistory = false;

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el médico actual del usuario autenticado
    const currentUser = this.authService.getCurrentUser();
    this.currentMedicoId = currentUser?.medico_id || null;
    console.log('🔍 Médico actual:', this.currentMedicoId);

    // Verificar si es modo edición
    this.patientId = this.route.snapshot.params['id'];
    this.isEdit = !!this.patientId;
    
    console.log('🔍 Modo edición:', this.isEdit);
    console.log('🔍 Patient ID:', this.patientId);

    if (this.isEdit && this.patientId) {
      this.loadPatient();
    }
  }

  loadPatient() {
    if (this.patientId) {
      this.loading = true;
      this.patientService.getPatientById(this.patientId).subscribe({
        next: (response) => {
          if (response.success) {
            this.patient = response.data;
          } else {
            const errorMessage = (response as any).error?.message || 'Error cargando paciente';
            alert(`❌ Error cargando paciente:\n\n${errorMessage}\n\nPor favor, recarga la página e intente nuevamente.`);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading patient:', error);
          this.loading = false;
          const errorMessage = error?.error?.message || error?.message || 'Error de conexión cargando paciente';
          alert(`❌ Error cargando paciente:\n\n${errorMessage}\n\nPor favor, verifique su conexión e intente nuevamente.`);
        }
      });
    }
  }

  onSubmit(form: any) {
    if (form.valid) {
      if (this.isEdit) {
        this.updatePatient();
      } else {
        this.createPatient();
      }
    } else {
      alert('Por favor, complete todos los campos requeridos.');
    }
  }

  createPatient() {
    this.loading = true;
    
    // Solo enviar datos básicos del paciente
    const patientData = {
      nombres: this.patient.nombres!,
      apellidos: this.patient.apellidos!,
      cedula: this.patient.cedula,
      edad: this.patient.edad!,
      sexo: this.patient.sexo!,
      email: this.patient.email!,
      telefono: this.patient.telefono!,
      activo: true // Los pacientes nuevos siempre se crean como activos
    };

    console.log('🔍 Datos del paciente a enviar:', patientData);
    
    this.patientService.createPatient(patientData)
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta del servidor:', response);
          if (response.success) {
            this.patientCreated = true;
            this.showSuccessActions = true;
            this.askForConsulta();
          } else {
            const errorMessage = (response as any).error?.message || 'Error creando paciente';
            alert(`❌ Error creando paciente:\n\n${errorMessage}\n\nPor favor, intente nuevamente.`);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating patient:', error);
          this.loading = false;
          const errorMessage = error?.error?.message || error?.message || 'Error de conexión creando paciente';
          alert(`❌ Error creando paciente:\n\n${errorMessage}\n\nPor favor, verifique su conexión e intente nuevamente.`);
        }
      });
  }

  updatePatient() {
    this.loading = true;
    
    // Solo actualizar datos básicos del paciente
    const updateData: Partial<Patient> = {
      nombres: this.patient.nombres!,
      apellidos: this.patient.apellidos!,
      cedula: this.patient.cedula,
      edad: this.patient.edad!,
      sexo: this.patient.sexo!,
      email: this.patient.email!,
      telefono: this.patient.telefono!
    };

    console.log('🔍 Datos a actualizar:', updateData);
    
    this.patientService.updatePatient(this.patientId!, updateData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('✅ Paciente actualizado exitosamente');
            this.router.navigate(['/patients']);
          } else {
            const errorMessage = (response as any).error?.message || 'Error actualizando paciente';
            alert(`❌ Error actualizando paciente:\n\n${errorMessage}\n\nPor favor, intente nuevamente.`);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating patient:', error);
          this.loading = false;
          const errorMessage = error?.error?.message || error?.message || 'Error de conexión actualizando paciente';
          alert(`❌ Error actualizando paciente:\n\n${errorMessage}\n\nPor favor, verifique su conexión e intente nuevamente.`);
        }
      });
  }

  askForConsulta() {
    const userWantsConsulta = confirm('¿Desea agendar una consulta médica para este paciente?');
    if (userWantsConsulta) {
      // Redirigir a nueva consulta con el paciente pre-seleccionado
      this.router.navigate(['/admin/nueva-consulta'], { 
        queryParams: { paciente_id: this.patientId } 
      });
    } else {
      // Redirigir a la lista de pacientes
      this.router.navigate(['/patients']);
    }
  }

  onCancel() {
    this.router.navigate(['/patients']);
  }

  // Validación de email
  validateEmail() {
    if (this.patient.email && this.patient.email.length > 0) {
      clearTimeout(this.emailValidationTimeout);
      this.emailValidationTimeout = setTimeout(() => {
        this.patientService.getPatientByEmail(this.patient.email!).subscribe({
          next: (response) => {
            this.emailExists = response.success && response.data !== null;
            this.emailChecked = true;
          },
          error: (error) => {
            console.error('Error validating email:', error);
            this.emailExists = false;
            this.emailChecked = true;
          }
        });
      }, 500);
    } else {
      this.emailExists = false;
      this.emailChecked = false;
    }
  }

  // Validación de cédula
  validateCedula() {
    if (this.patient.cedula && this.patient.cedula.length > 0) {
      // Validar formato de cédula venezolana
      const cedulaPattern = /^[VEJPG][0-9]{7,8}$/;
      if (!cedulaPattern.test(this.patient.cedula)) {
        // Marcar como inválida si no cumple el formato
        console.log('Formato de cédula inválido');
      }
    }
  }

  // Método para formatear fechas
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE');
  }
}