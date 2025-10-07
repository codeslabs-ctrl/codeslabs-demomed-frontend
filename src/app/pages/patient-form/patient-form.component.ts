import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { RichTextEditorComponent } from '../../components/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FileUploadComponent, RichTextEditorComponent],
  template: `
    <div class="patient-form-page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar Paciente' : 'Nuevo Paciente' }}</h1>
        <a routerLink="/patients" class="btn btn-secondary">
          ← Volver a Pacientes
        </a>
      </div>

      <form class="patient-form" (ngSubmit)="onSubmit()" #patientForm="ngForm">
        <div class="form-section">
          <h3>Información Personal</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nombres *</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="patient.nombres"
                name="nombres"
                required
                pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$"
                placeholder="Solo letras y espacios"
                #nombres="ngModel">
              <div class="error-message" *ngIf="nombres.invalid && nombres.touched">
                <span *ngIf="nombres.errors?.['required']">Los nombres son requeridos</span>
                <span *ngIf="nombres.errors?.['pattern']">Solo se permiten letras y espacios (2-50 caracteres)</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Apellidos *</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="patient.apellidos"
                name="apellidos"
                required
                pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$"
                placeholder="Solo letras y espacios"
                #apellidos="ngModel">
              <div class="error-message" *ngIf="apellidos.invalid && apellidos.touched">
                <span *ngIf="apellidos.errors?.['required']">Los apellidos son requeridos</span>
                <span *ngIf="apellidos.errors?.['pattern']">Solo se permiten letras y espacios (2-50 caracteres)</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Cédula</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="patient.cedula"
                name="cedula"
                pattern="^[VEJPG][0-9]{7,8}$"
                placeholder="Ej: V12345678, E1234567"
                (blur)="validateCedula()"
                #cedula="ngModel">
              <div class="error-message" *ngIf="cedula.invalid && cedula.touched">
                <span *ngIf="cedula.errors?.['pattern']">Formato inválido. Usa: V12345678, E1234567, J12345678, P12345678, G12345678</span>
                <span *ngIf="cedula.errors?.['cedulaInvalid']">Cédula inválida. Verifica el número</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Edad *</label>
              <input 
                type="number" 
                class="form-input" 
                [(ngModel)]="patient.edad"
                name="edad"
                required
                min="0"
                max="120"
                #edad="ngModel">
              <div class="error-message" *ngIf="edad.invalid && edad.touched">
                La edad es requerida y debe ser válida
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Sexo *</label>
              <select 
                class="form-input" 
                [(ngModel)]="patient.sexo"
                name="sexo"
                required
                #sexo="ngModel">
                <option value="">Seleccionar sexo</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
              <div class="error-message" *ngIf="sexo.invalid && sexo.touched">
                El sexo es requerido
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Información de Contacto</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input 
                type="email" 
                class="form-input" 
                [(ngModel)]="patient.email"
                name="email"
                required
                email
                pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
                placeholder="usuario@dominio.com"
                #email="ngModel">
              <div class="error-message" *ngIf="email.invalid && email.touched">
                <span *ngIf="email.errors?.['required']">El email es requerido</span>
                <span *ngIf="email.errors?.['email'] || email.errors?.['pattern']">Ingresa un email válido (ej: usuario&#64;dominio.com)</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono *</label>
              <input 
                type="tel" 
                class="form-input" 
                [(ngModel)]="patient.telefono"
                name="telefono"
                required
                pattern="^(\\+58|0)(4[0-9]{2}|2[0-9]{2})[0-9]{7}$"
                placeholder="Ej: 04141234567 o +584141234567"
                #telefono="ngModel">
              <div class="error-message" *ngIf="telefono.invalid && telefono.touched">
                <span *ngIf="telefono.errors?.['required']">El teléfono es requerido</span>
                <span *ngIf="telefono.errors?.['pattern']">Formato inválido. Usa: 04141234567 o +584141234567 (celular venezolano)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Información Médica</h3>
          <div class="form-group">
            <label class="form-label">Motivo de Consulta *</label>
            <app-rich-text-editor
              [value]="patient.motivo_consulta || ''"
              placeholder="Describa el motivo de la consulta"
              (valueChange)="onMotivoConsultaChange($event)">
            </app-rich-text-editor>
          </div>
          <div class="form-group">
            <label class="form-label">Diagnóstico</label>
            <app-rich-text-editor
              [value]="patient.diagnostico || ''"
              placeholder="Diagnóstico médico"
              (valueChange)="onDiagnosticoChange($event)">
            </app-rich-text-editor>
          </div>
          <div class="form-group">
            <label class="form-label">Conclusiones</label>
            <app-rich-text-editor
              [value]="patient.conclusiones || ''"
              placeholder="Conclusiones y recomendaciones"
              (valueChange)="onConclusionesChange($event)">
            </app-rich-text-editor>
          </div>
          <div class="form-group">
            <label class="form-label">Plan de Tratamiento</label>
            <app-rich-text-editor
              [value]="patient.plan || ''"
              placeholder="Plan de acciones a seguir en el tratamiento del paciente"
              (valueChange)="onPlanChange($event)">
            </app-rich-text-editor>
          </div>
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-secondary" 
            (click)="onCancel()">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="patientForm.invalid || loading">
            <span *ngIf="loading" class="spinner"></span>
            {{ isEdit ? 'Actualizar' : 'Crear' }} Paciente
          </button>
          <button 
            *ngIf="patient.id && !isEdit" 
            type="button" 
            class="btn btn-success"
            (click)="onFinish()">
            Finalizar y Volver
          </button>
        </div>
      </form>

      <div class="loading" *ngIf="loading && !isEdit">
        <div class="spinner"></div>
        <p>Cargando datos del paciente...</p>
      </div>

      <!-- Componente de archivos anexos -->
      <app-file-upload 
        *ngIf="patient.id || historicoId || !isEdit" 
        [historiaId]="getHistoriaId()"
        (filesUpdated)="onFilesUpdated($event)">
      </app-file-upload>
    </div>
  `,
  styles: [`
    .patient-form-page {
      max-width: 800px;
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

    .patient-form {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input.ng-invalid.ng-touched {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
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

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PatientFormComponent implements OnInit {
  patient: Partial<Patient> = {
    nombres: '',
    apellidos: '',
    cedula: '',
    edad: 0,
    sexo: 'Femenino',
    email: '',
    telefono: '',
    motivo_consulta: '',
    diagnostico: '',
    conclusiones: '',
    plan: ''
  };
  isEdit = false;
  loading = false;
  patientId: number | null = null;
  historicoId: number | null = null;

  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
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
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading patient:', error);
          this.loading = false;
        }
      });
    }
  }

  onSubmit() {
    console.log('🔍 onSubmit llamado');
    console.log('🔍 isEdit:', this.isEdit);
    console.log('🔍 patientId:', this.patientId);
    console.log('🔍 patient object:', this.patient);
    
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
            
            // Mostrar mensaje de éxito
            alert('Paciente creado exitosamente. Ahora puedes agregar archivos adjuntos si lo deseas.');
            
            // No redirigir inmediatamente, permitir agregar archivos
            // this.router.navigate(['/patients']);
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
      this.patientService.updatePatient(this.patientId, this.patient)
        .subscribe({
          next: (response) => {
            if (response.success) {
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

  onCancel() {
    this.router.navigate(['/patients']);
  }

  // Métodos para manejar los cambios en los editores de texto enriquecido
  onMotivoConsultaChange(value: string) {
    this.patient.motivo_consulta = value;
  }

  onDiagnosticoChange(value: string) {
    this.patient.diagnostico = value;
  }

  onConclusionesChange(value: string) {
    this.patient.conclusiones = value;
  }

  onPlanChange(value: string) {
    this.patient.plan = value;
  }

  // Método para obtener el ID de la historia (necesario para los archivos)
  getHistoriaId(): number {
    // Si tenemos el historicoId (después de crear el paciente), usarlo
    if (this.historicoId) {
      return this.historicoId;
    }
    
    // Si es un paciente existente, necesitamos obtener el historico_id
    if (this.patient.id) {
      // TODO: Implementar lógica para obtener el historico_id del paciente existente
      return 0; // Por ahora retornar 0
    }
    
    // Si es un nuevo paciente, retornar 0 (el componente manejará esto)
    return 0;
  }

  // Método para manejar la actualización de archivos
  onFilesUpdated(archivos: any[]) {
    console.log('Archivos actualizados:', archivos);
    // Aquí podrías agregar lógica adicional si es necesario
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
}
