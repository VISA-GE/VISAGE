import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast/toast.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'lib-toast-container',
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts$(); track toast.id) {
        <lib-toast
          [toast]="toast"
          (onClose)="toastService.remove($event)"
          class="toast-wrapper" />
      }
    </div>
  `,
  styles: []
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
