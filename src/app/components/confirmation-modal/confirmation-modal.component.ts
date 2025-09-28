import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3 class="modal-title">{{ title }}</h3>
        </div>
        
        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
          <div class="modal-details" *ngIf="details">
            <div class="detail-item" *ngFor="let detail of details">
              <strong>{{ detail.label }}:</strong>
              <span>{{ detail.value }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            (click)="onCancel()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-danger" 
            (click)="onConfirm()"
            [disabled]="loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="!loading">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            </svg>
            <div class="spinner" *ngIf="loading"></div>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.3s ease-out;
    }

    .modal-container {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease-out;
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 1.5rem 0 1.5rem;
    }

    .modal-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .modal-icon svg {
      width: 24px;
      height: 24px;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2C2C2C;
      margin: 0;
      font-family: 'Montserrat', sans-serif;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-message {
      font-size: 1rem;
      color: #666666;
      margin: 0 0 1rem 0;
      line-height: 1.6;
      font-family: 'Montserrat', sans-serif;
    }

    .modal-details {
      background: #F5F5F5;
      border-radius: 0.5rem;
      padding: 1rem;
      border-left: 4px solid #E91E63;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #E5E5E5;
      font-family: 'Montserrat', sans-serif;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-item strong {
      color: #2C2C2C;
      font-weight: 600;
    }

    .detail-item span {
      color: #666666;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 0 1.5rem 1.5rem 1.5rem;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      border: none;
      font-weight: 600;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .btn svg {
      width: 16px;
      height: 16px;
    }

    .btn-secondary {
      background: #F5F5F5;
      color: #2C2C2C;
      border: 1px solid #E5E5E5;
    }

    .btn-secondary:hover {
      background: #E5E5E5;
      transform: translateY(-1px);
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-danger:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
    }

    .btn-danger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .modal-container {
        width: 95%;
        margin: 1rem;
      }

      .modal-header {
        padding: 1rem 1rem 0 1rem;
      }

      .modal-body {
        padding: 1rem;
      }

      .modal-footer {
        padding: 0 1rem 1rem 1rem;
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isVisible = false;
  @Input() title = 'Confirmar eliminación';
  @Input() message = '¿Estás seguro de que quieres eliminar este elemento?';
  @Input() confirmText = 'Eliminar';
  @Input() details: { label: string; value: string }[] = [];
  @Input() loading = false;
  @Input() allowOverlayClose = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  onOverlayClick(event: Event) {
    if (this.allowOverlayClose) {
      this.cancel.emit();
    }
  }
}
