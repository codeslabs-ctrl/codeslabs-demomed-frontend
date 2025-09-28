import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container">
          <div class="header-content">
            <!-- Menú hamburguesa -->
            <button class="hamburger-btn" (click)="toggleMobileMenu()" [class.active]="isMobileMenuOpen">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>
            
            <div class="logo">
              <img src="assets/LogoFemiMed.svg" alt="FemiMed Logo" class="logo-img">
            </div>

            <!-- Menú de navegación -->
            <nav class="nav-menu" [class.mobile-open]="isMobileMenuOpen">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-link" (click)="closeMobileMenu()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9,22 9,12 15,12 15,22"></polyline>
                </svg>
                <span>Dashboard</span>
              </a>
              <a routerLink="/patients" routerLinkActive="active" class="nav-link" (click)="closeMobileMenu()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Pacientes</span>
              </a>
              <a routerLink="/patients/new" class="nav-link btn-new" (click)="closeMobileMenu()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Nuevo Paciente</span>
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main class="app-main">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: linear-gradient(135deg, #EA7EC3, #2F90B0);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 4px 20px rgba(234, 126, 195, 0.3);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      transition: all 0.3s ease;
    }


    .logo-img {
      height: 45px;
      width: auto;
      filter: brightness(1.1) contrast(1.1) saturate(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }


    /* Menú hamburguesa */
    .hamburger-btn {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      cursor: pointer;
      padding: 8px;
      z-index: 1001;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .hamburger-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }

    .hamburger-line {
      width: 100%;
      height: 3px;
      background: white;
      border-radius: 2px;
      transition: all 0.3s ease;
      transform-origin: center;
    }

    .hamburger-btn.active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }

    .hamburger-btn.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .hamburger-btn.active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }


    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: relative;
      overflow: hidden;
    }

    .nav-link svg {
      width: 18px;
      height: 18px;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.25);
      font-weight: 600;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    .nav-link.active::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      border-radius: 12px;
      z-index: -1;
    }

    .btn-new {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
      border: 1px solid rgba(255, 255, 255, 0.4);
      font-weight: 600;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    .btn-new::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .btn-new:hover::before {
      left: 100%;
    }

    .btn-new:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2));
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    .app-main {
      flex: 1;
      padding: 2rem 0;
    }

    /* Estilos para el menú hamburguesa en todas las pantallas */
    .nav-menu {
      position: fixed;
      top: 0;
      left: -100%;
      width: 320px;
      height: 100vh;
      background: linear-gradient(135deg, #EA7EC3, #2F90B0);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      padding: 100px 0 0 0;
      gap: 0;
      transition: left 0.3s ease;
      box-shadow: 2px 0 20px rgba(234, 126, 195, 0.3);
      border-radius: 0 20px 20px 0;
      z-index: 1000;
    }

    .nav-menu.mobile-open {
      left: 0;
    }

    .nav-link {
      padding: 1.25rem 2rem;
      font-size: 1.1rem;
      border-radius: 0 12px 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      justify-content: flex-start;
      gap: 1rem;
      margin: 0.25rem 0.5rem 0.25rem 0;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      border-left: 4px solid white;
      transform: translateX(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }

      .logo-img {
        height: 40px;
        filter: brightness(1.1) contrast(1.1) saturate(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .nav-menu {
        width: 280px;
        padding: 80px 0 0 0;
      }
    }

    @media (max-width: 480px) {
      .logo-img {
        height: 35px;
        filter: brightness(1.1) contrast(1.1) saturate(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .nav-menu {
        width: 100%;
      }

      .nav-link {
        padding: 1rem 1.5rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'femimed-dashboard';
  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
