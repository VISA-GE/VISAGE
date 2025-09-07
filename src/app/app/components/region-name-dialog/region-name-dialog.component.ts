import { Component, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { SimpleDialogComponent } from '../simple-dialog/simple-dialog.component';

export interface RegionNameDialogData {
  title?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'lib-region-name-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SimpleDialogComponent],
  template: `
    <lib-simple-dialog [title]="dialogTitle" maxWidth="max-w-md">
      <div class="mb-4">
        <label
          for="regionName"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Region Name
        </label>
        <input
          type="text"
          id="regionName"
          [(ngModel)]="regionName"
          [placeholder]="dialogPlaceholder"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          (keyup.enter)="onConfirm()"
          autofocus
        />
      </div>

      <ng-template #footer>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            {{ dialogCancelText }}
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            [disabled]="!regionName.trim()"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ dialogConfirmText }}
          </button>
        </div>
      </ng-template>
    </lib-simple-dialog>
  `,
  styleUrl: './region-name-dialog.component.css',
})
export class RegionNameDialogComponent implements OnInit {
  dialogRef = inject<DialogRef<string>>(DialogRef);
  data = inject<RegionNameDialogData>(DIALOG_DATA, { optional: true });

  // Input properties for direct usage
  title = input<string>('Name Region');
  placeholder = input<string>('Enter region name...');
  confirmText = input<string>('Save');
  cancelText = input<string>('Cancel');

  regionName = '';

  // Computed properties that use injected data if available
  get dialogTitle(): string {
    return this.data?.title || this.title();
  }

  get dialogPlaceholder(): string {
    return this.data?.placeholder || this.placeholder();
  }

  get dialogConfirmText(): string {
    return this.data?.confirmText || this.confirmText();
  }

  get dialogCancelText(): string {
    return this.data?.cancelText || this.cancelText();
  }

  ngOnInit() {
    // Component initialization if needed
  }

  onConfirm(): void {
    if (this.regionName.trim()) {
      this.dialogRef.close(this.regionName.trim());
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
