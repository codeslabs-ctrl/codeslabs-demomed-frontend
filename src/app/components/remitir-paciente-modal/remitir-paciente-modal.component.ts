import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RemisionService } from '../../services/remision.service';
import { AuthService } from '../../services/auth.service';
import { CrearRemisionRequest } from '../../models/remision.model';
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user.model';

export interface Medico {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad: string;
  email: string;
  telefono: string;
}

export interface Especialidad {
  id: number;
  nombre_especialidad: string;
  descripcion: string;
}

@Component({
  selector: 'app-remitir-paciente-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Remitir Paciente</h2>
          <button class="close-btn" (click)="closeModal()">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="patient-info">
            <h3>Paciente a Remitir</h3>
            <div class="patient-card">
              <div class="patient-avatar">
                {{ getInitials(patient?.nombres || '', patient?.apellidos || '') }}
              </div>
              <div class="patient-details">
                <h4>{{ patient?.nombres }} {{ patient?.apellidos }}</h4>
                <p>{{ patient?.edad }} años • {{ patient?.sexo }}</p>
                <p *ngIf="patient?.cedula" class="cedula">{{ patient!.cedula }}</p>
              </div>
            </div>
          </div>

          <form (ngSubmit)="onSubmit()" #remisionForm="ngForm">
            <div class="form-group">
              <label class="form-label">Médico Remitente *</label>
              <select 
                class="form-input" 
                [(ngModel)]="remisionData.medico_remitente_id" 
                name="medico_remitente_id"
                [disabled]="isMedicoUser"
                required>
                <option value="">Seleccionar médico remitente</option>
                <option *ngFor="let medico of medicos" [value]="medico.id">
                  {{ medico.nombres }} {{ medico.apellidos }} - {{ medico.especialidad }}
                </option>
              </select>
              <small *ngIf="isMedicoUser" class="form-help">
                Usted es el médico remitente
              </small>
            </div>

            <div class="form-group">
              <label class="form-label">Especialidad de Destino *</label>
              <select 
                class="form-input" 
                [(ngModel)]="selectedEspecialidad" 
                name="especialidad"
                (change)="onEspecialidadChange()"
                required>
                <option value="">Seleccionar especialidad</option>
                <option *ngFor="let especialidad of especialidades" [value]="especialidad.id">
                  {{ especialidad.nombre_especialidad }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Médico a Remitir *</label>
              <select 
                class="form-input" 
                [(ngModel)]="remisionData.medico_remitido_id" 
                name="medico_remitido_id"
                [disabled]="!selectedEspecialidad"
                required>
                <option value="">Seleccionar médico de destino</option>
                <option *ngFor="let medico of medicosPorEspecialidad" [value]="medico.id">
                  {{ medico.nombres }} {{ medico.apellidos }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Motivo de Remisión *</label>
              <textarea 
                class="form-input" 
                [(ngModel)]="remisionData.motivo_remision" 
                name="motivo_remision"
                rows="4"
                placeholder="Describa el motivo de la remisión..."
                required></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Observaciones</label>
              <textarea 
                class="form-input" 
                [(ngModel)]="remisionData.observaciones" 
                name="observaciones"
                rows="3"
                placeholder="Observaciones adicionales (opcional)"></textarea>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeModal()">
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            (click)="onSubmit()"
            [disabled]="!remisionForm.form.valid || loading">
            <span *ngIf="loading" class="spinner"></span>
            {{ loading ? 'Remitiendo...' : 'Remitir Paciente' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      color: #6b7280;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .close-btn svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    .modal-body {
      padding: 2rem;
    }

    .patient-info {
      margin-bottom: 2rem;
    }

    .patient-info h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
    }

    .patient-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
    }

    .patient-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1.125rem;
    }

    .patient-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .patient-details p {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .cedula {
      font-family: 'Courier New', monospace;
      background: #e0f2fe;
      color: #0369a1;
      padding: 0.125rem 0.5rem;
      border-radius: 0.25rem;
      display: inline-block;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #E91E63;
      box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
    }

    .form-input:disabled {
      background: #f9fafb;
      color: #6b7280;
      cursor: not-allowed;
    }

    .form-help {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #6b7280;
      font-style: italic;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem 2rem;
      border-top: 1px solid #e5e7eb;
      background: #f8fafc;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .btn-primary {
      background: #E91E63;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #C2185B;
      transform: translateY(-1px);
    }

    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .modal-content {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 1rem;
      }

      .patient-card {
        flex-direction: column;
        text-align: center;
      }

      .modal-footer {
        flex-direction: column;
      }
    }
  `]
})
export class RemitirPacienteModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() patient: Patient | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() remisionCreated = new EventEmitter<any>();

  medicos: Medico[] = [];
  especialidades: Especialidad[] = [];
  medicosPorEspecialidad: Medico[] = [];
  selectedEspecialidad: number | string | null = null;
  loading = false;
  currentUser: User | null = null;
  isMedicoUser = false;

  remisionData: CrearRemisionRequest = {
    paciente_id: 0,
    medico_remitente_id: 0,
    medico_remitido_id: 0,
    motivo_remision: '',
    observaciones: ''
  };

  constructor(
    private remisionService: RemisionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.patient) {
      this.remisionData.paciente_id = this.patient.id;
    }
    
    // Obtener el usuario actual
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      this.isMedicoUser = user?.rol === 'medico';
      
      // Si es médico, establecer automáticamente el médico remitente
      if (this.isMedicoUser && user?.medico_id) {
        this.remisionData.medico_remitente_id = user.medico_id;
      }
    });
    
    this.loadMedicos();
    this.loadEspecialidades();
  }

  loadMedicos() {
    // TODO: Implementar servicio para obtener médicos
    // Por ahora, datos de ejemplo
    this.medicos = [
      { id: 1, nombres: 'Juan', apellidos: 'Pérez', especialidad: 'Ginecología', email: 'juan@femimed.com', telefono: '0412-1234567' },
      { id: 2, nombres: 'María', apellidos: 'González', especialidad: 'Obstetricia', email: 'maria@femimed.com', telefono: '0412-7654321' },
      { id: 3, nombres: 'Carlos', apellidos: 'Rodríguez', especialidad: 'Endocrinología', email: 'carlos@femimed.com', telefono: '0412-9876543' }
    ];
  }

  loadEspecialidades() {
    // TODO: Implementar servicio para obtener especialidades
    // Por ahora, datos de ejemplo
    this.especialidades = [
      { id: 1, nombre_especialidad: 'Ginecología', descripcion: 'Especialidad en salud femenina' },
      { id: 2, nombre_especialidad: 'Obstetricia', descripcion: 'Especialidad en embarazo y parto' },
      { id: 3, nombre_especialidad: 'Endocrinología', descripcion: 'Especialidad en hormonas' },
      { id: 4, nombre_especialidad: 'Oncología', descripcion: 'Especialidad en cáncer' }
    ];
  }

  onEspecialidadChange() {
    console.log('🔍 Especialidad seleccionada:', this.selectedEspecialidad, 'tipo:', typeof this.selectedEspecialidad);
    
    if (this.selectedEspecialidad) {
      // Convertir a número si viene como string
      const especialidadId = typeof this.selectedEspecialidad === 'string' 
        ? parseInt(this.selectedEspecialidad) 
        : this.selectedEspecialidad;
      
      const especialidad = this.especialidades.find(e => e.id === especialidadId);
      console.log('🔍 Especialidad encontrada:', especialidad);
      console.log('🔍 Todas las especialidades:', this.especialidades);
      
      if (especialidad) {
        this.medicosPorEspecialidad = this.medicos.filter(m => m.especialidad === especialidad.nombre_especialidad);
        console.log('🔍 Médicos filtrados:', this.medicosPorEspecialidad);
        console.log('🔍 Todos los médicos:', this.medicos);
      }
    } else {
      this.medicosPorEspecialidad = [];
    }
    this.remisionData.medico_remitido_id = 0;
  }

  onSubmit() {
    if (this.remisionData.medico_remitente_id && 
        this.remisionData.medico_remitido_id && 
        this.remisionData.motivo_remision.trim()) {
      
      this.loading = true;
      
      this.remisionService.crearRemision(this.remisionData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.remisionCreated.emit(response.data);
            this.closeModal();
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error creating remision:', error);
          alert('Error al crear la remisión. Por favor, intente nuevamente.');
          this.loading = false;
        }
      });
    }
  }

  closeModal() {
    this.isOpen = false;
    this.close.emit();
  }

  getInitials(nombres: string, apellidos: string): string {
    const firstInitial = nombres.charAt(0).toUpperCase();
    const lastInitial = apellidos.charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  }
}
