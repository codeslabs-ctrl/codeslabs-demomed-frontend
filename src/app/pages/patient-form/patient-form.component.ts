import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { HistoricoService, HistoricoWithDetails } from '../../services/historico.service';
import { ArchivoService } from '../../services/archivo.service';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';
import { ArchivoAnexo } from '../../models/archivo.model';
import { User } from '../../models/user.model';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FileUploadComponent, RichTextEditorComponent],
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
  historicoId: number | null = null;
  medicalDataLoaded = false;
  historicoDataReady = false;
  editorKey = 0;
  showSuccessActions = false;
  patientCreated = false;
  
  // Variables para validación de email
  emailExists = false;
  emailChecked = false;
  emailValidationTimeout: any;
  
  // Variables para historias clínicas y archivos
  historicos: HistoricoWithDetails[] = [];
  historico: HistoricoWithDetails | null = null;
  archivos: ArchivoAnexo[] = [];
  
  // Variables para lógica de médico
  currentMedicoId: number | null = null;
  shouldCreateNewHistory = false;

  constructor(
    private patientService: PatientService,
    private historicoService: HistoricoService,
    private archivoService: ArchivoService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el médico actual del usuario autenticado
    const currentUser = this.authService.getCurrentUser();
    this.currentMedicoId = currentUser?.medico_id || null;
    console.log('🔍 Médico actual:', this.currentMedicoId);
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.patientId = +params['id'];
        this.isEdit = true;
        this.loadPatient();
      }
    });
  }

  loadPatient() {
    if (this.patientId) {
      this.loading = true;
      this.patientService.getPatientById(this.patientId).subscribe({
        next: (response) => {
          if (response.success) {
            this.patient = response.data;
            // Inicializar historicoDataReady para modo edición
            this.historicoDataReady = true;
            this.editorKey++;
            this.loadHistoricos();
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

  loadHistoricos() {
    if (this.patientId) {
      this.historicoService.getHistoricoByPaciente(this.patientId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.historicos = response.data;
            
            // Verificar si hay una historia del médico actual
            const currentMedicoHistory = this.historicos.find(h => h.medico_id === this.currentMedicoId);
            
            if (currentMedicoHistory) {
              // Si existe una historia del médico actual, usarla
              this.historico = currentMedicoHistory;
              this.shouldCreateNewHistory = false;
              console.log('✅ Usando historia existente del médico actual:', this.currentMedicoId);
            } else if (this.historicos.length > 0) {
              // Si no hay historia del médico actual, mostrar la más reciente pero marcar para crear nueva
              this.historico = this.historicos[0];
              this.shouldCreateNewHistory = true;
              console.log('⚠️ No hay historia del médico actual, se creará nueva. Historia mostrada:', this.historicos[0].medico_id);
            }
            
            // Cargar datos médicos de la historia seleccionada
            if (this.historico) {
              this.patient.motivo_consulta = this.historico.motivo_consulta || '';
              this.patient.diagnostico = this.historico.diagnostico || '';
              this.patient.conclusiones = this.historico.conclusiones || '';
              this.patient.plan = this.historico.plan || '';
              
              console.log('🔍 Datos médicos cargados:', {
                motivo_consulta: this.patient.motivo_consulta,
                diagnostico: this.patient.diagnostico,
                conclusiones: this.patient.conclusiones,
                plan: this.patient.plan
              });
              
              console.log('🔍 Historia completa:', this.historico);
              
              // Marcar que los datos están listos y forzar re-renderizado
              this.historicoDataReady = true;
              this.editorKey++;
              
              this.loadArchivos(this.historico.id);
            }
          }
        },
        error: (error) => {
          console.error('Error loading historicos:', error);
          const errorMessage = error?.error?.message || error?.message || 'Error de conexión cargando historial médico';
          alert(`❌ Error cargando historial médico:\n\n${errorMessage}\n\nPor favor, verifique su conexión e intente nuevamente.`);
        }
      });
    }
  }

  loadArchivos(historicoId: number) {
    this.archivoService.getArchivosByHistoria(historicoId).subscribe({
      next: (response) => {
        if (response.success) {
          this.archivos = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading archivos:', error);
        this.archivos = [];
        const errorMessage = error?.error?.message || error?.message || 'Error de conexión cargando archivos';
        alert(`❌ Error cargando archivos:\n\n${errorMessage}\n\nPor favor, verifique su conexión e intente nuevamente.`);
      }
    });
  }

  onSubmit(form: any) {
    console.log('🔍 onSubmit llamado');
    console.log('🔍 isEdit:', this.isEdit);
    console.log('🔍 patientId:', this.patientId);
    console.log('🔍 patient object:', this.patient);
    console.log('🔍 Formulario válido:', form?.valid);
    console.log('🔍 Formulario inválido:', form?.invalid);
    console.log('🔍 Errores del formulario:', form?.errors);
    console.log('🔍 Controles del formulario:', form?.controls);
    
    // Verificar campos específicos
    if (form?.controls) {
      Object.keys(form.controls).forEach(key => {
        const control = form.controls[key];
        console.log(`🔍 Campo ${key}:`, {
          valid: control.valid,
          invalid: control.invalid,
          errors: control.errors,
          value: control.value
        });
      });
    }
    
    // Verificar si el formulario es válido
    if (form?.invalid) {
      console.log('❌ Formulario inválido, no se puede proceder');
      
      // Marcar todos los campos como touched para mostrar errores
      if (form.controls) {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
      
      alert('⚠️ Campos requeridos incompletos\n\nPor favor, complete todos los campos marcados con (*) antes de continuar. Verifique que la información sea correcta.');
      return;
    }

    // Verificar si hay email duplicado antes de enviar
    if (this.emailExists) {
      alert('⚠️ Email duplicado\n\nEl email ingresado ya está registrado en el sistema. Por favor, use un email diferente.');
      return;
    }
    
    if (this.isEdit && this.patientId) {
      console.log('🔍 Llamando updatePatient');
      this.updatePatient();
    } else {
      console.log('🔍 Llamando createPatient');
      this.createPatient();
    }
  }

  createPatient() {
    this.loading = true;
    const patientData = this.patient as Omit<Patient, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
    console.log('🔍 Datos del paciente a enviar:', patientData);
    console.log('🔍 Motivo de consulta:', patientData.motivo_consulta);
    console.log('🔍 Diagnóstico:', patientData.diagnostico);
    console.log('🔍 Conclusiones:', patientData.conclusiones);
    console.log('🔍 Plan:', patientData.plan);
    
    this.patientService.createPatient(patientData)
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta del servidor:', response);
          if (response.success) {
            // Capturar el historico_id si existe
            if (response.data.historico_id) {
              this.historicoId = response.data.historico_id;
              console.log('✅ Histórico ID capturado:', this.historicoId);
            }
            
            // Actualizar el paciente con el ID recibido
            this.patient.id = response.data.id;
            
            // Mostrar mensaje de éxito y botones de acción
            this.showSuccessActions = true;
            this.patientCreated = true;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error creating patient:', error);
          console.error('❌ Error details:', error.error);
          this.loading = false;
        }
      });
  }

  updatePatient() {
    if (this.patientId) {
      this.loading = true;
      
      // Crear un objeto con solo los campos que tienen valores válidos
      // Esto evita sobrescribir campos existentes con null/undefined
      const updateData: Partial<Patient> = {};
      
      // NOTA: Los campos médicos (motivo_consulta, diagnostico, conclusiones, plan) 
      // no se actualizan aquí porque pertenecen a la tabla historico_medico
      // Solo se actualizan los campos básicos del paciente
      
      // Incluir campos básicos que siempre se pueden actualizar
      if (this.patient.nombres) updateData.nombres = this.patient.nombres;
      if (this.patient.apellidos) updateData.apellidos = this.patient.apellidos;
      if (this.patient.cedula) updateData.cedula = this.patient.cedula;
      if (this.patient.telefono) updateData.telefono = this.patient.telefono;
      if (this.patient.email) updateData.email = this.patient.email;
      if (this.patient.edad !== undefined) updateData.edad = this.patient.edad;
      if (this.patient.sexo) updateData.sexo = this.patient.sexo;
      
      
      this.patientService.updatePatient(this.patientId, updateData)
        .subscribe({
          next: (response) => {
            if (response.success) {
              console.log('✅ Paciente actualizado correctamente');
              this.router.navigate(['/patients']);
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error updating patient:', error);
            this.loading = false;
          }
        });
    }
  }

  // Los datos médicos se manejan por separado en las historias clínicas
  // No se actualizan desde el formulario de edición de paciente


  onCancel() {
    console.log('🔄 onCancel() ejecutado - navegando a /patients');
    this.router.navigate(['/patients']);
  }

  // Método para ir a la lista de pacientes
  goToPatients() {
    this.router.navigate(['/patients']);
  }

  // Método para crear consulta con paciente preseleccionado
  createConsulta() {
    if (this.patient.id) {
      this.router.navigate(['/admin/consultas/nueva'], {
        queryParams: { paciente_id: this.patient.id }
      });
    }
  }

  // Métodos para manejar los cambios en los editores de texto enriquecido
  onMotivoConsultaChange(value: string) {
    this.patient.motivo_consulta = value;
  }

  onDiagnosticoChange(value: string) {
    this.patient.diagnostico = value;
  }

  onDiagnosticoInput(event: Event) {
    const target = event.target as HTMLElement;
    this.patient.diagnostico = target.innerHTML;
  }

  onDiagnosticoBlur(event: Event) {
    const target = event.target as HTMLElement;
    this.patient.diagnostico = target.innerHTML;
  }

  onConclusionesChange(value: string) {
    this.patient.conclusiones = value;
  }

  onPlanChange(value: string) {
    this.patient.plan = value;
  }

  trackByEditorKey(index: number, item: any): any {
    return item;
  }

  // Método para determinar si se pueden subir archivos
  canUploadFiles(): boolean {
    // En modo edición: solo si hay un historico seleccionado
    if (this.isEdit) {
      return this.historico && this.historico.id ? true : false;
    }
    
    // En modo creación: solo después de crear el paciente (cuando hay historicoId)
    return this.historicoId ? true : false;
  }

  // Método para obtener el ID de la historia (necesario para los archivos)
  getHistoriaId(): number {
    // Si estamos en modo edición y hay un historico seleccionado
    if (this.isEdit && this.historico && this.historico.id) {
      return this.historico.id;
    }
    
    // Si tenemos el historicoId (después de crear el paciente)
    if (this.historicoId) {
      return this.historicoId;
    }
    
    // Si no hay historico válido, retornar 0
    return 0;
  }

  // Método para manejar la actualización de archivos
  onFilesUpdated(archivos: any[]) {
    console.log('Archivos actualizados:', archivos);
    // Actualizar la lista de archivos para mostrar la sección "Archivos Anexos Existentes"
    this.archivos = archivos;
    // Recargar archivos desde el backend para obtener datos completos
    if (this.historico && this.historico.id) {
      this.loadArchivos(this.historico.id);
    }
  }

  // Método para validar cédula venezolana
  validateCedula() {
    if (!this.patient.cedula || this.patient.cedula.trim() === '') {
      return; // No validar si está vacío (es opcional)
    }

    const cedula = this.patient.cedula.trim().toUpperCase();
    
    // Validar formato básico
    const pattern = /^[VEJPG][0-9]{7,8}$/;
    if (!pattern.test(cedula)) {
      return; // El pattern del HTML ya maneja esto
    }

    // Validar algoritmo de cédula venezolana
    const isValid = this.validateVenezuelanCedula(cedula);
    if (!isValid) {
      // Marcar el campo como inválido
      const cedulaControl = (this as any).patientForm?.controls?.['cedula'];
      if (cedulaControl) {
        cedulaControl.setErrors({ cedulaInvalid: true });
      }
    }
  }

  // Método para validar email duplicado
  validateEmail() {
    if (this.patient.email && this.patient.email.includes('@')) {
      // Limpiar timeout anterior
      if (this.emailValidationTimeout) {
        clearTimeout(this.emailValidationTimeout);
      }

      // Debounce: esperar 500ms antes de validar
      this.emailValidationTimeout = setTimeout(() => {
        this.checkEmailAvailability();
      }, 500);
    } else {
      // Reset validation state
      this.emailExists = false;
      this.emailChecked = false;
    }
  }

  checkEmailAvailability() {
    if (!this.patient.email || !this.patient.email.includes('@')) {
      return;
    }

    this.patientService.checkEmailAvailability(this.patient.email).subscribe({
      next: (response: any) => {
        this.emailChecked = true;
        this.emailExists = response.exists;
      },
      error: (error: any) => {
        console.error('Error checking email availability:', error);
        this.emailChecked = false;
        this.emailExists = false;
      }
    });
  }


  // Algoritmo de validación de cédula venezolana
  private validateVenezuelanCedula(cedula: string): boolean {
    if (cedula.length < 8) return false;

    const tipo = cedula.charAt(0);
    const numero = cedula.substring(1);

    // Validar según el tipo de cédula
    switch (tipo) {
      case 'V': // Venezolanos
        return this.validateVenezuelanNationalId(numero);
      case 'E': // Extranjeros
        return this.validateForeignId(numero);
      case 'J': // Jurídicos
        return this.validateJuridicalId(numero);
      case 'P': // Pasaporte
        return this.validatePassportId(numero);
      case 'G': // Gubernamental
        return this.validateGovernmentalId(numero);
      default:
        return false;
    }
  }

  private validateVenezuelanNationalId(numero: string): boolean {
    if (numero.length !== 8) return false;

    // Algoritmo de validación para cédulas venezolanas
    const multiplicadores = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;

    for (let i = 0; i < 7; i++) {
      suma += parseInt(numero.charAt(i)) * multiplicadores[i];
    }

    const resto = suma % 11;
    const digitoVerificador = resto < 2 ? resto : 11 - resto;

    return digitoVerificador === parseInt(numero.charAt(7));
  }

  private validateForeignId(numero: string): boolean {
    // Para extranjeros, validación más simple
    return numero.length >= 7 && numero.length <= 8 && /^[0-9]+$/.test(numero);
  }

  private validateJuridicalId(numero: string): boolean {
    // Para jurídicos, validación más simple
    return numero.length >= 7 && numero.length <= 8 && /^[0-9]+$/.test(numero);
  }

  private validatePassportId(numero: string): boolean {
    // Para pasaportes, validación más simple
    return numero.length >= 7 && numero.length <= 8 && /^[0-9]+$/.test(numero);
  }

  private validateGovernmentalId(numero: string): boolean {
    // Para gubernamentales, validación más simple
    return numero.length >= 7 && numero.length <= 8 && /^[0-9]+$/.test(numero);
  }

  // Método para finalizar y volver a la lista de pacientes
  onFinish() {
    this.router.navigate(['/patients']);
  }

  // Métodos para manejar historias clínicas
  onHistoricoChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const historicoId = +target.value;
    this.selectHistorico(historicoId);
  }

  selectHistorico(historicoId: number) {
    const selectedHistorico = this.historicos.find(h => h.id === historicoId);
    if (selectedHistorico) {
      this.historico = selectedHistorico;
      
      // Actualizar los datos médicos del formulario principal con los datos de la historia seleccionada
      this.patient.motivo_consulta = selectedHistorico.motivo_consulta || '';
      this.patient.diagnostico = selectedHistorico.diagnostico || '';
      this.patient.conclusiones = selectedHistorico.conclusiones || '';
      this.patient.plan = selectedHistorico.plan || '';
      
      // Forzar re-renderizado de los RichTextEditor
      this.historicoDataReady = false;
      this.editorKey++;
      setTimeout(() => {
        this.historicoDataReady = true;
      }, 100);
      
      this.loadArchivos(selectedHistorico.id);
    }
  }

  getHistoricoDisplayText(historico: HistoricoWithDetails): string {
    const fecha = this.formatDate(historico.fecha_consulta);
    const medico = historico.nombre_medico || 
                  (historico.medico_nombre && historico.medico_apellidos ? 
                   `${historico.medico_nombre} ${historico.medico_apellidos}` : 
                   'Médico no especificado');
    return `${fecha} - ${medico}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Métodos para manejar archivos
  deleteArchivo(archivoId: number) {
    if (!archivoId) {
      console.error('Archivo ID is undefined');
      return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      this.archivoService.deleteArchivo(archivoId).subscribe({
        next: (response) => {
          if (response.success) {
            alert('✅ Archivo eliminado exitosamente');
            // Recargar archivos
            if (this.historico) {
              this.loadArchivos(this.historico.id);
            }
          } else {
            const errorMessage = (response as any).error?.message || 'Error eliminando archivo';
            alert(`❌ Error eliminando archivo:\n\n${errorMessage}\n\nPor favor, intente nuevamente.`);
          }
        },
        error: (error) => {
          console.error('Error deleting archivo:', error);
          const errorMessage = error?.error?.message || error?.message || 'Error de conexión eliminando archivo';
          alert(`❌ Error eliminando archivo:\n\n${errorMessage}\n\nPor favor, verifique su conexión e intente nuevamente.`);
        }
      });
    }
  }

  downloadFile(archivo: ArchivoAnexo) {
    if (!archivo.id) {
      console.error('Archivo ID is undefined');
      return;
    }
      this.archivoService.downloadArchivo(archivo.id).subscribe({
        next: (response) => {
          // Crear enlace de descarga
          const blob = new Blob([response], { type: archivo.tipo_mime });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = archivo.nombre_original;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error downloading archivo:', error);
          const errorMessage = error?.error?.message || error?.message || 'Error descargando archivo';
          alert(`❌ Error descargando archivo:\n\n${errorMessage}\n\nPor favor, intente nuevamente.`);
        }
      });
  }

  getFileIcon(tipoMime: string): string {
    if (tipoMime.startsWith('image/')) return '<i class="fas fa-file-image"></i>';
    if (tipoMime.startsWith('application/pdf')) return '<i class="fas fa-file-pdf"></i>';
    if (tipoMime.includes('word')) return '<i class="fas fa-file-word"></i>';
    if (tipoMime.includes('excel') || tipoMime.includes('spreadsheet')) return '<i class="fas fa-file-excel"></i>';
    if (tipoMime.includes('zip') || tipoMime.includes('rar')) return '<i class="fas fa-file-archive"></i>';
    return '<i class="fas fa-file"></i>';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileType(tipoMime: string): string {
    if (tipoMime.startsWith('image/')) return 'Imagen';
    if (tipoMime.startsWith('application/pdf')) return 'PDF';
    if (tipoMime.includes('word') || tipoMime.includes('document')) return 'Documento';
    if (tipoMime.includes('excel') || tipoMime.includes('spreadsheet')) return 'Hoja de cálculo';
    if (tipoMime.includes('powerpoint') || tipoMime.includes('presentation')) return 'Presentación';
    return 'Archivo';
  }

  editFileDescription(archivo: ArchivoAnexo) {
    const nuevaDescripcion = prompt('Editar descripción del archivo:', archivo.descripcion || '');
    if (nuevaDescripcion !== null && archivo.id) {
      this.archivoService.updateArchivo(archivo.id, nuevaDescripcion).subscribe({
        next: (response) => {
          if (response.success) {
            archivo.descripcion = nuevaDescripcion;
            alert('✅ Descripción actualizada correctamente\n\nLa descripción del archivo ha sido modificada exitosamente.');
          } else {
            alert('❌ Error al actualizar la descripción\n\nNo se pudo modificar la descripción del archivo. Por favor, intente nuevamente.');
          }
        },
        error: (error) => {
          console.error('Error actualizando descripción:', error);
          alert('❌ Error al actualizar la descripción\n\nError de conexión. Por favor, verifique su internet e intente nuevamente.');
        }
      });
    }
  }
}