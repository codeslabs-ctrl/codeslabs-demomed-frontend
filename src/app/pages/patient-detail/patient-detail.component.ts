import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { PatientWithHistoryService, PatientWithHistorialResponse } from '../../services/patient-with-history.service';
import { Patient, PatientHistory } from '../../models/patient.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="patient-detail-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Detalles del Paciente</h1>
          <div class="header-actions">
            <a routerLink="/patients" class="btn btn-secondary">
              ← Volver a Pacientes
            </a>
            <a [routerLink]="['/patients', patient?.id, 'edit']" class="btn btn-primary">
              ✏️ Editar Paciente
            </a>
          </div>
        </div>
      </div>

      <div class="patient-detail" *ngIf="patient && !loading">
        <div class="patient-header">
          <div class="patient-avatar">
            <div class="avatar-circle">
              {{ getInitials(patient.nombres, patient.apellidos) }}
            </div>
          </div>
          <div class="patient-info">
            <h2>{{ patient.nombres }} {{ patient.apellidos }}</h2>
            <p class="patient-meta">
              {{ patient.edad }} años • {{ patient.sexo }}
            </p>
            <p class="patient-contact">
              📧 {{ patient.email }} • 📞 {{ patient.telefono }}
            </p>
          </div>
        </div>

        <div class="patient-sections">
          <div class="section">
            <h3>Información Personal</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombres</label>
                <span>{{ patient.nombres }}</span>
              </div>
              <div class="info-item">
                <label>Apellidos</label>
                <span>{{ patient.apellidos }}</span>
              </div>
              <div class="info-item">
                <label>Edad</label>
                <span>{{ patient.edad }} años</span>
              </div>
              <div class="info-item">
                <label>Sexo</label>
                <span class="sex-badge" [class.female]="patient.sexo === 'Femenino'">
                  {{ patient.sexo }}
                </span>
              </div>
              <div class="info-item">
                <label>Email</label>
                <span>{{ patient.email }}</span>
              </div>
              <div class="info-item">
                <label>Teléfono</label>
                <span>{{ patient.telefono }}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Historia Médica</h3>
            <div class="medical-info" *ngIf="historial && historial.length > 0; else noHistory">
              <div class="history-item" *ngFor="let historia of historial; let i = index">
                <div class="history-header">
                  <h4>Consulta #{{ i + 1 }}</h4>
                  <span class="history-date">{{ formatDate(historia.fecha_consulta) }}</span>
                </div>
                <div class="history-content">
                  <div class="info-item full-width" *ngIf="historia.motivo_consulta">
                    <label>Motivo de Consulta</label>
                    <div class="info-text rich-content" [innerHTML]="historia.motivo_consulta"></div>
                  </div>
                  <div class="info-item full-width" *ngIf="historia.diagnostico">
                    <label>Diagnóstico</label>
                    <div class="info-text rich-content" [innerHTML]="historia.diagnostico"></div>
                  </div>
                  <div class="info-item full-width" *ngIf="historia.conclusiones">
                    <label>Conclusiones</label>
                    <div class="info-text rich-content" [innerHTML]="historia.conclusiones"></div>
                  </div>
                  <div class="info-item full-width" *ngIf="historia.plan">
                    <label>Plan de Tratamiento</label>
                    <div class="info-text rich-content" [innerHTML]="historia.plan"></div>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noHistory>
              <div class="no-history">
                <p>No hay historia médica registrada para este paciente.</p>
                <a [routerLink]="['/patients', patient?.id, 'edit']" class="btn btn-primary">
                  Agregar Historia Médica
                </a>
              </div>
            </ng-template>
          </div>

          <div class="section">
            <h3>Información del Sistema</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Fecha de Creación</label>
                <span>{{ formatDate(patient.fecha_creacion) }}</span>
              </div>
              <div class="info-item">
                <label>Última Actualización</label>
                <span>{{ formatDate(patient.fecha_actualizacion) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="patient-actions">
          <button class="btn btn-danger" (click)="deletePatient()">
            🗑️ Eliminar Paciente
          </button>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando datos del paciente...</p>
      </div>

      <div class="error" *ngIf="error">
        <p>{{ error }}</p>
        <a routerLink="/patients" class="btn btn-primary">
          Volver a Pacientes
        </a>
      </div>
    </div>
  `,
  styles: [`
    .patient-detail-page {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .patient-detail {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .patient-header {
      background: #E91E63;
      color: white;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      box-shadow: 0 4px 12px rgba(233, 30, 99, 0.2);
    }

    .patient-avatar {
      flex-shrink: 0;
    }

    .avatar-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .patient-info h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .patient-meta {
      font-size: 1.1rem;
      margin: 0 0 0.5rem 0;
      opacity: 0.9;
    }

    .patient-contact {
      font-size: 1rem;
      margin: 0;
      opacity: 0.8;
    }

    .patient-sections {
      padding: 2rem;
    }

    .section {
      margin-bottom: 2rem;
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f06292;
      position: relative;
    }

    .section h3::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 30px;
      height: 2px;
      background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
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

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-item label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-item span {
      color: #1e293b;
      font-size: 1rem;
    }

    .info-text {
      color: #2C2C2C;
      font-size: 1rem;
      line-height: 1.6;
      margin: 0;
      padding: 1rem;
      background: #F5F5F5;
      border-radius: 0.5rem;
      border-left: 4px solid #E91E63;
      box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
      font-family: 'Montserrat', sans-serif;
    }

    .rich-content {
      color: #2C2C2C;
      font-size: 1rem;
      line-height: 1.6;
      margin: 0;
      padding: 1rem;
      background: #F5F5F5;
      border-radius: 0.5rem;
      border-left: 4px solid #E91E63;
      box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
      font-family: 'Montserrat', sans-serif;
    }

    .rich-content h1, .rich-content h2, .rich-content h3, .rich-content h4, .rich-content h5, .rich-content h6 {
      color: #2C2C2C;
      font-family: 'Montserrat', sans-serif;
      margin: 1rem 0 0.5rem 0;
      font-weight: 600;
    }

    .rich-content h3 {
      font-size: 1.1rem;
      border-bottom: 2px solid #E91E63;
      padding-bottom: 0.25rem;
    }

    .rich-content p {
      margin: 0.5rem 0;
      color: #2C2C2C;
      font-family: 'Montserrat', sans-serif;
    }

    .rich-content ul, .rich-content ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
      color: #2C2C2C;
      font-family: 'Montserrat', sans-serif;
    }

    .rich-content li {
      margin: 0.25rem 0;
      color: #2C2C2C;
      font-family: 'Montserrat', sans-serif;
    }

    .rich-content strong, .rich-content b {
      font-weight: 600;
      color: #2C2C2C;
    }

    .rich-content em, .rich-content i {
      font-style: italic;
      color: #666666;
    }

    .rich-content u {
      text-decoration: underline;
      color: #E91E63;
    }

    .sex-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      background-color: #e5e7eb;
      color: #374151;
    }

    .sex-badge.female {
      background-color: #fce7f3;
      color: #be185d;
    }

    .patient-actions {
      padding: 1.5rem 2rem;
      background: #F5F5F5;
      border-top: 1px solid #E91E63;
      display: flex;
      justify-content: flex-end;
    }

    .loading, .error {
      text-align: center;
      padding: 2rem;
    }

    .loading p, .error p {
      margin-top: 1rem;
      color: #64748b;
    }

    .error p {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .header-content h1 {
        font-size: 1.5rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .header-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .patient-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
        padding: 1.5rem;
      }

      .patient-info h2 {
        font-size: 1.5rem;
      }

      .patient-meta {
        font-size: 1rem;
      }

      .patient-contact {
        font-size: 0.9rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .patient-sections {
        padding: 1.5rem;
      }

      .section h3 {
        font-size: 1.125rem;
      }

      .patient-actions {
        justify-content: center;
        padding: 1rem;
      }
    }

    @media (max-width: 480px) {
      .header-content h1 {
        font-size: 1.25rem;
      }

      .patient-header {
        padding: 1rem;
      }

      .patient-info h2 {
        font-size: 1.25rem;
      }

      .avatar-circle {
        width: 60px;
        height: 60px;
        font-size: 1.25rem;
      }

      .patient-sections {
        padding: 1rem;
      }

      .section h3 {
        font-size: 1rem;
      }

      .info-text {
        padding: 0.75rem;
        font-size: 0.9rem;
      }
    }

    .history-item {
      background: #F5F5F5;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border-left: 4px solid #E91E63;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #E91E63;
    }

    .history-header h4 {
      color: #2C2C2C;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
    }

    .history-date {
      background: #E91E63;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .history-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .no-history {
      text-align: center;
      padding: 3rem 2rem;
      color: #666666;
    }

    .no-history p {
      margin: 0 0 1.5rem 0;
      font-size: 1.1rem;
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  historial: PatientHistory[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private patientService: PatientService,
    private patientWithHistoryService: PatientWithHistoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadPatient(id);
    });
  }

  loadPatient(id: number) {
    this.loading = true;
    this.error = null;
    
    this.patientWithHistoryService.getPatientWithHistory(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.patient = response.data.paciente;
          this.historial = response.data.historial;
        } else {
          this.error = 'Paciente no encontrado';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patient:', error);
        this.error = 'Error al cargar los datos del paciente';
        this.loading = false;
      }
    });
  }

  getInitials(nombres: string, apellidos: string): string {
    const firstInitial = nombres.charAt(0).toUpperCase();
    const lastInitial = apellidos.charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  deletePatient() {
    if (this.patient && confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      this.patientService.deletePatient(this.patient?.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/patients']);
          }
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
        }
      });
    }
  }
}
