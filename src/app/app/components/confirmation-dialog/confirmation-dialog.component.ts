import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { SimpleDialogComponent } from '../simple-dialog/simple-dialog.component';

export interface ConfirmationDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'lib-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, SimpleDialogComponent],
  template: `
    <lib-simple-dialog [title]="dialogTitle" maxWidth="max-w-md">
      <p class="text-neutral-700 leading-relaxed">
        {{ dialogMessage }}
      </p>

      <ng-template #footer>
        <div class="flex justify-end gap-3">
          <button
            (click)="dialogRef.close(false)"
            class="px-4 py-2 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors duration-150"
          >
            {{ dialogCancelText }}
          </button>
          <button
            (click)="dialogRef.close(true)"
            class="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-150"
          >
            {{ dialogConfirmText }}
          </button>
        </div>
      </ng-template>
    </lib-simple-dialog>
  `,
  styleUrl: './confirmation-dialog.component.css',
})
export class ConfirmationDialogComponent {
  dialogRef = inject(DialogRef);
  data = inject<ConfirmationDialogData>(DIALOG_DATA, { optional: true });

  // Input properties for direct usage
  title = input<string>();
  message = input<string>();
  confirmText = input<string>();
  cancelText = input<string>();

  // Computed properties that use injected data if available
  get dialogTitle(): string {
    return this.data?.title || this.title() || 'Confirm Action';
  }

  get dialogMessage(): string {
    return (
      this.data?.message ||
      this.message() ||
      'Are you sure you want to continue?'
    );
  }

  get dialogConfirmText(): string {
    return this.data?.confirmText || this.confirmText() || 'Confirm';
  }

  get dialogCancelText(): string {
    return this.data?.cancelText || this.cancelText() || 'Cancel';
  }
}
