import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiciosService, Servicio } from '../../../services/servicios.service';
import { EspecialidadService } from '../../../services/especialidad.service';
import { AuthService } from '../../../services/auth.service';
import { DateService } from '../../../services/date.service';

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
  
  // Opciones de moneda
  monedas = [
    { code: 'VES', name: 'Bolívar Soberano', symbol: 'Bs.S' },
    { code: 'USD', name: 'Dólar Americano', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$' }
  ];
  
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
    moneda: 'VES' as 'VES' | 'USD' | 'EUR' | 'COP',
    activo: true
  };

  constructor(
    private serviciosService: ServiciosService,
    private especialidadService: EspecialidadService,
    private authService: AuthService,
    private dateService: DateService
  ) {}

  ngOnInit(): void {
    console.log('🔍 ngOnInit - loading:', this.loading);
    this.loadServicios();
    this.loadEspecialidades();
  }

  loadServicios(): void {
    this.loading = true;
    console.log('🔍 Iniciando carga de servicios...');
    this.serviciosService.getServicios().subscribe({
      next: (response: any) => {
        console.log('🔍 Respuesta del backend:', response);
        this.servicios = response.data || [];
        console.log('🔍 Servicios asignados:', this.servicios.length);
        this.applyFilters();
        console.log('🔍 Servicios filtrados:', this.filteredServicios.length);
        this.loading = false;
        console.log('🔍 Loading finalizado - loading:', this.loading);
      },
      error: (error: any) => {
        console.error('❌ Error loading servicios:', error);
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
        console.error('❌ Error loading especialidades:', error);
      }
    });
  }

  openCreateModal(): void {
    this.servicioForm = {
      nombre_servicio: '',
      especialidad_id: null,
      monto_base: 0,
      moneda: 'VES',
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
      moneda: servicio.moneda || 'VES',
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
      nombre_servicio: this.servicioForm.nombre_servicio,
      especialidad_id: Number(this.servicioForm.especialidad_id),
      monto_base: Number(this.servicioForm.monto_base),
      moneda: this.servicioForm.moneda,
      activo: this.servicioForm.activo
    };

    console.log('🔍 Datos del servicio a enviar:', servicioData);
    console.log('🔍 Formulario completo:', this.servicioForm);

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
          console.error('Error details:', error.error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          
          let errorMessage = '❌ Error creando servicio\n\n';
          if (error.error && error.error.error) {
            if (error.error.error.includes('clinica_alias')) {
              errorMessage += '⚠️ Error del servidor: La base de datos no está sincronizada.\n\n';
              errorMessage += 'Por favor, contacte al administrador del sistema.';
            } else {
              errorMessage += `Detalles: ${error.error.error}`;
            }
          } else if (error.error && error.error.message) {
            errorMessage += `Detalles: ${error.error.message}`;
          } else if (error.error && typeof error.error === 'string') {
            errorMessage += `Detalles: ${error.error}`;
          } else {
            errorMessage += 'Por favor, intente nuevamente.';
          }
          
          alert(errorMessage);
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
    console.log('🔍 Aplicando filtros...');
    console.log('🔍 Servicios disponibles:', this.servicios.length);
    console.log('🔍 Filtros:', { nombre: this.filtroNombre, especialidad: this.filtroEspecialidad, activo: this.filtroActivo });
    
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
    
    console.log('🔍 Servicios filtrados:', this.filteredServicios.length);
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
    if (!especialidadId || !this.especialidades.length) {
      return 'N/A';
    }
    
    // Buscar en la lista de especialidades
    const especialidad = this.especialidades.find(e => e.id === especialidadId);
    return especialidad ? especialidad.nombre_especialidad : 'N/A';
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.rol === 'administrador';
  }

  getCurrencySymbol(currencyCode?: string): string {
    return this.dateService.getCurrencySymbol(currencyCode);
  }
}