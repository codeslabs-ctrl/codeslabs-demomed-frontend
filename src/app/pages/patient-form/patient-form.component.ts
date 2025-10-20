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
  template: `
    <div class="patient-form-page">
      <div class="page-header">
        <h1>{{ isEdit ? 'Editar Paciente' : 'Nuevo Paciente' }}</h1>
        <button type="button" class="btn btn-secondary" (click)="onCancel()">
          ← Volver a Pacientes
        </button>
      </div>

      <form class="patient-form" (ngSubmit)="onSubmit(patientForm)" #patientForm="ngForm">
        
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
                placeholder="Ingrese los nombres"
                #nombres="ngModel">
              <div class="error-message" *ngIf="nombres.invalid && nombres.touched">
                <span *ngIf="nombres.errors?.['required']">Los nombres son requeridos</span>
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
                placeholder="Ingrese los apellidos"
                #apellidos="ngModel">
              <div class="error-message" *ngIf="apellidos.invalid && apellidos.touched">
                <span *ngIf="apellidos.errors?.['required']">Los apellidos son requeridos</span>
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
                <span *ngIf="edad.errors?.['required']">La edad es requerida</span>
                <span *ngIf="edad.errors?.['min']">La edad debe ser mayor a 0</span>
                <span *ngIf="edad.errors?.['max']">La edad debe ser menor a 120</span>
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
                (blur)="validateEmail()"
                #email="ngModel">
              <div class="error-message" *ngIf="email.invalid && email.touched">
                <span *ngIf="email.errors?.['required']">El email es requerido</span>
                <span *ngIf="email.errors?.['email'] || email.errors?.['pattern']">Ingresa un email válido (ej: usuario&#64;dominio.com)</span>
              </div>
              <div class="error-message" *ngIf="emailExists && email.valid">
                <span class="email-duplicate-error">⚠️ Este email ya está registrado en el sistema</span>
              </div>
              <div class="success-message" *ngIf="emailChecked && !emailExists && email.valid">
                <span class="email-available">✅ Email disponible</span>
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

        <!-- Sección de Historias Clínicas Existentes (solo en modo edición) -->
        <div class="form-section" *ngIf="isEdit && historicos.length > 0">
          <h3>
            Historias Clínicas Existentes
            <span class="history-count" *ngIf="historicos.length > 1">
              ({{ historicos.length }} historias)
            </span>
          </h3>
          
          
          <!-- Selector de Historias Clínicas -->
          <div class="history-selector" *ngIf="historicos.length > 1">
            <label for="historico-select">Seleccionar Historia Clínica para Contexto:</label>
            <select 
              id="historico-select" 
              class="form-control" 
              [value]="historico?.id" 
              (change)="onHistoricoChange($event)">
              <option *ngFor="let h of historicos" [value]="h.id">
                {{ getHistoricoDisplayText(h) }}
              </option>
            </select>
            <div class="history-note" *ngIf="shouldCreateNewHistory">
              <span class="note-icon">ℹ️</span>
              <span class="note-text">Mostrando historia anterior para contexto. Se creará una nueva historia para el médico actual.</span>
            </div>
          </div>

          <!-- Información básica de la Historia Seleccionada -->
          <div class="existing-medical-info" *ngIf="historico">
            <div class="info-item">
              <label>Fecha de Consulta:</label>
              <span>{{ formatDate(historico.fecha_consulta) }}</span>
            </div>
            <div class="info-item" *ngIf="historico.nombre_medico">
              <label>Médico Tratante:</label>
              <span>{{ historico.nombre_medico }}</span>
            </div>
          </div>
        </div>

        <div class="form-section" *ngIf="isEdit">
          <h3>Información Médica</h3>
          <div class="form-group">
            <label class="form-label">Motivo de Consulta *</label>
            <ng-container *ngFor="let _ of [editorKey]; trackBy: trackByEditorKey">
              <app-rich-text-editor
                *ngIf="!loading"
                [value]="patient.motivo_consulta || ''"
                placeholder="Describa el motivo de la consulta"
                (valueChange)="onMotivoConsultaChange($event)">
              </app-rich-text-editor>
            </ng-container>
          </div>
          <div class="form-group">
            <label class="form-label">Diagnóstico</label>
            <ng-container *ngFor="let _ of [editorKey]; trackBy: trackByEditorKey">
              <app-rich-text-editor
                *ngIf="!loading"
                [value]="patient.diagnostico || ''"
                placeholder="Diagnóstico médico"
                (valueChange)="onDiagnosticoChange($event)">
              </app-rich-text-editor>
            </ng-container>
          </div>
          <div class="form-group">
            <label class="form-label">Conclusiones</label>
            <ng-container *ngFor="let _ of [editorKey]; trackBy: trackByEditorKey">
              <app-rich-text-editor
                *ngIf="!loading"
                [value]="patient.conclusiones || ''"
                placeholder="Conclusiones y recomendaciones"
                (valueChange)="onConclusionesChange($event)">
              </app-rich-text-editor>
            </ng-container>
          </div>
          <div class="form-group">
            <label class="form-label">Plan de Tratamiento</label>
            <ng-container *ngFor="let _ of [editorKey]; trackBy: trackByEditorKey">
              <app-rich-text-editor
                *ngIf="!loading"
                [value]="patient.plan || ''"
                placeholder="Plan de acciones a seguir en el tratamiento del paciente"
                (valueChange)="onPlanChange($event)">
              </app-rich-text-editor>
            </ng-container>
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
            [disabled]="loading">
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

      <!-- Botones de acción después de crear paciente exitosamente -->
      <div class="success-actions" *ngIf="showSuccessActions && !isEdit">
        <div class="success-message">
          <h3>✅ Paciente creado exitosamente</h3>
          <p>¿Qué deseas hacer ahora?</p>
        </div>
        <div class="action-buttons">
          <button type="button" class="btn btn-secondary" (click)="goToPatients()">
            ← Volver a Pacientes
          </button>
          <button type="button" class="btn btn-primary" (click)="createConsulta()">
            📅 Nueva Consulta
          </button>
        </div>
      </div>

      <div class="loading" *ngIf="loading && !isEdit">
        <div class="spinner"></div>
        <p>Cargando datos del paciente...</p>
      </div>

      <!-- Sección de Archivos Anexos Existentes (solo en modo edición) -->
      <div class="form-section" *ngIf="isEdit && archivos.length > 0">
        <h3 class="archivos-title">Archivos Anexos Existentes</h3>
        <div class="archivos-container">
          <div class="archivo-item-enhanced" *ngFor="let archivo of archivos">
            <div class="archivo-header">
              <div class="archivo-icono">
                <span [innerHTML]="getFileIcon(archivo.tipo_mime)"></span>
              </div>
              <div class="archivo-info">
                <div class="archivo-nombre">{{ archivo.nombre_original }}</div>
                <div class="archivo-descripcion" *ngIf="archivo.descripcion">
                  <i class="fas fa-file-alt"></i> {{ archivo.descripcion }}
                </div>
                <div class="archivo-meta">
                  <span class="archivo-tipo">{{ getFileType(archivo.tipo_mime) }}</span>
                  <span class="archivo-tamano">{{ formatFileSize(archivo.tamano_bytes) }}</span>
                  <span class="archivo-fecha">{{ formatDate(archivo.fecha_subida || '') }}</span>
                </div>
              </div>
            </div>
            <div class="archivo-actions">
              <button class="btn-download" (click)="downloadFile(archivo)" title="Descargar">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              </button>
              <button class="btn-edit" (click)="editFileDescription(archivo)" title="Editar descripción">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
              <button class="btn-delete" (click)="deleteArchivo(archivo.id!)" title="Eliminar">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Componente de archivos anexos -->
      <!-- Sección de Archivos Anexos eliminada - solo se mantiene "Archivos Anexos Existentes" -->

      <app-file-upload 
        *ngIf="canUploadFiles()" 
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

    .archivos-title {
      margin-top: 2rem !important;
    }

    /* Estilos para botones de éxito */
    .success-actions {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #0ea5e9;
      border-radius: 1rem;
      padding: 2rem;
      margin-top: 2rem;
      text-align: center;
    }

    .success-message h3 {
      color: #0c4a6e;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    .success-message p {
      color: #0369a1;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-buttons .btn {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 0.75rem;
      transition: all 0.3s ease;
    }

    .action-buttons .btn-secondary {
      background: linear-gradient(135deg, #6b7280, #4b5563);
      color: white;
      border: none;
    }

    .action-buttons .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
    }

    .action-buttons .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
    }

    .action-buttons .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

    .success-message {
      color: #10b981;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .email-duplicate-error {
      color: #ef4444;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .email-available {
      color: #10b981;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.25rem;
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

    /* Estilos para historias clínicas existentes */
    .history-count {
      font-size: 0.875rem;
      font-weight: 500;
      color: #f5576c;
      background: #fce7f3;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      margin-left: 0.5rem;
    }

    .history-selector {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .history-selector label {
      display: block;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      background: white;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #f5576c;
      box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
    }

    .existing-medical-info {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .existing-medical-info .info-item {
      margin-bottom: 1rem;
    }

    .existing-medical-info .info-item:last-child {
      margin-bottom: 0;
    }

    .existing-medical-info label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      display: block;
      margin-bottom: 0.25rem;
    }

    .existing-medical-info span {
      color: #1e293b;
      font-size: 0.875rem;
    }

    .existing-medical-info .info-text {
      color: #1e293b;
      font-size: 0.875rem;
      line-height: 1.6;
      margin: 0;
      padding: 0.5rem;
      background: white;
      border-radius: 0.375rem;
      border-left: 3px solid #f5576c;
    }


    .history-note {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      color: #92400e;
    }

    .note-icon {
      font-size: 1rem;
      flex-shrink: 0;
    }

    .note-text {
      flex: 1;
    }

    /* Estilos para archivos anexos mejorados */
    .archivos-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .archivo-item-enhanced {
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .archivo-item-enhanced:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-color: #cbd5e1;
    }

    .archivo-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .archivo-icono {
      font-size: 2rem;
      color: #3b82f6;
      flex-shrink: 0;
    }

    .archivo-info {
      flex: 1;
    }

    .archivo-nombre {
      font-weight: 600;
      color: #1e293b;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    .archivo-descripcion {
      background: #e0f2fe;
      padding: 0.75rem;
      border-radius: 0.5rem;
      margin: 0.75rem 0;
      font-style: italic;
      color: #0369a1;
      border-left: 4px solid #0ea5e9;
      font-size: 0.9rem;
    }

    .archivo-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .archivo-tipo {
      background: #dbeafe;
      color: #1e40af;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .archivo-tamano {
      color: #64748b;
      font-size: 0.875rem;
    }

    .archivo-fecha {
      color: #64748b;
      font-size: 0.875rem;
    }

    .archivo-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn-download, .btn-edit, .btn-delete {
      color: white;
      border: none;
      border-radius: 0.5rem;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
    }

    .btn-download {
      background: #3b82f6;
    }

    .btn-edit {
      background: #f59e0b;
    }

    .btn-delete {
      background: #ef4444;
    }

    .btn-download:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-edit:hover {
      background: #d97706;
      transform: translateY(-1px);
    }

    .btn-delete:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }

    .btn-download .btn-icon, .btn-edit .btn-icon, .btn-delete .btn-icon {
      width: 16px;
      height: 16px;
    }

    /* Estilos para mensaje informativo de archivos */
    .info-message {
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 0.75rem;
      padding: 1.5rem;
      text-align: center;
    }

    .info-message h3 {
      color: #0369a1;
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
    }

    .info-message p {
      color: #0369a1;
      margin: 0;
      font-size: 1rem;
    }

    .info-message strong {
      color: #0c4a6e;
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
              // Actualizar también los campos médicos en el historico si hay cambios
              this.updateMedicalData();
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

  updateMedicalData() {
    if (this.shouldCreateNewHistory) {
      // Crear nueva historia médica para el médico actual
      console.log('🆕 Creando nueva historia médica para médico:', this.currentMedicoId);
      this.createNewMedicalHistory();
    } else if (this.historico && this.historico.id) {
      // Actualizar historia médica existente del mismo médico
      const medicalData = {
        motivo_consulta: this.patient.motivo_consulta,
        diagnostico: this.patient.diagnostico,
        conclusiones: this.patient.conclusiones,
        plan: this.patient.plan
      };
      
      console.log('🔄 Actualizando historia médica existente:', this.historico.id);
      this.historicoService.updateHistorico(this.historico.id, medicalData).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('✅ Datos médicos actualizados correctamente');
            this.router.navigate(['/patients']);
          } else {
            console.error('❌ Error actualizando datos médicos:', response.error);
            alert('❌ Error al actualizar los datos médicos\n\nNo se pudieron guardar los cambios. Por favor, verifique su conexión e intente nuevamente.');
          }
        },
        error: (error) => {
          console.error('❌ Error actualizando datos médicos:', error);
          alert('❌ Error al actualizar los datos médicos\n\nError de conexión. Por favor, verifique su internet e intente nuevamente.');
        }
      });
    } else {
      // Si no hay historico, crear nueva historia médica
      console.log('🔄 No hay historia médica existente, creando nueva...');
      this.createNewMedicalHistory();
    }
  }

  createNewMedicalHistory() {
    if (this.patientId) {
      // Obtener el medico_id del usuario autenticado
      const currentUser = this.authService.getCurrentUser();
      const medicoId = currentUser?.medico_id;
      
      if (!medicoId) {
        console.error('❌ No se encontró medico_id en el usuario autenticado');
        console.error('❌ Usuario actual:', currentUser);
        alert('❌ Error de autenticación\n\nNo se pudo identificar el médico actual. Por favor, cierre sesión e inicie sesión nuevamente.');
        return;
      }

      const medicalData = {
        paciente_id: this.patientId,
        medico_id: medicoId,
        motivo_consulta: this.patient.motivo_consulta || '',
        diagnostico: this.patient.diagnostico || '',
        conclusiones: this.patient.conclusiones || '',
        plan: this.patient.plan || '',
        fecha_consulta: new Date().toISOString().split('T')[0] // Fecha actual
      };
      
      console.log('🔄 Creando nueva historia médica:', medicalData);
      console.log('🔍 Datos enviados al backend:', JSON.stringify(medicalData, null, 2));
      
      this.historicoService.createHistorico(medicalData).subscribe({
        next: (response) => {
          console.log('✅ Respuesta del backend:', response);
          if (response.success) {
            console.log('✅ Nueva historia médica creada correctamente');
            this.router.navigate(['/patients']);
          } else {
            console.error('❌ Error creando historia médica:', response.error);
            alert('❌ Error al crear la historia médica\n\n' + (response.error?.message || 'Error desconocido') + '\n\nPor favor, intente nuevamente o contacte al administrador.');
          }
        },
        error: (error) => {
          console.error('❌ Error creando historia médica:', error);
          console.error('❌ Error completo:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error message:', error.message);
          if (error.error) {
            console.error('❌ Error details:', error.error);
          }
          alert('❌ Error al crear la historia médica\n\n' + (error.error?.message || error.message || 'Error desconocido') + '\n\nPor favor, verifique su conexión e intente nuevamente.');
        }
      });
    } else {
      console.error('❌ No hay patientId para crear historia médica');
      this.router.navigate(['/patients']);
    }
  }

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
            // Recargar archivos
            if (this.historico) {
              this.loadArchivos(this.historico.id);
            }
          }
        },
        error: (error) => {
          console.error('Error deleting archivo:', error);
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
        console.error('Error downloading file:', error);
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