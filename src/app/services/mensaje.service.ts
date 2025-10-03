import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensajeDifusion, MensajeDestinatario, MensajeFormData, PacienteParaDifusion, MensajeEstadisticas } from '../models/mensaje.model';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private readonly API_URL = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // Obtener todos los mensajes
  getMensajes(): Observable<{success: boolean, data: MensajeDifusion[]}> {
    return this.http.get<{success: boolean, data: MensajeDifusion[]}>(`${this.API_URL}/mensajes`);
  }

  // Obtener mensaje por ID
  getMensajeById(id: number): Observable<{success: boolean, data: MensajeDifusion}> {
    return this.http.get<{success: boolean, data: MensajeDifusion}>(`${this.API_URL}/mensajes/${id}`);
  }

  // Crear mensaje
  crearMensaje(mensaje: MensajeFormData): Observable<{success: boolean, data: MensajeDifusion}> {
    return this.http.post<{success: boolean, data: MensajeDifusion}>(`${this.API_URL}/mensajes`, mensaje);
  }

  // Actualizar mensaje
  actualizarMensaje(id: number, mensaje: Partial<MensajeFormData>): Observable<{success: boolean, data: MensajeDifusion}> {
    return this.http.put<{success: boolean, data: MensajeDifusion}>(`${this.API_URL}/mensajes/${id}`, mensaje);
  }

  // Eliminar mensaje
  eliminarMensaje(id: number): Observable<{success: boolean}> {
    return this.http.delete<{success: boolean}>(`${this.API_URL}/mensajes/${id}`);
  }

  // Obtener pacientes para difusión
  getPacientesParaDifusion(filtros?: any): Observable<{success: boolean, data: PacienteParaDifusion[]}> {
    return this.http.get<{success: boolean, data: PacienteParaDifusion[]}>(`${this.API_URL}/mensajes/pacientes`, {
      params: filtros || {}
    });
  }

  // Enviar mensaje
  enviarMensaje(id: number): Observable<{success: boolean}> {
    return this.http.post<{success: boolean}>(`${this.API_URL}/mensajes/${id}/enviar`, {});
  }

  // Programar mensaje
  programarMensaje(id: number, fechaProgramado: string): Observable<{success: boolean}> {
    return this.http.post<{success: boolean}>(`${this.API_URL}/mensajes/${id}/programar`, {
      fecha_programado: fechaProgramado
    });
  }

  // Obtener destinatarios de un mensaje
  getDestinatarios(mensajeId: number): Observable<{success: boolean, data: MensajeDestinatario[]}> {
    return this.http.get<{success: boolean, data: MensajeDestinatario[]}>(`${this.API_URL}/mensajes/${mensajeId}/destinatarios`);
  }

  // Obtener estadísticas
  getEstadisticas(): Observable<{success: boolean, data: MensajeEstadisticas}> {
    return this.http.get<{success: boolean, data: MensajeEstadisticas}>(`${this.API_URL}/mensajes/estadisticas`);
  }

  // Duplicar mensaje
  duplicarMensaje(id: number): Observable<{success: boolean, data: MensajeDifusion}> {
    return this.http.post<{success: boolean, data: MensajeDifusion}>(`${this.API_URL}/mensajes/${id}/duplicar`, {});
  }
}
