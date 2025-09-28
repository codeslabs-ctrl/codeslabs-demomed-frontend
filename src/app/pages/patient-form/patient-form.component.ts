import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-form',
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
                [(ngModel)]="patient.apellidos"
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
                [(ngModel)]="patient.telefono"
                name="telefono"
                required
                #telefono="ngModel">
              <div class="error-message" *ngIf="telefono.invalid && telefono.touched">
                El teléfono es requerido
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Información Médica</h3>
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
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('justifyLeft')" title="Alinear izquierda">
                  ⬅
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('justifyCenter')" title="Centrar">
                  ↔
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('justifyRight')" title="Alinear derecha">
                  ➡
                </button>
              </div>
              <div 
                class="editor-content" 
                contenteditable="true"
                [innerHTML]="patient.motivo_consulta"
                (input)="onMotivoChange($event)"
                (blur)="onMotivoBlur()"
                #motivoEditor
                data-field="motivo_consulta"
                data-placeholder="Describa el motivo de la consulta...">
              </div>
            </div>
            <div class="error-message" *ngIf="motivoError">
              El motivo de consulta es requerido
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Diagnóstico</label>
            <div class="rich-text-editor">
              <div class="editor-toolbar">
                <button type="button" class="toolbar-btn" (click)="execCommand('bold', undefined, 'diagnostico')" title="Negrita">
                  <strong>B</strong>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('italic', undefined, 'diagnostico')" title="Cursiva">
                  <em>I</em>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('underline', undefined, 'diagnostico')" title="Subrayado">
                  <u>U</u>
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertUnorderedList', undefined, 'diagnostico')" title="Lista">
                  • Lista
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertOrderedList', undefined, 'diagnostico')" title="Lista numerada">
                  1. Lista
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'h3', 'diagnostico')" title="Título">
                  H3
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'p', 'diagnostico')" title="Párrafo">
                  P
                </button>
              </div>
              <div 
                class="editor-content" 
                contenteditable="true"
                [innerHTML]="patient.diagnostico"
                (input)="onDiagnosticoChange($event)"
                #diagnosticoEditor
                data-field="diagnostico"
                data-placeholder="Diagnóstico médico...">
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Conclusiones</label>
            <div class="rich-text-editor">
              <div class="editor-toolbar">
                <button type="button" class="toolbar-btn" (click)="execCommand('bold', undefined, 'conclusiones')" title="Negrita">
                  <strong>B</strong>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('italic', undefined, 'conclusiones')" title="Cursiva">
                  <em>I</em>
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('underline', undefined, 'conclusiones')" title="Subrayado">
                  <u>U</u>
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertUnorderedList', undefined, 'conclusiones')" title="Lista">
                  • Lista
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('insertOrderedList', undefined, 'conclusiones')" title="Lista numerada">
                  1. Lista
                </button>
                <div class="toolbar-separator"></div>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'h3', 'conclusiones')" title="Título">
                  H3
                </button>
                <button type="button" class="toolbar-btn" (click)="execCommand('formatBlock', 'p', 'conclusiones')" title="Párrafo">
                  P
                </button>
              </div>
              <div 
                class="editor-content" 
                contenteditable="true"
                [innerHTML]="patient.conclusiones"
                (input)="onConclusionesChange($event)"
                #conclusionesEditor
                data-field="conclusiones"
                data-placeholder="Conclusiones y recomendaciones...">
              </div>
            </div>
          </div>
        </div>

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
        </div>
      </form>

      <div class="loading" *ngIf="loading && !isEdit">
        <div class="spinner"></div>
        <p>Cargando datos del paciente...</p>
      </div>
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

    /* Rich Text Editor Styles */
    .rich-text-editor {
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      overflow: hidden;
      background: white;
    }

    .editor-toolbar {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem;
      background: #F5F5F5;
      border-bottom: 1px solid #E91E63;
      flex-wrap: wrap;
    }

    .toolbar-btn {
      padding: 0.375rem 0.5rem;
      border: 1px solid #E91E63;
      background: white;
      color: #E91E63;
      border-radius: 0.25rem;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-family: 'Montserrat', sans-serif;
    }

    .toolbar-btn:hover {
      background: #E91E63;
      color: white;
      transform: translateY(-1px);
    }

    .toolbar-btn:active {
      transform: translateY(0);
    }

    .toolbar-separator {
      width: 1px;
      height: 20px;
      background: #E91E63;
      margin: 0 0.25rem;
    }

    .editor-content {
      min-height: 120px;
      padding: 1rem;
      font-size: 0.875rem;
      line-height: 1.6;
      outline: none;
      border: none;
      background: white;
      color: #2C2C2C;
      font-family: 'Montserrat', sans-serif;
    }

    .editor-content:focus {
      outline: none;
    }

    .editor-content:empty:before {
      content: attr(data-placeholder);
      color: #9ca3af;
      font-style: italic;
    }

    .editor-content h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2C2C2C;
      margin: 0.5rem 0;
      font-family: 'Montserrat', sans-serif;
    }

    .editor-content p {
      margin: 0.5rem 0;
    }

    .editor-content ul, .editor-content ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }

    .editor-content li {
      margin: 0.25rem 0;
    }

    .editor-content strong {
      font-weight: 600;
    }

    .editor-content em {
      font-style: italic;
    }

    .editor-content u {
      text-decoration: underline;
    }

    .error-message-container {
      margin: 1rem 0;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      padding: 1rem;
      color: #dc2626;
      font-family: 'Montserrat', sans-serif;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .error-message svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
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

      .page-header h1 {
        font-size: 1.5rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .editor-toolbar {
        gap: 0.125rem;
        padding: 0.375rem;
      }

      .toolbar-btn {
        padding: 0.25rem 0.375rem;
        font-size: 0.75rem;
      }

      .editor-content {
        min-height: 100px;
        padding: 0.75rem;
        font-size: 0.8rem;
      }
    }

    @media (max-width: 480px) {
      .editor-toolbar {
        flex-wrap: wrap;
        gap: 0.125rem;
      }

      .toolbar-btn {
        padding: 0.25rem;
        font-size: 0.7rem;
        min-width: 32px;
        justify-content: center;
      }

      .editor-content {
        min-height: 80px;
        padding: 0.5rem;
      }
    }
  `]
})
export class PatientFormComponent implements OnInit {
  patient: Partial<Patient> = {
    nombres: '',
    apellidos: '',
    edad: 0,
    sexo: 'Femenino',
    email: '',
    telefono: '',
    motivo_consulta: '',
    diagnostico: '',
    conclusiones: ''
  };
  isEdit = false;
  loading = false;
  patientId: number | null = null;
  motivoError = false;
  errorMessage = '';

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
    if (this.isEdit && this.patientId) {
      this.updatePatient();
    } else {
      this.createPatient();
    }
  }

  createPatient() {
    this.loading = true;
    this.errorMessage = '';
    
    this.patientService.createPatient(this.patient as Omit<Patient, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/patients']);
          } else {
            this.errorMessage = response.error?.message || 'Error al crear el paciente';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating patient:', error);
          this.errorMessage = error.message || 'Error al crear el paciente';
          this.loading = false;
        }
      });
  }

  updatePatient() {
    if (this.patientId) {
      this.loading = true;
      this.errorMessage = '';
      
      this.patientService.updatePatient(this.patientId, this.patient)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.router.navigate(['/patients']);
            } else {
              this.errorMessage = response.error?.message || 'Error al actualizar el paciente';
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error updating patient:', error);
            this.errorMessage = error.message || 'Error al actualizar el paciente';
            this.loading = false;
          }
        });
    }
  }

  // Rich Text Editor Methods
  execCommand(command: string, value?: string, field?: string) {
    const targetField = field || 'motivo_consulta';
    const editor = document.querySelector(`[data-field="${targetField}"]`) as HTMLElement;
    
    if (editor) {
      editor.focus();
      document.execCommand(command, false, value);
    }
  }

  onMotivoChange(event: any) {
    this.patient.motivo_consulta = event.target.innerHTML;
    this.motivoError = false;
  }

  onMotivoBlur() {
    const text = this.patient.motivo_consulta?.replace(/<[^>]*>/g, '').trim();
    this.motivoError = !text;
  }

  onDiagnosticoChange(event: any) {
    this.patient.diagnostico = event.target.innerHTML;
  }

  onConclusionesChange(event: any) {
    this.patient.conclusiones = event.target.innerHTML;
  }

  onCancel() {
    this.router.navigate(['/patients']);
  }
}
