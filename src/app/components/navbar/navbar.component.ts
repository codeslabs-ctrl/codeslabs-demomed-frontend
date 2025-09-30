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
        <button class="logout-btn" (click)="logout()" title="Cerrar Sesión">
          <svg class="logout-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>
      
      <div class="navbar-user" *ngIf="currentUser">
        <div class="user-info">
          <span class="user-name">{{ getDoctorFullName() }}</span>
          <span class="user-role">{{ currentUser.rol }}</span>
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
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
      }

      .user-info {
        align-items: center;
        width: 100%;
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
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Suscribirse a los cambios del usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
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
}
