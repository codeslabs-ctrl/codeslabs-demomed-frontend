import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/dashboard" class="brand-link">
          <img src="assets/LogoFemiMed.svg" alt="FemiMed Logo" class="brand-logo">
        </a>
      </div>
      
      <div class="navbar-menu">
        <a routerLink="/dashboard" class="nav-link" routerLinkActive="active">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          Dashboard
        </a>
        <a routerLink="/patients" class="nav-link" routerLinkActive="active">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5l-1.5-2c-.47-.62-1.21-.99-2.01-.99H9.46c-.8 0-1.54.37-2.01.99L5 10.5l-1.5-2C3.03 8.37 2.29 8 1.5 8H.5l2.54 7.63A1.5 1.5 0 0 0 4.46 18H7v4h2v-4h2v4h2v-4h2v4h2v-4h2v4h2z"/>
          </svg>
          Pacientes
        </a>
      </div>
      
      <div class="navbar-user" *ngIf="currentUser">
        <div class="user-info">
          <span class="user-name">{{ getDoctorFullName() }}</span>
          <span class="user-role">{{ currentUser.rol }}</span>
        </div>
        
        <!-- Menú de Configuración (Settings) -->
        <div class="settings-menu">
          <div class="settings-trigger" [class.active]="showSettingsMenu" (click)="toggleSettingsMenu()">
            <svg class="settings-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </div>
          
          <div class="settings-dropdown" *ngIf="showSettingsMenu">
            <!-- Opciones de Administración (solo para administradores) -->
            <div class="settings-section" *ngIf="currentUser?.rol === 'administrador'">
              <div class="settings-section-title">Administración</div>
              <a routerLink="/admin/medicos" class="settings-item" (click)="closeSettingsMenu()">
                <svg class="settings-item-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5l-1.5-2c-.47-.62-1.21-.99-2.01-.99H9.46c-.8 0-1.54.37-2.01.99L5 10.5l-1.5-2C3.03 8.37 2.29 8 1.5 8H.5l2.54 7.63A1.5 1.5 0 0 0 4.46 18H7v4h2v-4h2v4h2v-4h2v4h2v-4h2v4h2z"/>
                </svg>
                <span>Gestionar Médicos</span>
              </a>
              <a routerLink="/admin/especialidades" class="settings-item" (click)="closeSettingsMenu()">
                <svg class="settings-item-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Gestionar Especialidades</span>
              </a>
              <a routerLink="/admin/consultas" class="settings-item" (click)="closeSettingsMenu()">
                <svg class="settings-item-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <span>Gestionar Consultas</span>
              </a>
              <a routerLink="/statistics" class="settings-item" (click)="closeSettingsMenu()">
                <svg class="settings-item-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
                <span>Ver Estadísticas</span>
              </a>
            </div>
            
            <!-- Separador -->
            <div class="settings-divider" *ngIf="currentUser?.rol === 'administrador'"></div>
            
            <!-- Opciones de Usuario -->
            <div class="settings-section">
              <div class="settings-section-title">Usuario</div>
              <button class="settings-item logout-item" (click)="logout()">
                <svg class="settings-item-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      color: #2C2C2C;
      padding: 1rem 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid #F5F5F5;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
    }

    .brand-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: #2C2C2C;
    }

    .brand-logo {
      height: 45px;
      width: auto;
      object-fit: contain;
      object-position: center;
    }

    .navbar-menu {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .settings-menu {
      position: relative;
    }

    .settings-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #f8fafc;
      color: #6b7280;
      border: 1px solid #e5e7eb;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .settings-trigger:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #374151;
      transform: rotate(90deg);
    }

    .settings-trigger.active {
      background: #667eea;
      border-color: #667eea;
      color: white;
      transform: rotate(90deg);
    }

    .settings-icon {
      width: 16px;
      height: 16px;
    }

    .settings-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      min-width: 240px;
      z-index: 1000;
      margin-top: 0.5rem;
      overflow: hidden;
    }

    .settings-section {
      padding: 0.5rem 0;
    }

    .settings-section-title {
      padding: 0.5rem 1rem 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .settings-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #374151;
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }

    .settings-item:hover {
      background: #f8fafc;
      color: #1e293b;
    }

    .settings-item.logout-item:hover {
      background: #fef2f2;
      color: #dc2626;
    }

    .settings-item-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .settings-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 0.5rem 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: #666666;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
      font-size: 0.9rem;
    }

    .nav-link:hover {
      background-color: #F5F5F5;
      color: #2C2C2C;
      transform: translateY(-2px);
    }

    .nav-link.active {
      background-color: #E91E63;
      color: white;
      box-shadow: 0 4px 8px rgba(233, 30, 99, 0.3);
    }

    .nav-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      background-color: #F5F5F5;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid #E5E5E5;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #2C2C2C;
    }

    .user-role {
      font-size: 0.8rem;
      color: #666666;
      text-transform: capitalize;
    }

    .logout-btn {
      background-color: #F5F5F5;
      border: 1px solid #E5E5E5;
      color: #666666;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .logout-btn:hover {
      background-color: #ef4444;
      border-color: #dc2626;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
    }

    .logout-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .logout-text {
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }

      .navbar-menu {
        gap: 0.25rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .nav-link {
        padding: 0.375rem 0.75rem;
        font-size: 0.8rem;
      }

      .nav-icon {
        width: 16px;
        height: 16px;
      }

      .logout-btn {
        padding: 0.375rem 0.5rem;
        font-size: 0.8rem;
      }

      .logout-icon {
        width: 14px;
        height: 14px;
      }

      .navbar-user {
        flex-direction: row;
        gap: 0.5rem;
        width: 100%;
        justify-content: space-between;
      }

      .user-info {
        align-items: flex-start;
        flex: 1;
      }

      .logout-btn {
        width: 100%;
        padding: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .navbar {
        padding: 0.75rem;
      }

      .brand-logo {
        width: 35px;
        height: 35px;
      }

      .nav-link {
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
      }

      .user-name {
        font-size: 0.85rem;
      }

      .user-role {
        font-size: 0.75rem;
      }
    }

    .admin-menu {
      position: relative;
    }

    .admin-dropdown {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      background: #f8fafc;
      color: #374151;
      border: 1px solid #e5e7eb;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .admin-dropdown:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .admin-dropdown.active {
      background: #e0f2fe;
      border-color: #0ea5e9;
      color: #0369a1;
    }

    .admin-icon {
      width: 16px;
      height: 16px;
    }

    .admin-text {
      font-size: 0.9rem;
    }

    .dropdown-arrow {
      width: 14px;
      height: 14px;
      transition: transform 0.3s ease;
    }

    .dropdown-arrow.rotated {
      transform: rotate(180deg);
    }

    .admin-dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      z-index: 1000;
      margin-top: 0.25rem;
    }

    .admin-menu-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      color: #374151;
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      border-bottom: 1px solid #f3f4f6;
    }

    .admin-menu-item:last-child {
      border-bottom: none;
    }

    .admin-menu-item:hover {
      background: #f8fafc;
      color: #1e293b;
    }

    .admin-menu-icon {
      width: 16px;
      height: 16px;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  showSettingsMenu = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Suscribirse a los cambios del usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.settings-menu')) {
        this.showSettingsMenu = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  getDoctorFullName(): string {
    if (this.currentUser?.nombres && this.currentUser?.apellidos) {
      return `${this.currentUser.nombres} ${this.currentUser.apellidos}`;
    }
    // Si no hay nombres, usar el username pero formateado
    if (this.currentUser?.username) {
      return this.currentUser.username.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'Usuario';
  }

  toggleSettingsMenu() {
    this.showSettingsMenu = !this.showSettingsMenu;
  }

  closeSettingsMenu() {
    this.showSettingsMenu = false;
  }
}
