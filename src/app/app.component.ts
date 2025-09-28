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
            <div class="logo">
              <img src="assets/LogoFemi.png" alt="FemiMed Logo" class="logo-img">
            </div>
            <nav class="nav-menu">
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9,22 9,12 15,12 15,22"></polyline>
                </svg>
                Dashboard
              </a>
              <a routerLink="/patients" routerLinkActive="active" class="nav-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Pacientes
              </a>
              <a routerLink="/patients/new" class="nav-link btn-new">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Nuevo Paciente
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
      background: #E91E63;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 8px rgba(233, 30, 99, 0.2);
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
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .logo:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    .logo-img {
      height: 40px;
      width: auto;
      border-radius: 8px;
      filter: brightness(1.1) contrast(1.1);
      transition: all 0.3s ease;
    }

    .logo:hover .logo-img {
      transform: scale(1.05);
      filter: brightness(1.2) contrast(1.2);
    }


    .nav-menu {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: background-color 0.2s ease;
      font-family: 'Montserrat', sans-serif;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link svg {
      width: 18px;
      height: 18px;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }

    .btn-new {
      background-color: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      font-weight: 600;
    }

    .btn-new:hover {
      background-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .app-main {
      flex: 1;
      padding: 2rem 0;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .logo-img {
        height: 35px;
      }

      .nav-menu {
        gap: 0.75rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .nav-link {
        padding: 0.4rem 0.8rem;
        font-size: 0.875rem;
      }
    }

    @media (max-width: 480px) {
      .logo-img {
        height: 30px;
      }

      .nav-menu {
        gap: 0.5rem;
        flex-direction: column;
        width: 100%;
      }

      .nav-link {
        padding: 0.5rem 1rem;
        text-align: center;
        width: 100%;
      }
    }
  `]
})
export class AppComponent {
  title = 'femimed-dashboard';
}
