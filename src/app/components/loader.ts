import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (open) {
      <div class="modal-backdrop" (click)="onBackdropClick()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3 class="modal__title">{{ title }}</h3>
          <p class="modal__text">
            {{ message }}
          </p>

          <div class="modal__actions">
            <button
              type="button"
              class="btn-ghost"
              (click)="cancel.emit()"
            >
              {{ cancelText }}
            </button>

            <button
              type="button"
              class="btn-danger"
              (click)="confirm.emit()"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
    }

    .modal {
      background-color: #ffffff;
      border-radius: 0.5rem;
      padding: 1.5rem;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.2);
    }

    .modal__title {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .modal__text {
      font-size: 0.875rem;
      color: #4b5563;
      margin-bottom: 1.25rem;
    }

    .modal__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn-ghost {
      padding: 0.4rem 0.9rem;
      border-radius: 0.375rem;
      border: 1px solid #d1d5db;
      background: #ffffff;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .btn-danger {
      padding: 0.4rem 0.9rem;
      border-radius: 0.375rem;
      border: none;
      background: #b91c1c;
      color: #ffffff;
      font-size: 0.875rem;
      cursor: pointer;
    }
  `],
})
export class ConfirmDialogComponent {
    @Input() open = false;
    @Input() title = 'Confirm';
    @Input() message = 'Are you sure?';
    @Input() confirmText = 'Confirm';
    @Input() cancelText = 'Cancel';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onBackdropClick() {
        this.cancel.emit();
    }
}
