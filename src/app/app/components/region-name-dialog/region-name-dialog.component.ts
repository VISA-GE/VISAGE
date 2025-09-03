import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

export interface RegionNameDialogData {
  title?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'lib-region-name-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './region-name-dialog.component.html',
  styleUrl: './region-name-dialog.component.css',
})
export class RegionNameDialogComponent {
  dialogRef = inject<DialogRef<string>>(DialogRef);
  data = inject<RegionNameDialogData>(DIALOG_DATA, { optional: true });

  // Input properties for direct usage
  title = input<string>('Name Region');
  placeholder = input<string>('Enter region name...');
  confirmText = input<string>('Save');
  cancelText = input<string>('Cancel');

  regionName = '';

  onConfirm(): void {
    if (this.regionName.trim()) {
      this.dialogRef.close(this.regionName.trim());
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
