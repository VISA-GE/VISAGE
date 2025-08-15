import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

export interface ConfirmationDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'lib-confirmation-dialog',
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
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
}
