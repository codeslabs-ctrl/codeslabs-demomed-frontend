import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConsultaService } from '../../../services/consulta.service';
import { PatientService } from '../../../services/patient.service';
import { MedicoService } from '../../../services/medico.service';
import { ConsultaWithDetails, ConsultaFilters, ConsultaFormData } from '../../../models/consulta.model';
import { Patient } from '../../../models/patient.model';
import { Medico } from '../../../services/medico.service';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="consultas-page">
      <!-- Header -->
      <div class="page-header">
        <h1>Gestión de Consultas</h1>
        <button class="btn btn-primary" (click)="showConsultaForm = true">
          ➕ Nueva Consulta
        </button>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="form-group">
            <label for="search">Buscar</label>
            <input
              type="text"
              id="search"
              class="form-control"
              placeholder="Buscar por paciente, médico o motivo..."
              [(ngModel)]="searchQuery"
              (input)="applyFilters()"
            />
          </div>
          <div class="form-group">
            <label for="estado">Estado</label>
            <select id="estado" class="form-control" [(ngModel)]="filters.estado" (change)="applyFilters()">
              <option value="">Todos los estados</option>
              <option value="agendada">Agendada</option>
              <option value="por_agendar">Por Agendar</option>
              <option value="cancelada">Cancelada</option>
              <option value="finalizada">Finalizada</option>
              <option value="reagendada">Reagendada</option>
              <option value="no_asistio">No Asistió</option>
            </select>
          </div>
          <div class="form-group">
            <label for="fecha">Fecha</label>
            <input
              type="date"
              id="fecha"
              class="form-control"
              [(ngModel)]="filters.fecha"
              (change)="applyFilters()"
            />
          </div>
          <div class="form-group">
            <label for="medico">Médico</label>
            <select id="medico" class="form-control" [(ngModel)]="filters.medico_id" (change)="applyFilters()">
              <option value="">Todos los médicos</option>
              <option *ngFor="let medico of medicos" [value]="medico.id">
                {{ medico.nombres }} {{ medico.apellidos }}
              </option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn btn-filter" (click)="applyFilters()">
            <span>🔍</span>
            Filtrar
          </button>
          <button class="btn btn-clear" (click)="clearFilters()">
            <span>🗑️</span>
            Limpiar
          </button>
        </div>
      </div>

      <!-- Tabla de Consultas -->
      <div class="consultas-container">
        <div class="table-container">
          <table class="consultas-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Fecha y Hora</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td colspan="8" class="loading">
                  <div class="spinner"></div>
                  <span>Cargando consultas...</span>
                </td>
              </tr>
              <tr *ngIf="!loading && consultas.length === 0">
                <td colspan="8" class="empty-state">
                  <div class="empty-state-icon">📅</div>
                  <div class="empty-state-title">No hay consultas</div>
                  <div class="empty-state-description">
                    No se encontraron consultas con los filtros aplicados.
                  </div>
                </td>
              </tr>
              <tr *ngFor="let consulta of consultas">
                <td>
                  <div class="paciente-info">
                    <div class="paciente-nombre">{{ consulta.paciente_nombre }} {{ consulta.paciente_apellidos }}</div>
                    <div class="paciente-cedula">Cédula: {{ consulta.paciente_cedula }}</div>
                  </div>
                </td>
                <td>
                  <div class="medico-info">
                    <div class="medico-nombre">{{ consulta.medico_nombre }}</div>
                    <div class="especialidad">{{ consulta.especialidad_nombre }}</div>
                  </div>
                </td>
                <td>
                  <div class="fecha-hora">
                    <div class="fecha">{{ formatDate(consulta.fecha_pautada) }}</div>
                    <div class="hora">{{ formatTime(consulta.hora_pautada) }}</div>
                  </div>
                </td>
                <td>
                  <span class="estado-badge estado-{{ consulta.estado_consulta }}">
                    {{ getEstadoText(consulta.estado_consulta) }}
                  </span>
                </td>
                <td>
                  <span class="prioridad-badge prioridad-{{ consulta.prioridad || 'normal' }}">
                    {{ getPrioridadText(consulta.prioridad) }}
                  </span>
                </td>
                <td>
                  <span class="tipo-badge">{{ getTipoConsultaText(consulta.tipo_consulta) }}</span>
                </td>
                <td>
                  <div class="motivo" [title]="consulta.motivo_consulta">
                    {{ consulta.motivo_consulta }}
                  </div>
                </td>
                <td>
                  <div class="actions-container">
                    <button class="action-btn btn-view" (click)="viewConsulta(consulta)" title="Ver detalles">
                      <span class="btn-icon">👁️</span>
                      <span class="btn-text">Ver</span>
                    </button>
                    <button class="action-btn btn-edit" (click)="editarConsulta(consulta)" title="Editar">
                      <span class="btn-icon">✏️</span>
                      <span class="btn-text">Editar</span>
                    </button>
                    <button 
                      *ngIf="consulta.estado_consulta === 'agendada' || consulta.estado_consulta === 'reagendada'"
                      class="action-btn btn-reschedule" 
                      (click)="reagendarConsulta(consulta)" 
                      title="Reagendar">
                      <span class="btn-icon">📅</span>
                      <span class="btn-text">Reagendar</span>
                    </button>
                    <button 
                      *ngIf="consulta.estado_consulta === 'agendada' || consulta.estado_consulta === 'reagendada'"
                      class="action-btn btn-cancel" 
                      (click)="cancelConsulta(consulta)" 
                      title="Cancelar">
                      <span class="btn-icon">❌</span>
                      <span class="btn-text">Cancelar</span>
                    </button>
                    <button 
                      *ngIf="consulta.estado_consulta === 'agendada' || consulta.estado_consulta === 'reagendada'"
                      class="action-btn btn-complete" 
                      (click)="finalizarConsulta(consulta)" 
                      title="Finalizar">
                      <span class="btn-icon">✅</span>
                      <span class="btn-text">Finalizar</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div class="pagination" *ngIf="totalPages > 1">
          <div class="pagination-info">
            Página {{ currentPage }} de {{ totalPages }}
          </div>
          <div class="pagination-controls">
            <button 
              class="pagination-btn" 
              (click)="goToPage(currentPage - 1)"
              [disabled]="currentPage === 1">
              Anterior
            </button>
            <button 
              *ngFor="let page of getPageNumbers()" 
              class="pagination-btn"
              [class.active]="page === currentPage"
              (click)="goToPage(page)">
              {{ page }}
            </button>
            <button 
              class="pagination-btn" 
              (click)="goToPage(currentPage + 1)"
              [disabled]="currentPage === totalPages">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Ver Consulta -->
      <div class="modal-overlay" *ngIf="showVerModal" (click)="closeVerModal()">
        <div class="modal-content modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Detalles de la Consulta</h3>
            <button class="close-btn" (click)="closeVerModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="consulta-details" *ngIf="selectedConsulta">
              <div class="detail-section">
                <h4>Información del Paciente</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Nombre Completo</label>
                    <span>{{ selectedConsulta.paciente_nombre }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Cédula</label>
                    <span>{{ selectedConsulta.paciente_cedula }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>Información del Médico</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Médico</label>
                    <span>{{ selectedConsulta.medico_nombre }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Especialidad</label>
                    <span>{{ selectedConsulta.especialidad_nombre }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>Detalles de la Consulta</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Fecha</label>
                    <span>{{ formatDate(selectedConsulta.fecha_pautada) }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Hora</label>
                    <span>{{ formatTime(selectedConsulta.hora_pautada) }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Estado</label>
                    <span class="estado-badge estado-{{ selectedConsulta.estado_consulta }}">
                      {{ getEstadoText(selectedConsulta.estado_consulta) }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <label>Prioridad</label>
                    <span class="prioridad-badge prioridad-{{ selectedConsulta.prioridad || 'normal' }}">
                      {{ getPrioridadText(selectedConsulta.prioridad) }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <label>Tipo de Consulta</label>
                    <span>{{ getTipoConsultaText(selectedConsulta.tipo_consulta) }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>Motivo de la Consulta</h4>
                <div class="motivo-content">
                  {{ selectedConsulta.motivo_consulta }}
                </div>
              </div>

              <div class="detail-section" *ngIf="selectedConsulta.diagnostico_preliminar">
                <h4>Diagnóstico Preliminar</h4>
                <div class="motivo-content">
                  {{ selectedConsulta.diagnostico_preliminar }}
                </div>
              </div>

              <div class="detail-section" *ngIf="selectedConsulta.observaciones">
                <h4>Observaciones</h4>
                <div class="motivo-content">
                  {{ selectedConsulta.observaciones }}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeVerModal()">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- Modal Finalizar Consulta -->
      <div class="modal-overlay" *ngIf="showFinalizarModal" (click)="closeFinalizarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Finalizar Consulta</h3>
            <button class="close-btn" (click)="closeFinalizarModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="consulta-info" *ngIf="selectedConsulta">
              <h4>{{ selectedConsulta.paciente_nombre }}</h4>
              <p><strong>Fecha:</strong> {{ formatDate(selectedConsulta.fecha_pautada) }}</p>
              <p><strong>Hora:</strong> {{ formatTime(selectedConsulta.hora_pautada) }}</p>
            </div>

            <div class="form-group">
              <label for="diagnostico">Diagnóstico Preliminar *</label>
              <textarea
                id="diagnostico"
                class="form-control textarea"
                [(ngModel)]="diagnosticoPreliminar"
                placeholder="Ingrese el diagnóstico preliminar..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                class="form-control textarea"
                [(ngModel)]="observacionesFinalizar"
                placeholder="Observaciones adicionales (opcional)..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeFinalizarModal()">Cancelar</button>
            <button 
              class="btn btn-success" 
              (click)="confirmarFinalizar()"
              [disabled]="!diagnosticoPreliminar.trim()">
              Finalizar Consulta
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Cancelar Consulta -->
      <div class="modal-overlay" *ngIf="showCancelarModal" (click)="closeCancelarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Cancelar Consulta</h3>
            <button class="close-btn" (click)="closeCancelarModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="consulta-info" *ngIf="selectedConsulta">
              <h4>{{ selectedConsulta.paciente_nombre }}</h4>
              <p><strong>Fecha:</strong> {{ formatDate(selectedConsulta.fecha_pautada) }}</p>
              <p><strong>Hora:</strong> {{ formatTime(selectedConsulta.hora_pautada) }}</p>
            </div>

            <div class="form-group">
              <label>Motivo de la Cancelación *</label>
              <div class="radio-group">
                <div class="radio-option">
                  <input 
                    type="radio" 
                    id="motivo1" 
                    name="motivoCancelacion" 
                    value="paciente_no_asistio"
                    [(ngModel)]="motivoCancelacion">
                  <label for="motivo1" class="radio-label">Paciente no asistió</label>
                </div>
                <div class="radio-option">
                  <input 
                    type="radio" 
                    id="motivo2" 
                    name="motivoCancelacion" 
                    value="medico_indisponible"
                    [(ngModel)]="motivoCancelacion">
                  <label for="motivo2" class="radio-label">Médico no disponible</label>
                </div>
                <div class="radio-option">
                  <input 
                    type="radio" 
                    id="motivo3" 
                    name="motivoCancelacion" 
                    value="emergencia"
                    [(ngModel)]="motivoCancelacion">
                  <label for="motivo3" class="radio-label">Emergencia médica</label>
                </div>
                <div class="radio-option">
                  <input 
                    type="radio" 
                    id="motivo4" 
                    name="motivoCancelacion" 
                    value="otro"
                    [(ngModel)]="motivoCancelacion">
                  <label for="motivo4" class="radio-label">Otro motivo</label>
                </div>
              </div>
            </div>

            <div class="form-group" *ngIf="motivoCancelacion === 'otro'">
              <label for="detalles">Detalles del Motivo *</label>
              <textarea
                id="detalles"
                class="form-control textarea"
                [(ngModel)]="detallesCancelacion"
                placeholder="Especifique el motivo de la cancelación..."
                required
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeCancelarModal()">Cancelar</button>
            <button 
              class="btn btn-danger" 
              (click)="confirmarCancelar()"
              [disabled]="!motivoCancelacion || (motivoCancelacion === 'otro' && !detallesCancelacion.trim())">
              Cancelar Consulta
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Reagendar Consulta -->
      <div class="modal-overlay" *ngIf="showReagendarModal" (click)="closeReagendarModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Reagendar Consulta</h3>
            <button class="close-btn" (click)="closeReagendarModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="consulta-info" *ngIf="selectedConsulta">
              <h4>{{ selectedConsulta.paciente_nombre }}</h4>
              <p><strong>Fecha actual:</strong> {{ formatDate(selectedConsulta.fecha_pautada) }}</p>
              <p><strong>Hora actual:</strong> {{ formatTime(selectedConsulta.hora_pautada) }}</p>
            </div>

            <div class="form-group">
              <label for="nuevaFecha">Nueva Fecha *</label>
              <input
                type="date"
                id="nuevaFecha"
                class="form-control"
                [(ngModel)]="nuevaFecha"
                [min]="getTodayDate()"
                required
              />
            </div>

            <div class="form-group">
              <label for="nuevaHora">Nueva Hora *</label>
              <input
                type="time"
                id="nuevaHora"
                class="form-control"
                [(ngModel)]="nuevaHora"
                required
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeReagendarModal()">Cancelar</button>
            <button 
              class="btn btn-primary" 
              (click)="confirmarReagendar()"
              [disabled]="!nuevaFecha || !nuevaHora">
              Reagendar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos completos para el componente de consultas */
    .consultas-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      background: #f8fafc;
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover {
      background: #059669;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-info {
      background: #06b6d4;
      color: white;
    }

    .btn-info:hover {
      background: #0891b2;
    }

    .btn-warning {
      background: #f59e0b;
      color: white;
    }

    .btn-warning:hover {
      background: #d97706;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
    }

    .btn-outline:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1rem;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn:disabled:hover {
      transform: none;
    }

    .filters-section {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr auto;
      gap: 1rem;
      align-items: end;
    }

    .filter-actions {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .btn-filter {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-filter:hover {
      background: #059669;
    }

    .btn-clear {
      background: #6b7280;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-clear:hover {
      background: #4b5563;
    }

    .consultas-container {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .table-container {
      overflow-x: auto;
    }

    .consultas-table {
      width: 100%;
      border-collapse: collapse;
    }

    .consultas-table th {
      background: #f8fafc;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .consultas-table td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      color: #374151;
    }

    .consultas-table tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .consultas-table tr:nth-child(odd) {
      background-color: #ffffff;
    }

    .consultas-table tr:hover {
      background: #e0f2fe;
    }

    .paciente-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .paciente-nombre {
      font-weight: 600;
      color: #1e293b;
    }

    .paciente-cedula {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .medico-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .medico-nombre {
      font-weight: 600;
      color: #1e293b;
    }

    .especialidad {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .fecha-hora {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .fecha {
      font-weight: 600;
      color: #1e293b;
    }

    .hora {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .estado-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .estado-agendada {
      background: #dbeafe;
      color: #1e40af;
    }

    .estado-por_agendar {
      background: #fef3c7;
      color: #92400e;
    }

    .estado-cancelada {
      background: #fee2e2;
      color: #dc2626;
    }

    .estado-finalizada {
      background: #d1fae5;
      color: #059669;
    }

    .estado-reagendada {
      background: #e0e7ff;
      color: #3730a3;
    }

    .estado-no_asistio {
      background: #f3f4f6;
      color: #374151;
    }

    .prioridad-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .prioridad-baja {
      background: #f3f4f6;
      color: #6b7280;
    }

    .prioridad-normal {
      background: #dbeafe;
      color: #1e40af;
    }

    .prioridad-alta {
      background: #fef3c7;
      color: #92400e;
    }

    .prioridad-urgente {
      background: #fee2e2;
      color: #dc2626;
    }

    .tipo-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
    }

    .motivo {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .actions-container {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      min-width: 100px;
      align-items: center;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0.75rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.7rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      width: 90px;
      justify-content: center;
    }

    .action-btn .btn-icon {
      width: 0.875rem;
      height: 0.875rem;
      font-size: 0.75rem;
    }

    .btn-view {
      background: #dbeafe;
      color: #1e40af;
    }

    .btn-view:hover {
      background: #bfdbfe;
    }

    .btn-edit {
      background: #fef3c7;
      color: #92400e;
    }

    .btn-edit:hover {
      background: #fde68a;
    }

    .btn-cancel {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-cancel:hover {
      background: #fecaca;
    }

    .btn-complete {
      background: #d1fae5;
      color: #059669;
    }

    .btn-complete:hover {
      background: #a7f3d0;
    }

    .btn-reschedule {
      background: #e0e7ff;
      color: #3730a3;
    }

    .btn-reschedule:hover {
      background: #c7d2fe;
    }

    .btn-info {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-info:hover {
      background: #e5e7eb;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: #f8fafc;
    }

    .pagination-info {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
    }

    .pagination-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      color: #374151;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #f3f4f6;
      border-color: #9ca3af;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .empty-state-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .empty-state-description {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid #e5e7eb;
      border-top: 2px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-large {
      max-width: 700px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .modal-footer .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      text-decoration: none;
    }

    .modal-footer .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Estilos para modal Ver Consulta */
    .modal-large {
      max-width: 700px;
    }

    .consulta-details {
      max-height: 60vh;
      overflow-y: auto;
    }

    .detail-section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 0.75rem;
      border: 1px solid #e5e7eb;
    }

    .detail-section h4 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1rem;
      font-weight: 600;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item label {
      font-weight: 600;
      color: #374151;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-item span {
      color: #1e293b;
      font-size: 0.875rem;
    }

    .motivo-content {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
      color: #374151;
      line-height: 1.5;
    }

    /* Estilos para formularios mejorados */
    .textarea {
      resize: vertical;
      min-height: 80px;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background-color 0.2s ease;
    }

    .radio-option:hover {
      background: #f3f4f6;
    }

    .radio-option input[type="radio"] {
      margin: 0;
    }

    .radio-label {
      font-size: 0.875rem;
      color: #374151;
      font-weight: 500;
    }

    .btn-danger {
      background: #dc2626;
      color: white;
    }

    .btn-danger:hover {
      background: #b91c1c;
    }

    .btn-success {
      background: #059669;
      color: white;
    }

    .btn-success:hover {
      background: #047857;
    }

    @media (max-width: 768px) {
      .modal-content {
        margin: 1rem;
        max-width: none;
      }
    }
  `]
})
export class ConsultasComponent implements OnInit {
  consultas: ConsultaWithDetails[] = [];
  loading = false;
  searchQuery = '';
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  // Propiedades para el formulario
  showConsultaForm = false;
  selectedConsulta: ConsultaWithDetails | null = null;

  // Propiedades para filtros
  filters: ConsultaFilters = {
    estado: '',
    fecha: '',
    medico_id: undefined
  };

  // Propiedades para modales
  showVerModal = false;
  showFinalizarModal = false;
  showCancelarModal = false;
  showReagendarModal = false;

  // Propiedades para formularios de modales
  diagnosticoPreliminar = '';
  observacionesFinalizar = '';
  motivoCancelacion = '';
  detallesCancelacion = '';
  nuevaFecha = '';
  nuevaHora = '';

  // Lista de médicos para filtros
  medicos: Medico[] = [];

  constructor(
    private consultaService: ConsultaService,
    private patientService: PatientService,
    private medicoService: MedicoService
  ) {}

  ngOnInit(): void {
    this.loadConsultas();
    this.loadMedicos();
  }

  loadConsultas(): void {
    this.loading = true;
    // Mapear filtros del frontend al formato esperado por el backend
    const searchFilters: any = {
      medico_id: this.filters.medico_id,
      estado_consulta: this.filters.estado,
      fecha_desde: this.filters.fecha,
      fecha_hasta: this.filters.fecha,
      search: this.searchQuery
    };
    
    // Limpiar filtros vacíos
    Object.keys(searchFilters).forEach(key => {
      if (searchFilters[key] === '' || searchFilters[key] === undefined || searchFilters[key] === null) {
        delete searchFilters[key];
      }
    });
    
    this.consultaService.getConsultas(searchFilters)
      .subscribe({
        next: (response) => {
          this.consultas = response.data;
          this.totalPages = 1; // Simplificado por ahora
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading consultas:', error);
          this.loading = false;
        }
      });
  }

  loadMedicos(): void {
    this.medicoService.getAllMedicos().subscribe({
      next: (response) => {
        this.medicos = response.data;
      },
      error: (error) => {
        console.error('Error loading medicos:', error);
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadConsultas();
  }

  clearFilters(): void {
    this.filters = {
      estado: '',
      fecha: '',
      medico_id: undefined
    };
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadConsultas();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadConsultas();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Métodos para acciones de consultas
  viewConsulta(consulta: ConsultaWithDetails): void {
    this.selectedConsulta = consulta;
    this.showVerModal = true;
  }

  editarConsulta(consulta: ConsultaWithDetails): void {
    // Implementar lógica de edición
    console.log('Editar consulta:', consulta);
  }

  reagendarConsulta(consulta: ConsultaWithDetails): void {
    this.selectedConsulta = consulta;
    this.nuevaFecha = consulta.fecha_pautada;
    this.nuevaHora = consulta.hora_pautada;
    this.showReagendarModal = true;
  }

  finalizarConsulta(consulta: ConsultaWithDetails): void {
    this.selectedConsulta = consulta;
    this.diagnosticoPreliminar = '';
    this.observacionesFinalizar = '';
    this.showFinalizarModal = true;
  }

  cancelConsulta(consulta: ConsultaWithDetails): void {
    this.selectedConsulta = consulta;
    this.motivoCancelacion = '';
    this.detallesCancelacion = '';
    this.showCancelarModal = true;
  }

  // Métodos para cerrar modales
  closeVerModal(): void {
    this.showVerModal = false;
    this.selectedConsulta = null;
  }

  closeFinalizarModal(): void {
    this.showFinalizarModal = false;
    this.diagnosticoPreliminar = '';
    this.observacionesFinalizar = '';
    this.selectedConsulta = null;
  }

  closeCancelarModal(): void {
    this.showCancelarModal = false;
    this.motivoCancelacion = '';
    this.detallesCancelacion = '';
    this.selectedConsulta = null;
  }

  closeReagendarModal(): void {
    this.showReagendarModal = false;
    this.nuevaFecha = '';
    this.nuevaHora = '';
    this.selectedConsulta = null;
  }

  // Métodos para confirmar acciones
  confirmarFinalizar(): void {
    if (!this.selectedConsulta || !this.diagnosticoPreliminar.trim()) {
      return;
    }

    const data = {
      diagnostico_preliminar: this.diagnosticoPreliminar,
      observaciones: this.observacionesFinalizar || undefined
    };

    this.consultaService.finalizarConsulta(this.selectedConsulta.id, data).subscribe({
      next: (response) => {
        console.log('Consulta finalizada:', response);
        this.closeFinalizarModal();
        this.loadConsultas();
        alert('Consulta finalizada exitosamente');
      },
      error: (error) => {
        console.error('Error finalizando consulta:', error);
        alert('Error al finalizar la consulta');
      }
    });
  }

  confirmarCancelar(): void {
    if (!this.selectedConsulta || !this.motivoCancelacion) {
      return;
    }

    let motivoFinal = this.motivoCancelacion;
    if (this.motivoCancelacion === 'otro' && this.detallesCancelacion.trim()) {
      motivoFinal = this.detallesCancelacion;
    }

    this.consultaService.cancelarConsulta(this.selectedConsulta.id, motivoFinal).subscribe({
      next: (response) => {
        console.log('Consulta cancelada:', response);
        this.closeCancelarModal();
        this.loadConsultas();
        alert('Consulta cancelada exitosamente');
      },
      error: (error) => {
        console.error('Error cancelando consulta:', error);
        alert('Error al cancelar la consulta');
      }
    });
  }

  confirmarReagendar(): void {
    if (!this.selectedConsulta || !this.nuevaFecha || !this.nuevaHora) {
      return;
    }

    // Implementar lógica de reagendamiento
    console.log('Reagendar consulta:', {
      consulta: this.selectedConsulta,
      nuevaFecha: this.nuevaFecha,
      nuevaHora: this.nuevaHora
    });

    this.closeReagendarModal();
    alert('Funcionalidad de reagendamiento en desarrollo');
  }

  // Métodos de utilidad
  formatDate(dateString: string): string {
    if (!dateString) return '';
    // Crear la fecha directamente sin conversión de zona horaria
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  }

  getEstadoText(estado: string): string {
    const estados: { [key: string]: string } = {
      'agendada': 'Agendada',
      'por_agendar': 'Por Agendar',
      'cancelada': 'Cancelada',
      'finalizada': 'Finalizada',
      'reagendada': 'Reagendada',
      'no_asistio': 'No Asistió'
    };
    return estados[estado] || estado;
  }

  getPrioridadText(prioridad: string): string {
    const prioridades: { [key: string]: string } = {
      'baja': 'Baja',
      'normal': 'Normal',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return prioridades[prioridad] || 'Normal';
  }

  getTipoConsultaText(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'control': 'Control',
      'seguimiento': 'Seguimiento',
      'primera_vez': 'Primera Vez',
      'emergencia': 'Emergencia'
    };
    return tipos[tipo] || tipo;
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
