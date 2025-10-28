import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ConsultaService } from '../../../services/consulta.service';
import { PatientService } from '../../../services/patient.service';
import { MedicoService } from '../../../services/medico.service';
import { EspecialidadService } from '../../../services/especialidad.service';
import { HistoricoService } from '../../../services/historico.service';
import { ArchivoService } from '../../../services/archivo.service';
import { DateService } from '../../../services/date.service';
import { AuthService } from '../../../services/auth.service';
import { ConsultaWithDetails } from '../../../models/consulta.model';
import { HistoricoWithDetails } from '../../../services/historico.service';
import { ArchivoAnexo } from '../../../models/archivo.model';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';

@Component({
  selector: 'app-historia-medica',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FileUploadComponent],
  styleUrls: ['./historia-medica.component.css'],
  template: `
    <div class="historia-medica-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>
            <i class="fas fa-file-medical"></i>
            {{ mode === 'edit' ? 'Editar Historia Médica' : 'Crear Historia Médica' }}
          </h1>
          <p class="page-description">
            {{ mode === 'edit' ? 'Modificar la historia médica existente' : 'Crear nueva historia médica para el paciente' }}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="volver()">
            ← Volver a Gestión de Pacientes
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Cargando datos de la consulta...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error al cargar el paciente</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" (click)="cargarPaciente()">
            <i class="fas fa-refresh"></i>
            Reintentar
          </button>
        </div>
      </div>

      <!-- Formulario -->
      <div *ngIf="!loading && !error" class="form-container">
        <!-- Información de la Consulta -->
        <div class="info-section">
          <h3>Información del Paciente y Médico</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Paciente:</label>
              <span>{{ consultaData?.paciente_nombre }} {{ consultaData?.paciente_apellidos }}</span>
            </div>
            <div class="info-item">
              <label>Médico:</label>
              <div class="medico-info">
                <div class="medico-nombre">Dr./Dra. {{ consultaData?.medico_nombre }} {{ consultaData?.medico_apellidos }}</div>
                <div class="medico-especialidad">{{ consultaData?.especialidad_nombre }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de Historia Médica -->
        <form (ngSubmit)="guardarHistoria()" #historiaFormRef="ngForm">
          <div class="form-section">
            <h3>Historia Médica</h3>
            
            <div class="form-group">
              <label for="motivo_consulta">Motivo de Consulta *</label>
              <textarea 
                id="motivo_consulta" 
                class="form-control" 
                [(ngModel)]="historiaForm.motivo_consulta" 
                name="motivo_consulta"
                rows="4"
                placeholder="Describa el motivo de la consulta..."
                required></textarea>
            </div>

            <div class="form-group">
              <label for="diagnostico">Diagnóstico *</label>
              <textarea 
                id="diagnostico" 
                class="form-control" 
                [(ngModel)]="historiaForm.diagnostico" 
                name="diagnostico"
                rows="4"
                placeholder="Diagnóstico médico..."
                required></textarea>
            </div>

            <div class="form-group">
              <label for="conclusiones">Conclusiones</label>
              <textarea 
                id="conclusiones" 
                class="form-control" 
                [(ngModel)]="historiaForm.conclusiones" 
                name="conclusiones"
                rows="4"
                placeholder="Conclusiones y recomendaciones..."></textarea>
            </div>

            <div class="form-group">
              <label for="plan">Plan de Tratamiento</label>
              <textarea 
                id="plan" 
                class="form-control" 
                [(ngModel)]="historiaForm.plan" 
                name="plan"
                rows="4"
                placeholder="Plan de acciones a seguir en el tratamiento..."></textarea>
            </div>
          </div>

          <!-- Sección de Archivos Anexos -->
          <div class="form-section" *ngIf="mode === 'edit' && historiaData?.id">
            <h3>Archivos Anexos</h3>
            
            <!-- Archivos existentes -->
            <div class="archivos-existentes" *ngIf="archivos.length > 0">
              <h4>Archivos adjuntos ({{ archivos.length }})</h4>
              <div class="archivos-lista">
                <div class="archivo-item" *ngFor="let archivo of archivos">
                  <div class="archivo-info">
                    <div class="archivo-icon">
                      <span [innerHTML]="getFileIcon(archivo.tipo_mime)"></span>
                    </div>
                    <div class="archivo-details">
                      <div class="archivo-name">{{ archivo.nombre_original }}</div>
                      <div class="archivo-meta">
                        <span class="archivo-size">{{ formatFileSize(archivo.tamano_bytes) }}</span>
                        <span class="archivo-date">{{ formatDate(archivo.fecha_subida || '') }}</span>
                      </div>
                      <div class="archivo-description" *ngIf="archivo.descripcion">
                        {{ archivo.descripcion }}
                      </div>
                    </div>
                  </div>
                  <div class="archivo-actions">
                    <button 
                      type="button" 
                      class="btn-download" 
                      (click)="descargarArchivo(archivo)" 
                      title="Descargar">
                      <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      class="btn-delete" 
                      (click)="eliminarArchivo(archivo)" 
                      title="Eliminar">
                      <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estado de carga de archivos -->
            <div *ngIf="archivosCargando" class="archivos-loading">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Cargando archivos...</span>
            </div>

            <!-- Error al cargar archivos -->
            <div *ngIf="archivosError" class="archivos-error">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ archivosError }}</span>
              <button type="button" class="btn btn-sm" (click)="cargarArchivos()">
                Reintentar
              </button>
            </div>

            <!-- Componente para subir archivos -->
            <app-file-upload 
              [historiaId]="historiaData?.id || 0"
              (filesUpdated)="onArchivosSubidos($event)">
            </app-file-upload>
          </div>

          <!-- Botones de acción -->
          <div class="form-actions">
            <button 
              type="button" 
              class="btn btn-outline" 
              (click)="resetForm()"
              [disabled]="isSubmitting">
              <span class="btn-icon">🔄</span>
              <span class="btn-text">Restaurar</span>
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="isSubmitting">
              <span *ngIf="isSubmitting" class="btn-icon">⏳</span>
              <span *ngIf="!isSubmitting" class="btn-icon">💾</span>
              <span class="btn-text">{{isSubmitting ? 'Guardando...' : (mode === 'edit' ? 'Actualizar Historia' : 'Crear Historia')}}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .historia-medica-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
      font-size: 2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-header h1 i {
      color: var(--color-primary, #E91E63);
    }

    .page-description {
      color: #6b7280;
      margin: 0;
      font-size: 0.875rem;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .loading-spinner {
      text-align: center;
      color: #6b7280;
    }

    .loading-spinner i {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--color-primary, #E91E63);
    }

    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .error-message {
      text-align: center;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 2rem;
      max-width: 500px;
    }

    .error-message i {
      font-size: 3rem;
      color: #dc2626;
      margin-bottom: 1rem;
    }

    .error-message h3 {
      color: #dc2626;
      margin: 0 0 1rem 0;
    }

    .error-message p {
      color: #7f1d1d;
      margin: 0 0 1.5rem 0;
    }

    .form-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 2rem;
    }

    .info-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .info-section h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-weight: 600;
      color: #64748b;
      font-size: 0.875rem;
    }

    .info-item span {
      color: #1e293b;
      font-size: 0.875rem;
    }

    .medico-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .medico-nombre {
      color: #1e293b;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .medico-especialidad {
      color: #64748b;
      font-size: 0.75rem;
      font-style: italic;
    }

    .form-section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      width: 100%;
      box-sizing: border-box;
    }

    .form-section h3 {
      margin: 0 0 1.5rem 0;
      color: #2c3e50;
      font-size: 1.25rem;
      font-weight: 600;
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1.5rem;
    }

    .form-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-size: 0.875rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      background: white;
      resize: vertical;
      min-height: 100px;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem 0;
      border-top: 1px solid #e9ecef;
      margin-top: 2rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #E91E63;
      color: white;
      box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
      font-weight: 500;
    }

    .btn-primary:hover:not(:disabled) {
      background: #C2185B;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(233, 30, 99, 0.4);
    }

    .btn-secondary {
      background: #F5F5F5;
      color: #2C2C2C;
      border: 1px solid #E91E63;
      font-weight: 500;
    }

    .btn-secondary:hover {
      background: #E91E63;
      color: white;
      border-color: #E91E63;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-outline {
      background: transparent;
      color: #6c757d;
      border: 1px solid #6c757d;
      font-weight: 500;
    }

    .btn-outline:hover {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }

    .btn-icon {
      font-size: 1rem;
    }

    @media (max-width: 1024px) {
      .form-container {
        max-width: 95%;
        padding: 0 1rem;
      }
      
      .form-section {
        padding: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .form-container {
        padding: 0 1rem;
        max-width: 100%;
      }
      
      .form-section {
        padding: 1rem;
        margin-bottom: 1rem;
      }
      
      .page-header {
        padding: 1rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .page-header h1 {
        font-size: 1.5rem;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-start;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HistoriaMedicaComponent implements OnInit {
  consultaData: ConsultaWithDetails | null = null;
  historiaData: HistoricoWithDetails | null = null;
  consultaId: number = 0;
  mode: 'create' | 'edit' = 'create';
  loading = true;
  error: string | null = null;
  isSubmitting = false;

  historiaForm = {
    motivo_consulta: '',
    diagnostico: '',
    conclusiones: '',
    plan: ''
  };

  historiaOriginal: any = null;

  // Propiedades para archivos
  archivos: ArchivoAnexo[] = [];
  archivosCargando = false;
  archivosError: string | null = null;

  constructor(
    private consultaService: ConsultaService,
    private patientService: PatientService,
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private historicoService: HistoricoService,
    private archivoService: ArchivoService,
    private dateService: DateService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.consultaId = +params['id']; // Ahora es patientId
      if (this.consultaId) {
        this.cargarPaciente();
      } else {
        this.error = 'ID de paciente no válido';
        this.loading = false;
      }
    });
  }

  cargarPaciente(): void {
    this.loading = true;
    this.error = null;

    this.patientService.getPatientById(this.consultaId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Obtener información del médico actual
          const currentUser = this.authService.getCurrentUser();
          const medicoId = currentUser?.medico_id;
          
          if (medicoId) {
            // Cargar información del médico
            this.cargarInformacionMedico(medicoId, response.data);
          } else {
            // Si no hay médico asignado, usar datos básicos
            this.configurarDatosBasicos(response.data);
          }
        } else {
          this.error = 'No se pudo cargar el paciente';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error cargando paciente:', error);
        this.error = error.error?.message || 'Error al cargar el paciente';
        this.loading = false;
      }
    });
  }

  cargarInformacionMedico(medicoId: number, patientData: any): void {
    // Obtener información completa del médico
    this.medicoService.getMedicoById(medicoId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const medico = response.data;
          console.log('🔍 Médico cargado:', medico);
          console.log('🔍 Campos disponibles en médico:', Object.keys(medico));
          console.log('🔍 Especialidad ID:', medico.especialidad_id);
          console.log('🔍 Especialidad del médico:', medico.especialidad_nombre);
          
          // Si no tenemos el nombre de la especialidad, cargarlo por separado
          if (!medico.especialidad_nombre && medico.especialidad_id) {
            this.cargarEspecialidad(medico, patientData);
          } else {
            this.configurarDatosMedico(medico, patientData);
          }
        } else {
          // Fallback a datos básicos si no se puede cargar el médico
          this.configurarDatosBasicos(patientData);
        }
        
        this.verificarHistoriaExistente();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando médico:', error);
        // Fallback a datos básicos en caso de error
        this.configurarDatosBasicos(patientData);
        this.verificarHistoriaExistente();
        this.loading = false;
      }
    });
  }

  cargarEspecialidad(medico: any, patientData: any): void {
    this.especialidadService.getEspecialidadById(medico.especialidad_id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const especialidad = response.data;
          console.log('🔍 Especialidad cargada:', especialidad);
          medico.especialidad_nombre = especialidad.nombre_especialidad;
          this.configurarDatosMedico(medico, patientData);
        } else {
          console.log('❌ No se pudo cargar la especialidad');
          this.configurarDatosMedico(medico, patientData);
        }
      },
      error: (error) => {
        console.error('❌ Error cargando especialidad:', error);
        this.configurarDatosMedico(medico, patientData);
      }
    });
  }

  configurarDatosMedico(medico: any, patientData: any): void {
    this.consultaData = {
      id: 0,
      paciente_id: patientData.id,
      medico_id: medico.id,
      motivo_consulta: patientData.motivo_consulta || '',
      tipo_consulta: 'primera_vez',
      fecha_pautada: new Date().toISOString().split('T')[0],
      hora_pautada: '00:00',
      duracion_estimada: 30,
      estado_consulta: 'agendada',
      prioridad: 'normal',
      recordatorio_enviado: false,
      fecha_creacion: patientData.fecha_creacion,
      fecha_actualizacion: patientData.fecha_actualizacion,
      paciente_nombre: patientData.nombres,
      paciente_apellidos: patientData.apellidos,
      paciente_cedula: patientData.cedula,
      paciente_telefono: patientData.telefono,
      paciente_email: patientData.email,
      medico_nombre: medico.nombres || 'Médico',
      medico_apellidos: medico.apellidos || 'Actual',
      especialidad_nombre: medico.especialidad_nombre || 'Sin especialidad',
      historico_id: patientData.historico_id,
      diagnostico: patientData.diagnostico,
      conclusiones: patientData.conclusiones,
      plan: patientData.plan
    };
    
    this.verificarHistoriaExistente();
    this.loading = false;
  }

  configurarDatosBasicos(patientData: any): void {
    this.consultaData = {
      id: 0,
      paciente_id: patientData.id,
      medico_id: 0,
      motivo_consulta: patientData.motivo_consulta || '',
      tipo_consulta: 'primera_vez',
      fecha_pautada: new Date().toISOString().split('T')[0],
      hora_pautada: '00:00',
      duracion_estimada: 30,
      estado_consulta: 'agendada',
      prioridad: 'normal',
      recordatorio_enviado: false,
      fecha_creacion: patientData.fecha_creacion,
      fecha_actualizacion: patientData.fecha_actualizacion,
      paciente_nombre: patientData.nombres,
      paciente_apellidos: patientData.apellidos,
      paciente_cedula: patientData.cedula,
      paciente_telefono: patientData.telefono,
      paciente_email: patientData.email,
      medico_nombre: 'Médico',
      medico_apellidos: 'No Asignado',
      especialidad_nombre: 'Sin especialidad',
      historico_id: patientData.historico_id,
      diagnostico: patientData.diagnostico,
      conclusiones: patientData.conclusiones,
      plan: patientData.plan
    };
    
    this.verificarHistoriaExistente();
    this.loading = false;
  }

  verificarHistoriaExistente(): void {
    if (!this.consultaData) return;

    // Verificar si ya existe historia médica
    if (this.consultaData.historico_id) {
      this.mode = 'edit';
      this.cargarHistoriaExistente();
    } else {
      this.mode = 'create';
      this.loading = false;
    }
  }

  cargarHistoriaExistente(): void {
    if (!this.consultaData?.historico_id) return;

    this.historicoService.getHistoricoById(this.consultaData.historico_id).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.historiaData = response.data;
          if (this.historiaData) {
            this.historiaForm = {
              motivo_consulta: this.historiaData.motivo_consulta || '',
              diagnostico: this.historiaData.diagnostico || '',
              conclusiones: this.historiaData.conclusiones || '',
              plan: this.historiaData.plan || ''
            };
            this.historiaOriginal = { ...this.historiaForm };
            
            // Cargar archivos existentes
            this.cargarArchivos();
          }
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error cargando historia:', error);
        this.error = 'Error al cargar la historia médica existente';
        this.loading = false;
      }
    });
  }

  guardarHistoria(): void {
    if (this.isSubmitting) return;

    // Validaciones básicas
    if (!this.historiaForm.motivo_consulta.trim()) {
      alert('⚠️ Motivo de consulta requerido\n\nPor favor, ingrese el motivo de la consulta.');
      return;
    }

    if (!this.historiaForm.diagnostico.trim()) {
      alert('⚠️ Diagnóstico requerido\n\nPor favor, ingrese el diagnóstico médico.');
      return;
    }

    this.isSubmitting = true;

    if (this.mode === 'edit') {
      this.actualizarHistoria();
    } else {
      this.crearHistoria();
    }
  }

  crearHistoria(): void {
    if (!this.consultaData) return;

    const currentUser = this.authService.getCurrentUser();
    const medicoId = currentUser?.medico_id;

    if (!medicoId) {
      alert('❌ Error de autenticación\n\nNo se pudo identificar el médico actual.');
      this.isSubmitting = false;
      return;
    }

    const historiaData = {
      paciente_id: this.consultaData.paciente_id,
      medico_id: medicoId,
      motivo_consulta: this.historiaForm.motivo_consulta,
      diagnostico: this.historiaForm.diagnostico,
      conclusiones: this.historiaForm.conclusiones,
      plan: this.historiaForm.plan,
      fecha_consulta: this.consultaData.fecha_pautada
    };

    this.historicoService.createHistorico(historiaData).subscribe({
      next: (response) => {
        if (response.success) {
          // Actualizar historiaData con el ID de la nueva historia
          this.historiaData = response.data;
          this.mode = 'edit';
          
          // Cargar archivos después de crear la historia
          this.cargarArchivos();
          
          alert('✅ Historia médica creada exitosamente\n\nAhora puede agregar archivos anexos si lo desea.');
        } else {
          alert('❌ Error al crear la historia médica\n\n' + ((response as any).error?.message || 'Error desconocido'));
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('❌ Error creando historia:', error);
        alert('❌ Error al crear la historia médica\n\n' + (error.error?.message || 'Error de conexión'));
        this.isSubmitting = false;
      }
    });
  }

  actualizarHistoria(): void {
    if (!this.historiaData?.id) return;

    const updateData = {
      motivo_consulta: this.historiaForm.motivo_consulta,
      diagnostico: this.historiaForm.diagnostico,
      conclusiones: this.historiaForm.conclusiones,
      plan: this.historiaForm.plan
    };

    this.historicoService.updateHistorico(this.historiaData.id, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          alert('✅ Historia médica actualizada exitosamente');
          this.router.navigate(['/admin/consultas']);
        } else {
          alert('❌ Error al actualizar la historia médica\n\n' + ((response as any).error?.message || 'Error desconocido'));
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('❌ Error actualizando historia:', error);
        alert('❌ Error al actualizar la historia médica\n\n' + (error.error?.message || 'Error de conexión'));
        this.isSubmitting = false;
      }
    });
  }

  resetForm(): void {
    if (this.historiaOriginal) {
      this.historiaForm = { ...this.historiaOriginal };
    } else {
      this.historiaForm = {
        motivo_consulta: '',
        diagnostico: '',
        conclusiones: '',
        plan: ''
      };
    }
  }

  formatDate(dateString: string | undefined): string {
    return this.dateService.formatDate(dateString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  volver() {
    this.router.navigate(['/patients']);
  }

  // Métodos para manejo de archivos
  cargarArchivos(): void {
    if (!this.historiaData?.id) return;

    this.archivosCargando = true;
    this.archivosError = null;

    this.archivoService.getArchivosByHistoria(this.historiaData.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.archivos = response.data || [];
        } else {
          this.archivosError = 'Error al cargar los archivos';
        }
        this.archivosCargando = false;
      },
      error: (error) => {
        console.error('Error cargando archivos:', error);
        this.archivosError = 'Error al cargar los archivos';
        this.archivosCargando = false;
      }
    });
  }

  onArchivosSubidos(archivos: ArchivoAnexo[]): void {
    console.log('Archivos subidos:', archivos);
    // Recargar la lista de archivos
    this.cargarArchivos();
  }

  descargarArchivo(archivo: ArchivoAnexo): void {
    this.archivoService.downloadArchivo(archivo.id!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = archivo.nombre_original;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error descargando archivo:', error);
        alert('Error al descargar el archivo');
      }
    });
  }

  eliminarArchivo(archivo: ArchivoAnexo): void {
    if (confirm('¿Está seguro de que desea eliminar este archivo?')) {
      this.archivoService.deleteArchivo(archivo.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.cargarArchivos(); // Recargar la lista
          } else {
            alert('Error al eliminar el archivo');
          }
        },
        error: (error) => {
          console.error('Error eliminando archivo:', error);
          alert('Error al eliminar el archivo');
        }
      });
    }
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType === 'application/pdf') {
      return '📄';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return '📊';
    } else if (mimeType.startsWith('text/')) {
      return '📃';
    } else {
      return '📎';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
