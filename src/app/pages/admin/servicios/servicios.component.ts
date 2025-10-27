import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiciosService, Servicio } from '../../../services/servicios.service';
import { EspecialidadService } from '../../../services/especialidad.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class ServiciosComponent implements OnInit {
  servicios: Servicio[] = [];
  especialidades: any[] = [];
  filteredServicios: Servicio[] = [];
  
  // Filtros
  filtroNombre = '';
  filtroEspecialidad = '';
  filtroActivo = '';
  
  // Estados de UI
  loading = false;
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedServicio: Servicio | null = null;
  
  // Formulario
  servicioForm = {
    nombre_servicio: '',
    especialidad_id: null as number | null,
    monto_base: 0,
    activo: true
  };

  constructor(
    private serviciosService: ServiciosService,
    private especialidadService: EspecialidadService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadServicios();
    this.loadEspecialidades();
  }

  loadServicios(): void {
    this.loading = true;
    this.serviciosService.getServicios().subscribe({
      next: (response: any) => {
        console.log('Response from servicios service:', response);
        console.log('Raw servicios data:', response.data);
        
        // Transformar los datos para incluir especialidad_id y especialidad_nombre
        this.servicios = (response.data || []).map((servicio: any) => {
          console.log('Servicio individual:', servicio);
          console.log('Especialidades del servicio:', servicio.especialidades);
          
          return {
          ...servicio,
          especialidad_id: servicio.especialidades?.id,
          especialidad_nombre: servicio.especialidades?.nombre_especialidad
          };
        });
        
        console.log('Servicios transformados:', this.servicios);
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading servicios:', error);
        alert('❌ Error cargando servicios\n\nPor favor, intente nuevamente.');
        this.loading = false;
      }
    });
  }

  loadEspecialidades(): void {
    this.especialidadService.getAllEspecialidades().subscribe({
      next: (response) => {
        this.especialidades = response.data || [];
      },
      error: (error) => {
        console.error('Error loading especialidades:', error);
      }
    });
  }

  openCreateModal(): void {
    this.servicioForm = {
      nombre_servicio: '',
      especialidad_id: null,
      monto_base: 0,
      activo: true
    };
    this.showCreateModal = true;
  }

  openEditModal(servicio: Servicio): void {
    this.selectedServicio = servicio;
    this.servicioForm = {
      nombre_servicio: servicio.nombre_servicio,
      especialidad_id: servicio.especialidad_id,
      monto_base: servicio.monto_base,
      activo: servicio.activo
    };
    this.showEditModal = true;
  }

  saveServicio(): void {
    if (!this.servicioForm.nombre_servicio.trim() || !this.servicioForm.especialidad_id) {
      alert('❌ Por favor complete todos los campos requeridos');
      return;
    }

    const servicioData = {
      ...this.servicioForm,
      especialidad_id: this.servicioForm.especialidad_id || undefined,
      monto_base: Number(this.servicioForm.monto_base)
    };

    if (this.showEditModal && this.selectedServicio) {
      // Actualizar servicio existente
      this.serviciosService.actualizarServicio(this.selectedServicio.id, servicioData).subscribe({
        next: (response: any) => {
          alert('✅ Servicio actualizado exitosamente');
          this.closeModals();
          this.loadServicios();
        },
        error: (error: any) => {
          console.error('Error updating servicio:', error);
          alert('❌ Error actualizando servicio\n\nPor favor, intente nuevamente.');
        }
      });
    } else {
      // Crear nuevo servicio
      this.serviciosService.crearServicio(servicioData).subscribe({
        next: (response: any) => {
          alert('✅ Servicio creado exitosamente');
          this.closeModals();
          this.loadServicios();
        },
        error: (error: any) => {
          console.error('Error creating servicio:', error);
          alert('❌ Error creando servicio\n\nPor favor, intente nuevamente.');
        }
      });
    }
  }

  confirmDeleteServicio(servicio: Servicio): void {
    this.selectedServicio = servicio;
    this.showDeleteModal = true;
  }

  deleteServicio(): void {
    if (!this.selectedServicio) return;

    this.serviciosService.eliminarServicio(this.selectedServicio.id).subscribe({
      next: (response: any) => {
        alert('✅ Servicio eliminado exitosamente');
        this.closeModals();
        this.loadServicios();
      },
      error: (error: any) => {
        console.error('Error deleting servicio:', error);
        alert('❌ Error eliminando servicio\n\nPor favor, intente nuevamente.');
      }
    });
  }

  toggleActivo(servicio: Servicio): void {
    const updatedData = { ...servicio, activo: !servicio.activo };
    this.serviciosService.actualizarServicio(servicio.id, updatedData).subscribe({
      next: (response: any) => {
        servicio.activo = !servicio.activo;
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('Error toggling servicio status:', error);
        alert('❌ Error cambiando estado del servicio');
      }
    });
  }

  applyFilters(): void {
    this.filteredServicios = this.servicios.filter(servicio => {
      const matchesNombre = !this.filtroNombre || 
        servicio.nombre_servicio.toLowerCase().includes(this.filtroNombre.toLowerCase());
      
      const matchesEspecialidad = !this.filtroEspecialidad || 
        servicio.especialidad_id === Number(this.filtroEspecialidad);
      
      const matchesActivo = this.filtroActivo === '' || 
        (this.filtroActivo === 'activo' && servicio.activo) ||
        (this.filtroActivo === 'inactivo' && !servicio.activo);
      
      return matchesNombre && matchesEspecialidad && matchesActivo;
    });
  }

  clearFilters(): void {
    this.filtroNombre = '';
    this.filtroEspecialidad = '';
    this.filtroActivo = '';
    this.applyFilters();
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedServicio = null;
  }

  getEspecialidadNombre(especialidadId: number): string {
    console.log('Buscando especialidad para ID:', especialidadId);
    console.log('Servicios disponibles:', this.servicios);
    console.log('Especialidades disponibles:', this.especialidades);
    
    // Primero buscar en los servicios si ya tienen el nombre de especialidad
    const servicio = this.servicios.find(s => s.especialidad_id === especialidadId);
    if (servicio && servicio.especialidad_nombre) {
      console.log('Encontrado en servicio:', servicio.especialidad_nombre);
      return servicio.especialidad_nombre;
    }
    
    // Si no, buscar en la lista de especialidades
    const especialidad = this.especialidades.find(e => e.id === especialidadId);
    console.log('Especialidad encontrada:', especialidad);
    return especialidad ? especialidad.nombre_especialidad : 'N/A';
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.rol === 'administrador';
  }
}