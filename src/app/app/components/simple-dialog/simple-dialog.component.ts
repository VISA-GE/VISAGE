import { Component, inject, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef } from '@angular/cdk/dialog';

export interface SimpleDialogConfig {
  title?: string;
  showCloseButton?: boolean;
  maxWidth?: string;
}

@Component({
  selector: 'lib-simple-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-lg shadow-xl w-full"
      [style.max-width]="maxWidth"
    >
      <!-- Header -->
      <div class="p-6 border-b border-neutral-200">
        <h2 class="text-lg font-semibold text-neutral-900">
          {{ title }}
        </h2>
      </div>

      <!-- Content -->
      <div class="p-6">
        <ng-content></ng-content>
      </div>

      <!-- Footer (optional) -->
      <div *ngIf="footerTemplate" class="p-6 pt-0">
        <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      ::ng-deep .cdk-dialog-container {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 1rem !important;
      }
    `,
  ],
})
export class SimpleDialogComponent {
  dialogRef = inject(DialogRef);

  @ContentChild('footer') footerTemplate?: TemplateRef<any>;

  title: string = '';
  showCloseButton: boolean = false;
  maxWidth: string = 'max-w-md';

  protected setConfig(config: SimpleDialogConfig) {
    this.title = config.title || '';
    this.showCloseButton = config.showCloseButton || false;
    this.maxWidth = config.maxWidth || 'max-w-md';
  }
}
