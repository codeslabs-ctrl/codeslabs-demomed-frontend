import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
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
  loadingPatientData = false;

  // Variables para validación de email
  emailExists = false;
  emailChecked = false;
  emailValidationTimeout: any;
  
  // Variables para validación de cédula
  cedulaExists = false;
  cedulaChecked = false;
  cedulaValidationTimeout: any;
  
  // Variables para lógica de médico
  currentMedicoId: number | null = null;
  shouldCreateNewHistory = false;

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private errorHandler: ErrorHandlerService
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
          this.errorHandler.logError(error, 'cargar paciente');
          this.loading = false;
          const errorMessage = this.errorHandler.getSafeErrorMessage(error, 'cargar paciente');
          alert(errorMessage);
        }
      });
    }
  }

  onSubmit(form: any) {
    // Verificar validaciones adicionales
    if (this.emailExists && this.emailChecked) {
      alert('❌ Error: El email ya está registrado en el sistema.');
      return;
    }
    
    if (this.cedulaExists && this.cedulaChecked) {
      alert('❌ Error: La cédula ya está registrada en el sistema.');
      return;
    }
    
    if (form.valid) {
      if (this.isEdit) {
        this.updatePatient();
      } else {
        this.createPatient();
      }
    } else {
      alert('Por favor, complete todos los campos requeridos correctamente.');
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
            const newPatientId = (response.data as any)?.id;
            console.log('🔍 ID del paciente obtenido:', newPatientId);
            if (newPatientId) {
              this.patientId = newPatientId;
              this.loading = false;
              this.loadingPatientData = true;
              this.patientService.getPatientById(newPatientId).subscribe({
                next: (loadRes) => {
                  this.loadingPatientData = false;
                  if (loadRes.success && loadRes.data) {
                    this.patient = loadRes.data;
                    this.patientCreated = true;
                    this.showSuccessActions = true;
                  } else {
                    this.patientCreated = true;
                    this.showSuccessActions = true;
                  }
                },
                error: () => {
                  this.loadingPatientData = false;
                  this.patientCreated = true;
                  this.showSuccessActions = true;
                }
              });
            } else {
              this.patientCreated = true;
              this.showSuccessActions = true;
              this.loading = false;
            }
          } else {
            const errorMessage = (response as any).error?.message || 'Error creando paciente';
            alert(`❌ Error creando paciente:\n\n${errorMessage}\n\nPor favor, intente nuevamente.`);
            this.loading = false;
          }
        },
        error: (error) => {
          this.errorHandler.logError(error, 'crear paciente');
          this.loading = false;
          
          // Manejar errores específicos del backend
          let errorMessage = 'Error de conexión creando paciente';
          
          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          // Mostrar mensaje específico para duplicados
          if (errorMessage.includes('email ya está registrado') || errorMessage.includes('Email ya está registrado')) {
            this.emailExists = true;
            this.emailChecked = true;
            alert('❌ Error: El email ya está registrado en el sistema.');
          } else if (errorMessage.includes('cédula ya está registrada') || errorMessage.includes('Cédula ya está registrada')) {
            this.cedulaExists = true;
            this.cedulaChecked = true;
            alert('❌ Error: La cédula ya está registrada en el sistema.');
          } else {
            const safeErrorMessage = this.errorHandler.getSafeErrorMessage(error, 'crear paciente');
            alert(safeErrorMessage);
          }
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
          this.loading = false;
          
          if (response.success) {
            alert('✅ Paciente actualizado exitosamente');
            this.router.navigate(['/patients']);
          } else {
            // Error en la respuesta pero no es excepción HTTP
            const errorMessage = (response as any).error?.message || 'Error actualizando paciente';
            alert(`❌ Error actualizando paciente:\n\n${errorMessage}\n\nPor favor, verifica los datos e intenta nuevamente.`);
            // NO redirigir, mantener al usuario en la página para que corrija
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorHandler.logError(error, 'actualizar paciente');
          
          // Verificar si es un error de autenticación real (solo si el interceptor no lo manejó)
          const status = error?.status || error?.error?.status;
          
          if (status === 401 || status === 403) {
            // Verificar si es realmente un error de autenticación o de validación
            const errorMessage = error?.error?.message || error?.message || '';
            const isValidationError = this.isValidationErrorMessage(errorMessage);
            
            if (isValidationError) {
              // Es un error de validación que devolvió 401/403 incorrectamente
              console.log('⚠️ Error parece ser de validación, no de autenticación');
              const validationMessage = this.extractValidationMessage(errorMessage);
              alert(`❌ Error de validación:\n\n${validationMessage}\n\nPor favor, corrige los datos e intenta nuevamente.`);
              // NO redirigir, mantener al usuario en la página
            } else {
              // Es un error de autenticación real, el interceptor ya debería haberlo manejado
              // Pero si llegamos aquí, mostrar mensaje y dejar que el interceptor maneje el logout
              console.log('🔐 Error de autenticación detectado en componente');
              alert('❌ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
              // El interceptor se encargará de redirigir al login
            }
          } else if (status === 400 || status === 422) {
            // Error de validación explícito
            const validationMessage = this.extractValidationMessage(error?.error?.message || error?.message || '');
            alert(`❌ Error de validación:\n\n${validationMessage}\n\nPor favor, corrige los datos e intenta nuevamente.`);
            // NO redirigir, mantener al usuario en la página
          } else if (status >= 500) {
            // Error del servidor
            alert('❌ Error del servidor. Por favor, intenta nuevamente en unos momentos.\n\nSi el problema persiste, contacta al administrador del sistema.');
            // NO redirigir, mantener al usuario en la página
          } else if (status === 0) {
            // Error de red
            alert('❌ Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.');
            // NO redirigir, mantener al usuario en la página
          } else {
            // Otro tipo de error
            const errorMessage = this.errorHandler.getSafeErrorMessage(error, 'actualizar paciente');
            alert(`❌ Error actualizando paciente:\n\n${errorMessage}\n\nPor favor, intenta nuevamente.`);
            // NO redirigir, mantener al usuario en la página
          }
        }
      });
  }

  /**
   * Verifica si un mensaje de error indica un problema de validación
   */
  private isValidationErrorMessage(message: string): boolean {
    if (!message) return false;
    
    const validationKeywords = [
      'email',
      'cedula',
      'duplicate',
      'ya existe',
      'validation',
      'validación',
      'requerido',
      'required',
      'inválido',
      'invalid',
      'formato',
      'format',
      'vacío',
      'empty',
      'longitud',
      'length'
    ];
    
    const lowerMessage = message.toLowerCase();
    return validationKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Extrae un mensaje de validación más claro del error
   */
  private extractValidationMessage(errorMessage: string): string {
    if (!errorMessage) {
      return 'Los datos proporcionados no son válidos.';
    }
    
    // Mensajes comunes y sus traducciones más claras
    const messageMap: Record<string, string> = {
      'email': 'El email ya está registrado en el sistema.',
      'cedula': 'La cédula ya está registrada en el sistema.',
      'duplicate': 'Ya existe un registro con estos datos.',
      'ya existe': 'Ya existe un registro con estos datos.',
      'requerido': 'Por favor, completa todos los campos requeridos.',
      'required': 'Por favor, completa todos los campos requeridos.',
      'inválido': 'Los datos proporcionados no son válidos.',
      'invalid': 'Los datos proporcionados no son válidos.'
    };
    
    // Buscar coincidencias en el mensaje
    for (const [key, value] of Object.entries(messageMap)) {
      if (errorMessage.toLowerCase().includes(key)) {
        return value;
      }
    }
    
    // Si no hay coincidencia, devolver el mensaje original (sanitizado)
    return errorMessage.length > 200 
      ? errorMessage.substring(0, 200) + '...' 
      : errorMessage;
  }

  askForConsulta(patientId?: number | null) {
    const patientName = `${this.patient.nombres} ${this.patient.apellidos}`.trim();
    const message = `✅ Paciente registrado exitosamente.\n\n` +
                   `Paciente: ${patientName || 'Nuevo paciente'}\n\n` +
                   `¿Desea agendar una consulta médica ahora?\n\n` +
                   `• Aceptar: Será redirigido al formulario de nueva consulta\n` +
                   `• Cancelar: Volverá a la lista de pacientes`;
    
    console.log('🔍 Llamando a askForConsulta con patientId:', patientId);
    console.log('🔍 this.patientId:', this.patientId);
    
    const userWantsConsulta = confirm(message);
    console.log('🔍 Usuario quiere consulta:', userWantsConsulta);
    
    if (userWantsConsulta) {
      // Redirigir a nueva consulta con el paciente pre-seleccionado
      const idToUse = patientId || this.patientId;
      console.log('🔍 ID a usar para nueva consulta:', idToUse);
      
      if (idToUse) {
        console.log('📍 Redirigiendo a /admin/consultas/nueva con paciente_id:', idToUse);
        this.router.navigate(['/admin/consultas/nueva'], { 
          queryParams: { paciente_id: idToUse } 
        }).then(() => {
          console.log('✅ Navegación completada a nueva consulta');
        }).catch((error) => {
          console.error('❌ Error en navegación:', error);
        });
      } else {
        console.log('⚠️ No hay ID, redirigiendo a nueva consulta sin pre-seleccionar');
        this.router.navigate(['/admin/consultas/nueva']).then(() => {
          console.log('✅ Navegación completada a nueva consulta (sin ID)');
        }).catch((error) => {
          console.error('❌ Error en navegación:', error);
        });
      }
    } else {
      this.askForAntecedentes(patientId || this.patientId);
    }
  }

  askForAntecedentes(patientId?: number | null) {
    if (!patientId) {
      this.router.navigate(['/patients']);
      return;
    }
    const wantsAntecedentes = confirm(
      '¿Desea cargar los antecedentes del paciente ahora?\n\n' +
      '• Aceptar: Irá a la pantalla de antecedentes (médicos, quirúrgicos, hábitos, otros)\n' +
      '• Cancelar: Volverá a la lista de pacientes'
    );
    if (wantsAntecedentes) {
      this.router.navigate(['/patients', patientId, 'antecedentes']);
    } else {
      this.router.navigate(['/patients']);
    }
  }

  goToList() {
    this.router.navigate(['/patients']);
  }

  onCancel() {
    this.router.navigate(['/patients']);
  }

  // Validación de email
  validateEmail() {
    if (this.patient.email && this.patient.email.length > 0) {
      clearTimeout(this.emailValidationTimeout);
      this.emailValidationTimeout = setTimeout(() => {
        this.patientService.checkEmailAvailability(this.patient.email!).subscribe({
          next: (response) => {
            // response.exists = true significa que el email ya está registrado
            // En modo edición, debemos verificar que no sea el paciente actual
            if (this.isEdit && this.patientId && response.exists) {
              // Si estamos editando, necesitamos verificar si el email pertenece al paciente actual
              // Para esto, obtenemos el paciente por email para comparar IDs
              this.patientService.getPatientByEmail(this.patient.email!).subscribe({
                next: (patientResponse) => {
                  if (patientResponse.success && patientResponse.data) {
                    this.emailExists = patientResponse.data.id !== this.patientId;
                  } else {
                    this.emailExists = false;
                  }
                  this.emailChecked = true;
                },
                error: () => {
                  // Si hay error, asumimos que el email está disponible
                  this.emailExists = false;
                  this.emailChecked = true;
                }
              });
            } else {
              // En modo creación, si exists es true, el email está duplicado
              this.emailExists = response.exists;
              this.emailChecked = true;
            }
          },
          error: (error) => {
            // Solo loguear errores reales (500, problemas de red, etc.)
            this.errorHandler.logError(error, 'validar email');
            // En caso de error, asumimos que el email está disponible
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
        this.cedulaExists = false;
        this.cedulaChecked = false;
        return;
      }
      
      // Si el formato es válido, verificar duplicados
      clearTimeout(this.cedulaValidationTimeout);
      this.cedulaValidationTimeout = setTimeout(() => {
        this.patientService.searchPatientsByCedula(this.patient.cedula!).subscribe({
          next: (response) => {
            // Si es modo edición, excluir el paciente actual
            if (this.isEdit && this.patientId) {
              const otherPatients = response.data.filter(p => p.id !== this.patientId);
              this.cedulaExists = otherPatients.length > 0;
            } else {
              this.cedulaExists = response.data.length > 0;
            }
            this.cedulaChecked = true;
          },
          error: (error) => {
            // Solo loguear errores reales (no 404, que es esperado cuando no hay resultados)
            if (error.status !== 404 && error.status !== 0) {
              this.errorHandler.logError(error, 'validar cédula');
            }
            // Si hay error o no hay resultados, la cédula está disponible
            this.cedulaExists = false;
            this.cedulaChecked = true;
          }
        });
      }, 500);
    } else {
      this.cedulaExists = false;
      this.cedulaChecked = false;
    }
  }

  // Método para formatear fechas
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE');
  }
}