import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { ViewsService, MedicoCompleto } from '../../services/views.service';
import { PatientWithHistoryService } from '../../services/patient-with-history.service';
import { NewPatientWithHistory, Patient, PatientHistory } from '../../models/patient.model';

@Component({
  selector: 'app-patient-form-new',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="patient-form-page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar Paciente' : 'Nuevo Paciente' }}</h1>
        <a routerLink="/patients" class="btn btn-secondary">
          ← Volver a Pacientes
        </a>
      </div>

      <form class="patient-form" (ngSubmit)="onSubmit()" #patientForm="ngForm">
        <!-- Sección 1: Información Personal -->
        <div class="form-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Información Personal
          </h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nombres *</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="newPatient.paciente.nombres"
                name="nombres"
                required
                #nombres="ngModel">
              <div class="error-message" *ngIf="nombres.invalid && nombres.touched">
                Los nombres son requeridos
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Apellidos *</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="newPatient.paciente.apellidos"
                name="apellidos"
                required
                #apellidos="ngModel">
              <div class="error-message" *ngIf="apellidos.invalid && apellidos.touched">
                Los apellidos son requeridos
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Edad *</label>
              <input 
                type="number" 
                class="form-input" 
                [(ngModel)]="newPatient.paciente.edad"
                name="edad"
                required
                min="0"
                max="120"
                #edad="ngModel">
              <div class="error-message" *ngIf="edad.invalid && edad.touched">
                La edad es requerida (0-120 años)
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Sexo *</label>
              <select 
                class="form-input" 
                [(ngModel)]="newPatient.paciente.sexo"
                name="sexo"
                required
                #sexo="ngModel">
                <option value="">Seleccionar sexo</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Otro">Otro</option>
              </select>
              <div class="error-message" *ngIf="sexo.invalid && sexo.touched">
                El sexo es requerido
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input 
                type="email" 
                class="form-input" 
                [(ngModel)]="newPatient.paciente.email"
                name="email"
                required
                #email="ngModel">
              <div class="error-message" *ngIf="email.invalid && email.touched">
                El email es requerido y debe ser válido
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono *</label>
              <input 
                type="tel" 
                class="form-input" 
                [(ngModel)]="newPatient.paciente.telefono"
                name="telefono"
                required
                #telefono="ngModel">
              <div class="error-message" *ngIf="telefono.invalid && telefono.touched">
                El teléfono es requerido
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 2: Selección de Médico -->
        <div class="form-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Médico Tratante
          </h3>
          <div class="form-group">
            <label class="form-label">Seleccionar Médico *</label>
            <select 
              class="form-input" 
              [(ngModel)]="newPatient.historia.medico_id"
              name="medico_id"
              required
              #medico_id="ngModel"
              (change)="onMedicoChange()">
              <option value="">Seleccionar médico</option>
              <option *ngFor="let medico of medicos" [value]="medico.id">
                {{ medico.nombres }} {{ medico.apellidos }} - {{ medico.nombre_especialidad }}
              </option>
            </select>
            <div class="error-message" *ngIf="medico_id.invalid && medico_id.touched">
              Debe seleccionar un médico
            </div>
          </div>

          <!-- Información del médico seleccionado -->
          <div class="medico-info" *ngIf="medicoSeleccionado">
            <div class="medico-card">
              <div class="medico-header">
                <h4>{{ medicoSeleccionado.nombres }} {{ medicoSeleccionado.apellidos }}</h4>
                <span class="especialidad">{{ medicoSeleccionado.nombre_especialidad }}</span>
              </div>
              <div class="medico-details">
                <div class="detail-item">
                  <span class="label">Cédula:</span>
                  <span class="value">{{ medicoSeleccionado.cedula }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ medicoSeleccionado.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Teléfono:</span>
                  <span class="value">{{ medicoSeleccionado.telefono }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección 3: Historia Médica -->
        <div class="form-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Historia Médica
          </h3>
          
          <div class="form-group">
            <label class="form-label">Fecha de Consulta *</label>
            <input 
              type="datetime-local" 
              class="form-input" 
              [(ngModel)]="newPatient.historia.fecha_consulta"
              name="fecha_consulta"
              required
              #fecha_consulta="ngModel">
            <div class="error-message" *ngIf="fecha_consulta.invalid && fecha_consulta.touched">
              La fecha de consulta es requerida
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Motivo de Consulta *</label>
            <div class="rich-text-editor">
              <div class="editor-toolbar">
                <button type="button" class="toolbar-btn" (click)="execCommand('bold')" title="Negrita">
                  <strong>B</strong>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('italic')" title="Cursiva">
                  <em>I</em>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('underline')" title="Subrayado">
                  <u>U</u>
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertUnorderedList')" title="Lista">
                  • Lista
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertOrderedList')" title="Lista numerada">
                  1. Lista
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'h3')" title="Título">
                  H3
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'p')" title="Párrafo">
                  P
                </button>
              </div>
              <div 
                class="editor-content" 
                contenteditable="true"
                data-field="motivo_consulta"
                [innerHTML]="newPatient.historia.motivo_consulta"
                (input)="onMotivoChange($event)"
                (blur)="onMotivoBlur()"
                [class.error]="motivoError">
              </div>
            </div>
            <div class="error-message" *ngIf="motivoError">
              {{ motivoError }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Diagnóstico *</label>
            <div class="rich-text-editor">
              <div class="editor-toolbar">
                <button type="button" class="toolbar-btn" (click)="execCommand('bold')" title="Negrita">
                  <strong>B</strong>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('italic')" title="Cursiva">
                  <em>I</em>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('underline')" title="Subrayado">
                  <u>U</u>
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertUnorderedList')" title="Lista">
                  • Lista
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertOrderedList')" title="Lista numerada">
                  1. Lista
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'h3')" title="Título">
                  H3
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'p')" title="Párrafo">
                  P
                </button>
              </div>
              <div 
                class="editor-content" 
                contenteditable="true"
                data-field="diagnostico"
                [innerHTML]="newPatient.historia.diagnostico"
                (input)="onDiagnosticoChange($event)"
                (blur)="onDiagnosticoBlur()">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Conclusiones *</label>
            <div class="rich-text-editor">
              <div class="editor-toolbar">
                <button type="button" class="toolbar-btn" (click)="execCommand('bold')" title="Negrita">
                  <strong>B</strong>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('italic')" title="Cursiva">
                  <em>I</em>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('underline')" title="Subrayado">
                  <u>U</u>
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertUnorderedList')" title="Lista">
                  • Lista
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertOrderedList')" title="Lista numerada">
                  1. Lista
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'h3')" title="Título">
                  H3
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'p')" title="Párrafo">
                  P
                </button>
              </div>
              <div 
                class="editor-content" 
                contenteditable="true"
                data-field="conclusiones"
                [innerHTML]="newPatient.historia.conclusiones"
                (input)="onConclusionesChange($event)"
                (blur)="onConclusionesBlur()">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Plan de Tratamiento</label>
            <div class="rich-text-editor">
              <div class="editor-toolbar">
                <button type="button" class="toolbar-btn" (click)="execCommand('bold')" title="Negrita">
                  <strong>B</strong>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('italic')" title="Cursiva">
                  <em>I</em>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('underline')" title="Subrayado">
                  <u>U</u>
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertUnorderedList')" title="Lista">
                  • Lista
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertOrderedList')" title="Lista numerada">
                  1. Lista
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'h3')" title="Título">
                  H3
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'p')" title="Párrafo">
                  P
                </button>
              </div>
              <div 
                class="editor-content" 
                contenteditable="true"
                data-field="plan"
                [innerHTML]="newPatient.historia.plan"
                (input)="onPlanChange($event)"
                (blur)="onPlanBlur()">
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje de error general -->
        <div class="error-message-container" *ngIf="errorMessage">
          <div class="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {{ errorMessage }}
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="cancel()">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="patientForm.invalid || loading">
            <span *ngIf="loading" class="spinner"></span>
            {{ isEdit ? 'Actualizar Paciente' : 'Crear Paciente' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .patient-form-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: 'Montserrat', sans-serif;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #E91E63;
    }

    .page-header h1 {
      color: #2C2C2C;
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .patient-form {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
      border: 1px solid #F5F5F5;
    }

    .form-section {
      margin-bottom: 3rem;
    }

    .form-section h3 {
      color: #2C2C2C;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 1.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 2px solid #E91E63;
      padding-bottom: 0.5rem;
    }

    .form-section h3 svg {
      width: 20px;
      height: 20px;
      stroke: #E91E63;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      color: #2C2C2C;
      font-weight: 600;
      font-size: 0.9rem;
      font-family: 'Montserrat', sans-serif;
    }

    .form-input {
      padding: 0.75rem;
      border: 1px solid #F5F5F5;
      border-radius: 8px;
      background: white;
      color: #2C2C2C;
      font-family: 'Montserrat', sans-serif;
      font-size: 0.9rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #E91E63;
      box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
    }

    .error-message {
      color: #EF4444;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .medico-info {
      margin-top: 1rem;
    }

    .medico-card {
      background: #F5F5F5;
      border-radius: 8px;
      padding: 1rem;
      border-left: 4px solid #E91E63;
    }

    .medico-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .medico-header h4 {
      color: #2C2C2C;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
    }

    .especialidad {
      background: linear-gradient(135deg, #EA7EC3, #2F90B0);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .medico-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-item .label {
      color: #666666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .detail-item .value {
      color: #2C2C2C;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .rich-text-editor {
      border: 1px solid #F5F5F5;
      border-radius: 8px;
      overflow: hidden;
    }

    .editor-toolbar {
      background: #F5F5F5;
      padding: 0.5rem;
      border-bottom: 1px solid #E91E63;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .toolbar-btn {
      padding: 0.5rem 0.75rem;
      border: 1px solid #E91E63;
      border-radius: 4px;
      background: white;
      color: #E91E63;
      cursor: pointer;
      font-family: 'Montserrat', sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .toolbar-btn:hover {
      background: #E91E63;
      color: white;
    }

    .toolbar-separator {
      width: 1px;
      background: #E91E63;
      margin: 0 0.25rem;
    }

    .editor-content {
      min-height: 120px;
      padding: 1rem;
      background: white;
      color: #2C2C2C;
      font-family: 'Montserrat', sans-serif;
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .editor-content:focus {
      outline: none;
    }

    .editor-content h3 {
      color: #2C2C2C;
      font-family: 'Montserrat', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .editor-content.error {
      border: 2px solid #EF4444;
    }

    .error-message-container {
      margin: 1rem 0;
    }

    .error-message-container .error-message {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #DC2626;
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
    }

    .error-message-container .error-message svg {
      width: 20px;
      height: 20px;
      stroke: #DC2626;
      flex-shrink: 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #F5F5F5;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: 'Montserrat', sans-serif;
      border: none;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: #E91E63;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #C2185B;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      background: #F5F5F5;
      color: #666666;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #F5F5F5;
      color: #2C2C2C;
      border: 1px solid #E91E63;
    }

    .btn-secondary:hover {
      background: #E91E63;
      color: white;
      transform: translateY(-1px);
    }

    .spinner {
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .patient-form-page {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .patient-form {
        padding: 1.5rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .medico-details {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class PatientFormNewComponent implements OnInit {
  newPatient: NewPatientWithHistory = {
    paciente: {
      nombres: '',
      apellidos: '',
      edad: 0,
      sexo: 'Femenino',
      email: '',
      telefono: ''
    },
    historia: {
      medico_id: 0,
      motivo_consulta: '',
      diagnostico: '',
      conclusiones: '',
      plan: '',
      fecha_consulta: ''
    }
  };

  medicos: MedicoCompleto[] = [];
  medicoSeleccionado: MedicoCompleto | null = null;
  isEdit = false;
  loading = false;
  errorMessage = '';
  motivoError = '';

  constructor(
    private patientService: PatientService,
    private viewsService: ViewsService,
    private patientWithHistoryService: PatientWithHistoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMedicos();
    this.setDefaultDateTime();
    
    // Verificar si es edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.loadPatient(params['id']);
      }
    });
  }

  loadMedicos() {
    this.viewsService.getMedicosCompleta({ page: 1, limit: 100 }, { activo: true })
      .subscribe({
        next: (response) => {
          this.medicos = response.data;
        },
        error: (error) => {
          console.error('Error loading medicos:', error);
        }
      });
  }

  loadPatient(id: string) {
    this.loading = true;
    this.errorMessage = '';

    this.patientWithHistoryService.getPatientWithHistory(parseInt(id))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Cargar datos del paciente
            this.newPatient.paciente = {
              nombres: response.data.paciente.nombres,
              apellidos: response.data.paciente.apellidos,
              edad: response.data.paciente.edad,
              sexo: response.data.paciente.sexo,
              email: response.data.paciente.email,
              telefono: response.data.paciente.telefono
            };

            // Cargar la historia más reciente
            if (response.data.historial && response.data.historial.length > 0) {
              const ultimaHistoria = response.data.historial[0];
              this.newPatient.historia = {
                medico_id: ultimaHistoria.medico_id,
                motivo_consulta: ultimaHistoria.motivo_consulta,
                diagnostico: ultimaHistoria.diagnostico,
                conclusiones: ultimaHistoria.conclusiones,
                plan: ultimaHistoria.plan,
                fecha_consulta: ultimaHistoria.fecha_consulta
              };
            }

            this.onMedicoChange();
            this.loading = false;
          } else {
            this.errorMessage = response.error?.message || 'Error al cargar el paciente';
            this.loading = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Error al cargar el paciente';
          this.loading = false;
          console.error('Error loading patient:', error);
        }
      });
  }

  setDefaultDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    this.newPatient.historia.fecha_consulta = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onMedicoChange() {
    this.medicoSeleccionado = this.medicos.find(m => m.id === this.newPatient.historia.medico_id) || null;
  }

  execCommand(command: string, value?: string) {
    document.execCommand(command, false, value);
  }

  onMotivoChange(event: any) {
    this.newPatient.historia.motivo_consulta = event.target.innerHTML;
    this.motivoError = '';
  }

  onMotivoBlur() {
    if (!this.newPatient.historia.motivo_consulta.trim()) {
      this.motivoError = 'El motivo de consulta es requerido';
    }
  }

  onDiagnosticoChange(event: any) {
    this.newPatient.historia.diagnostico = event.target.innerHTML;
  }

  onDiagnosticoBlur() {
    // Validación adicional si es necesaria
  }

  onConclusionesChange(event: any) {
    this.newPatient.historia.conclusiones = event.target.innerHTML;
  }

  onConclusionesBlur() {
    // Validación adicional si es necesaria
  }

  onPlanChange(event: any) {
    this.newPatient.historia.plan = event.target.innerHTML;
  }

  onPlanBlur() {
    // Validación adicional si es necesaria
  }

  onSubmit() {
    if (this.isEdit) {
      this.updatePatient();
    } else {
      this.createPatient();
    }
  }

  createPatient() {
    this.loading = true;
    this.errorMessage = '';

    // Validar datos antes de enviar
    const validation = this.patientWithHistoryService.validatePatientData(this.newPatient);
    if (!validation.isValid) {
      this.errorMessage = validation.errors.join(', ');
      this.loading = false;
      return;
    }

    // Sanitizar datos
    const sanitizedData = this.patientWithHistoryService.sanitizePatientData(this.newPatient);

    this.patientWithHistoryService.createPatientWithHistory(sanitizedData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loading = false;
            // Mostrar mensaje de éxito y navegar
            alert('Paciente creado exitosamente');
            this.router.navigate(['/patients']);
          } else {
            this.errorMessage = response.error?.message || 'Error al crear el paciente';
            this.loading = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Error al crear el paciente. Intente nuevamente.';
          this.loading = false;
          console.error('Error creating patient:', error);
        }
      });
  }

  updatePatient() {
    this.loading = true;
    this.errorMessage = '';

    // Validar datos antes de enviar
    const validation = this.patientWithHistoryService.validatePatientData(this.newPatient);
    if (!validation.isValid) {
      this.errorMessage = validation.errors.join(', ');
      this.loading = false;
      return;
    }

    // Sanitizar datos
    const sanitizedData = this.patientWithHistoryService.sanitizePatientData(this.newPatient);

    // Obtener el ID del paciente desde la ruta
    const patientId = this.route.snapshot.params['id'];

    this.patientWithHistoryService.updatePatientWithHistory(parseInt(patientId), sanitizedData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loading = false;
            // Mostrar mensaje de éxito y navegar
            alert('Paciente actualizado exitosamente');
            this.router.navigate(['/patients']);
          } else {
            this.errorMessage = response.error?.message || 'Error al actualizar el paciente';
            this.loading = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Error al actualizar el paciente. Intente nuevamente.';
          this.loading = false;
          console.error('Error updating patient:', error);
        }
      });
  }

  cancel() {
    this.router.navigate(['/patients']);
  }
}
