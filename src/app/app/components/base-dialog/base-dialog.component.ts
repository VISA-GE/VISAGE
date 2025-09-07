import {
  Component,
  inject,
  TemplateRef,
  ViewChild,
  ContentChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef } from '@angular/cdk/dialog';

export interface BaseDialogConfig {
  title?: string;
  showCloseButton?: boolean;
  maxWidth?: string;
  maxHeight?: string;
}

@Component({
  selector: 'lib-base-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-lg shadow-xl w-full overflow-auto flex flex-col"
      [style.max-width]="maxWidth"
      [style.max-height]="maxHeight"
    >
      <!-- Header -->
      <div
        class="p-6 border-b border-neutral-200 flex justify-between items-center bg-white"
      >
        <h2 class="text-lg font-semibold text-neutral-900">
          {{ title }}
        </h2>
        <button
          *ngIf="showCloseButton"
          (click)="dialogRef.close()"
          class="text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto">
        <ng-content></ng-content>
      </div>

      <!-- Footer (optional) -->
      <div
        *ngIf="footerTemplate"
        class="p-6 pt-0 border-t border-neutral-200 bg-white"
      >
        <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        max-height: 90vh;
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
export class BaseDialogComponent {
  dialogRef = inject(DialogRef);

  @ContentChild('footer') footerTemplate?: TemplateRef<any>;

  title: string = '';
  showCloseButton: boolean = true;
  maxWidth: string = 'max-w-2xl';
  maxHeight: string = 'max-h-[90vh]';

  protected setConfig(config: BaseDialogConfig) {
    this.title = config.title || '';
    this.showCloseButton = config.showCloseButton !== false;
    this.maxWidth = config.maxWidth || 'max-w-2xl';
    this.maxHeight = config.maxHeight || 'max-h-[90vh]';
  }
}
