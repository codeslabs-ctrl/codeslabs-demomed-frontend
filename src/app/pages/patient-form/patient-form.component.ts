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
            <textarea 
              class="form-input" 
              [(ngModel)]="patient.motivo_consulta"
              name="motivo_consulta"
              required
              rows="3"
              #motivo_consulta="ngModel"
              placeholder="Describa el motivo de la consulta"></textarea>
            <div class="error-message" *ngIf="motivo_consulta.invalid && motivo_consulta.touched">
              El motivo de consulta es requerido
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Diagnóstico</label>
            <textarea 
              class="form-input" 
              [(ngModel)]="patient.diagnostico"
              name="diagnostico"
              rows="3"
              placeholder="Diagnóstico médico"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Conclusiones</label>
            <textarea 
              class="form-input" 
              [(ngModel)]="patient.conclusiones"
              name="conclusiones"
              rows="3"
              placeholder="Conclusiones y recomendaciones"></textarea>
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
    this.patientService.createPatient(this.patient as Omit<Patient, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/patients']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating patient:', error);
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
}
