import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MensajeService } from '../../../services/mensaje.service';
import { MensajeDifusion, MensajeFormData, PacienteParaDifusion } from '../../../models/mensaje.model';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="mensajes-page">
      <div class="page-header">
        <h1>Mensajes de Difusión</h1>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <span>📧</span>
          Nuevo Mensaje
        </button>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Estado:</label>
          <select [(ngModel)]="filtroEstado" (change)="loadMensajes()">
            <option value="">Todos</option>
            <option value="borrador">Borrador</option>
            <option value="programado">Programado</option>
            <option value="enviado">Enviado</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Tipo:</label>
          <select [(ngModel)]="filtroTipo" (change)="loadMensajes()">
            <option value="">Todos</option>
            <option value="general">General</option>
            <option value="urgente">Urgente</option>
            <option value="recordatorio">Recordatorio</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Buscar:</label>
          <input 
            type="text" 
            [(ngModel)]="busqueda" 
            (input)="loadMensajes()"
            placeholder="Buscar por título...">
        </div>
      </div>

      <!-- Lista de mensajes -->
      <div class="mensajes-list">
        <div class="mensaje-card" *ngFor="let mensaje of mensajes">
          <div class="mensaje-header">
            <h3>{{ mensaje.titulo }}</h3>
            <div class="mensaje-actions">
              <button class="btn btn-sm" (click)="viewMensaje(mensaje)" title="Ver">
                👁️
              </button>
              <button class="btn btn-sm" (click)="editMensaje(mensaje)" title="Editar">
                ✏️
              </button>
              <button class="btn btn-sm" (click)="duplicateMensaje(mensaje)" title="Duplicar">
                📋
              </button>
              <button class="btn btn-sm btn-danger" (click)="deleteMensaje(mensaje)" title="Eliminar">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="mensaje-content">
            <p>{{ mensaje.contenido | slice:0:150 }}{{ mensaje.contenido.length > 150 ? '...' : '' }}</p>
          </div>
          
          <div class="mensaje-meta">
            <div class="meta-item">
              <span class="label">Estado:</span>
              <span class="badge" [class]="'badge-' + mensaje.estado">
                {{ getEstadoLabel(mensaje.estado || 'borrador') }}
              </span>
            </div>
            <div class="meta-item">
              <span class="label">Tipo:</span>
              <span>{{ getTipoLabel(mensaje.tipo_mensaje || 'general') }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Destinatarios:</span>
              <span>{{ mensaje.total_destinatarios || 0 }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Fecha:</span>
              <span>{{ formatDate(mensaje.fecha_creacion) }}</span>
            </div>
          </div>

          <div class="mensaje-actions-bottom" *ngIf="mensaje.estado === 'borrador'">
            <button class="btn btn-success" (click)="sendMensaje(mensaje)">
              📤 Enviar Ahora
            </button>
            <button class="btn btn-warning" (click)="scheduleMensaje(mensaje)">
              ⏰ Programar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar mensaje -->
      <div class="modal" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingMensaje ? 'Editar Mensaje' : 'Nuevo Mensaje' }}</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="saveMensaje()" #mensajeForm="ngForm">
              <div class="form-group">
                <label for="titulo">Título *</label>
                <input 
                  type="text" 
                  id="titulo"
                  [(ngModel)]="mensajeData.titulo"
                  name="titulo"
                  required
                  class="form-input"
                  placeholder="Título del mensaje">
              </div>

              <div class="form-group">
                <label for="contenido">Contenido *</label>
                <textarea 
                  id="contenido"
                  [(ngModel)]="mensajeData.contenido"
                  name="contenido"
                  required
                  rows="6"
                  class="form-textarea"
                  placeholder="Escribe el contenido del mensaje aquí..."></textarea>
              </div>

              <div class="form-group">
                <label for="tipo_mensaje">Tipo de Mensaje</label>
                <select 
                  id="tipo_mensaje"
                  [(ngModel)]="mensajeData.tipo_mensaje"
                  name="tipo_mensaje"
                  class="form-select">
                  <option value="general">General</option>
                  <option value="urgente">Urgente</option>
                  <option value="recordatorio">Recordatorio</option>
                </select>
              </div>

              <div class="form-group">
                <label for="fecha_programado">Programar Envío (Opcional)</label>
                <input 
                  type="datetime-local" 
                  id="fecha_programado"
                  [(ngModel)]="mensajeData.fecha_programado"
                  name="fecha_programado"
                  class="form-input">
              </div>

              <!-- Selector de destinatarios -->
              <div class="form-group">
                <label>Destinatarios *</label>
                <div class="destinatarios-section">
                  <div class="destinatarios-filters">
                    <input 
                      type="text" 
                      [(ngModel)]="busquedaPacientes"
                      (input)="filterPacientes()"
                      placeholder="Buscar pacientes..."
                      class="form-input">
                    
                    <div class="quick-select">
                      <button type="button" class="btn btn-sm" (click)="selectAllPacientes()">
                        Seleccionar Todos
                      </button>
                      <button type="button" class="btn btn-sm" (click)="selectActivePacientes()">
                        Solo Activos
                      </button>
                      <button type="button" class="btn btn-sm" (click)="clearSelection()">
                        Limpiar
                      </button>
                    </div>
                  </div>

                  <div class="pacientes-list">
                    <div class="paciente-item" *ngFor="let paciente of pacientesFiltrados">
                      <label class="paciente-checkbox">
                        <input 
                          type="checkbox" 
                          [checked]="paciente.seleccionado"
                          (change)="togglePaciente(paciente)">
                        <span class="paciente-info">
                          <strong>{{ paciente.nombres }} {{ paciente.apellidos }}</strong>
                          <small>{{ paciente.email }}</small>
                          <small *ngIf="paciente.especialidad_nombre">{{ paciente.especialidad_nombre }}</small>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div class="selection-summary">
                    <strong>{{ getSelectedCount() }} pacientes seleccionados</strong>
                  </div>
                </div>
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
              (click)="saveMensaje()"
              [disabled]="!mensajeForm.valid || getSelectedCount() === 0">
              {{ editingMensaje ? 'Actualizar' : 'Crear' }} Mensaje
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mensajes-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      color: #2c3e50;
    }

    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: #555;
      font-size: 0.9rem;
    }

    .filter-group select,
    .filter-group input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .mensajes-list {
      display: grid;
      gap: 1.5rem;
    }

    .mensaje-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
      border-left: 4px solid #3498db;
    }

    .mensaje-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .mensaje-header h3 {
      margin: 0;
      color: #2c3e50;
      flex: 1;
    }

    .mensaje-actions {
      display: flex;
      gap: 0.5rem;
    }

    .mensaje-content {
      margin-bottom: 1rem;
    }

    .mensaje-content p {
      color: #666;
      line-height: 1.5;
      margin: 0;
    }

    .mensaje-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .meta-item .label {
      font-size: 0.8rem;
      color: #888;
      font-weight: 600;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-borrador { background: #f39c12; color: white; }
    .badge-programado { background: #3498db; color: white; }
    .badge-enviado { background: #27ae60; color: white; }

    .mensaje-actions-bottom {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      color: #2c3e50;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #999;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-textarea {
      resize: vertical;
      min-height: 120px;
    }

    .destinatarios-section {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1rem;
    }

    .destinatarios-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      align-items: center;
    }

    .destinatarios-filters input {
      flex: 1;
    }

    .quick-select {
      display: flex;
      gap: 0.5rem;
    }

    .pacientes-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 0.5rem;
    }

    .paciente-item {
      padding: 0.5rem;
      border-bottom: 1px solid #f5f5f5;
    }

    .paciente-item:last-child {
      border-bottom: none;
    }

    .paciente-checkbox {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }

    .paciente-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .paciente-info small {
      color: #666;
      font-size: 0.8rem;
    }

    .selection-summary {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
      text-align: center;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-success {
      background: #27ae60;
      color: white;
    }

    .btn-warning {
      background: #f39c12;
      color: white;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class MensajesComponent implements OnInit {
  mensajes: MensajeDifusion[] = [];
  pacientes: PacienteParaDifusion[] = [];
  pacientesFiltrados: PacienteParaDifusion[] = [];
  
  showModal = false;
  editingMensaje: MensajeDifusion | null = null;
  
  mensajeData: MensajeFormData = {
    titulo: '',
    contenido: '',
    tipo_mensaje: 'general',
    destinatarios: []
  };

  filtroEstado = '';
  filtroTipo = '';
  busqueda = '';
  busquedaPacientes = '';

  constructor(private mensajeService: MensajeService) {}

  ngOnInit() {
    this.loadMensajes();
    this.loadPacientes();
  }

  loadMensajes() {
    this.mensajeService.getMensajes().subscribe({
      next: (response) => {
        if (response.success) {
          this.mensajes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading mensajes:', error);
      }
    });
  }

  loadPacientes() {
    this.mensajeService.getPacientesParaDifusion().subscribe({
      next: (response) => {
        if (response.success) {
          this.pacientes = response.data;
          this.pacientesFiltrados = [...this.pacientes];
        }
      },
      error: (error) => {
        console.error('Error loading pacientes:', error);
      }
    });
  }

  openCreateModal() {
    this.editingMensaje = null;
    this.mensajeData = {
      titulo: '',
      contenido: '',
      tipo_mensaje: 'general',
      destinatarios: []
    };
    this.showModal = true;
  }

  editMensaje(mensaje: MensajeDifusion) {
    this.editingMensaje = mensaje;
    this.mensajeData = {
      titulo: mensaje.titulo,
      contenido: mensaje.contenido,
      tipo_mensaje: mensaje.tipo_mensaje || 'general',
      destinatarios: []
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingMensaje = null;
  }

  saveMensaje() {
    if (this.editingMensaje) {
      this.mensajeService.actualizarMensaje(this.editingMensaje.id!, this.mensajeData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMensajes();
            this.closeModal();
          }
        },
        error: (error) => {
          console.error('Error updating mensaje:', error);
        }
      });
    } else {
      this.mensajeService.crearMensaje(this.mensajeData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMensajes();
            this.closeModal();
          }
        },
        error: (error) => {
          console.error('Error creating mensaje:', error);
        }
      });
    }
  }

  deleteMensaje(mensaje: MensajeDifusion) {
    if (confirm(`¿Estás seguro de que quieres eliminar el mensaje "${mensaje.titulo}"?`)) {
      this.mensajeService.eliminarMensaje(mensaje.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMensajes();
          }
        },
        error: (error) => {
          console.error('Error deleting mensaje:', error);
        }
      });
    }
  }

  sendMensaje(mensaje: MensajeDifusion) {
    if (confirm(`¿Estás seguro de que quieres enviar el mensaje "${mensaje.titulo}"?`)) {
      this.mensajeService.enviarMensaje(mensaje.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMensajes();
          }
        },
        error: (error) => {
          console.error('Error sending mensaje:', error);
        }
      });
    }
  }

  scheduleMensaje(mensaje: MensajeDifusion) {
    const fecha = prompt('Ingresa la fecha y hora para programar el envío (YYYY-MM-DDTHH:MM):');
    if (fecha) {
      this.mensajeService.programarMensaje(mensaje.id!, fecha).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMensajes();
          }
        },
        error: (error) => {
          console.error('Error scheduling mensaje:', error);
        }
      });
    }
  }

  duplicateMensaje(mensaje: MensajeDifusion) {
    this.mensajeService.duplicarMensaje(mensaje.id!).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadMensajes();
        }
      },
      error: (error) => {
        console.error('Error duplicating mensaje:', error);
      }
    });
  }

  viewMensaje(mensaje: MensajeDifusion) {
    alert(`Título: ${mensaje.titulo}\n\nContenido: ${mensaje.contenido}`);
  }

  filterPacientes() {
    if (!this.busquedaPacientes) {
      this.pacientesFiltrados = [...this.pacientes];
    } else {
      this.pacientesFiltrados = this.pacientes.filter(paciente =>
        paciente.nombres.toLowerCase().includes(this.busquedaPacientes.toLowerCase()) ||
        paciente.apellidos.toLowerCase().includes(this.busquedaPacientes.toLowerCase()) ||
        paciente.email.toLowerCase().includes(this.busquedaPacientes.toLowerCase())
      );
    }
  }

  selectAllPacientes() {
    this.pacientesFiltrados.forEach(paciente => {
      paciente.seleccionado = true;
    });
    this.updateDestinatarios();
  }

  selectActivePacientes() {
    // Por ahora selecciona todos, pero se puede implementar lógica más específica
    this.selectAllPacientes();
  }

  clearSelection() {
    this.pacientesFiltrados.forEach(paciente => {
      paciente.seleccionado = false;
    });
    this.updateDestinatarios();
  }

  togglePaciente(paciente: PacienteParaDifusion) {
    paciente.seleccionado = !paciente.seleccionado;
    this.updateDestinatarios();
  }

  updateDestinatarios() {
    this.mensajeData.destinatarios = this.pacientesFiltrados
      .filter(p => p.seleccionado)
      .map(p => p.id);
  }

  getSelectedCount(): number {
    return this.pacientesFiltrados.filter(p => p.seleccionado).length;
  }

  getEstadoLabel(estado: string): string {
    const estados: { [key: string]: string } = {
      'borrador': 'Borrador',
      'programado': 'Programado',
      'enviado': 'Enviado'
    };
    return estados[estado] || estado;
  }

  getTipoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'general': 'General',
      'urgente': 'Urgente',
      'recordatorio': 'Recordatorio'
    };
    return tipos[tipo] || tipo;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
