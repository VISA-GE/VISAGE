import { Component, inject, signal } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NamedGenomicRange, Pathway } from '../../../state.store';
import { HtmlDecodePipe } from '../../pipes/html-decode.pipe';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';

export interface GeneModalData {
  gene: NamedGenomicRange;
  description: Promise<string> | undefined;
  pathways: Pathway[];
}

@Component({
  selector: 'lib-gene-modal',
  imports: [CommonModule, AsyncPipe, HtmlDecodePipe, BaseDialogComponent],
  template: `
    <lib-base-dialog
      [title]="gene.name + ' Details'"
      maxWidth="max-w-2xl"
      maxHeight="max-h-[90vh]"
    >
      <!-- Tab Navigation -->
      <div class="px-6 pt-4 pb-2 bg-white">
        <div class="flex flex-wrap gap-2">
          <button
            class="pill-tab"
            [class.active]="activeTab() === 'info'"
            (click)="setActiveTab('info')"
          >
            Basic Info
          </button>
          <button
            class="pill-tab"
            [class.active]="activeTab() === 'pathways'"
            (click)="setActiveTab('pathways')"
          >
            Pathways @if (pathways.length > 0) {
            <span class="track-count">{{ pathways.length }}</span>
            }
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="px-6 pb-6">
        <!-- Basic Info Tab -->
        @if (activeTab() === 'info') {
        <div class="tab-content-animate">
          <div class="space-y-4">
            <div class="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <h3 class="font-medium text-blue-700 mb-2">Description</h3>
              <p class="text-neutral-700">{{ description | async }}</p>
            </div>

            <div class="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <h3 class="font-medium text-blue-700 mb-2">Genomic Location</h3>
              <p class="text-neutral-700 font-mono">
                {{ gene.chr }}:{{ gene.range?.start }}-{{ gene.range?.end }}
                @if (gene.strand) {
                <span
                  class="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
                  >{{ gene.strand }} strand</span
                >
                }
              </p>
            </div>
          </div>
        </div>
        }

        <!-- Pathways Tab -->
        @if (activeTab() === 'pathways') {
        <div class="tab-content-animate">
          @if (pathways.length === 0) {
          <div
            class="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200"
          >
            <svg
              class="w-12 h-12 mx-auto text-neutral-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <p class="text-neutral-500 font-medium">
              No pathways associated with this gene
            </p>
          </div>
          } @else {
          <div class="rounded-lg border border-neutral-200 overflow-hidden">
            <!-- Table Header -->
            <table class="w-full table-fixed">
              <thead class="bg-neutral-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-[30%]"
                  >
                    Name
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-[45%]"
                  >
                    Description
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-[25%]"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-neutral-200">
                @for (pathway of pathways; track pathway.id) {
                <tr class="hover:bg-neutral-50 transition-colors">
                  <td
                    class="px-6 py-4 text-sm font-medium text-neutral-900 break-words w-[30%]"
                  >
                    {{ pathway.name | htmlDecode }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-neutral-600 break-words w-[45%]"
                  >
                    {{ pathway.description | htmlDecode }}
                  </td>
                  <td class="px-6 py-4 text-sm w-[25%]">
                    <a
                      href="https://www.wikipathways.org/pathways/{{
                        pathway.id
                      }}.html"
                      target="_blank"
                      class="action-btn inline-flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      View
                    </a>
                  </td>
                </tr>
                }
              </tbody>
            </table>
          </div>
          }
        </div>
        }
      </div>

      <!-- Footer -->
      <ng-template #footer>
        <div class="flex justify-end">
          <button
            class="action-btn px-5 py-2.5 rounded-full"
            (click)="dialogRef.close()"
          >
            Close
          </button>
        </div>
      </ng-template>
    </lib-base-dialog>
  `,
  styles: [
    `
      .pill-tab {
        background-color: #f5f5f5;
        color: #374151;
        transition: all 0.2s ease;
        border: 1px solid #e5e5e5;
        display: flex;
        align-items: center;
        position: relative;
        border-radius: 9999px;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
      }

      .pill-tab:hover {
        background-color: #f0f9ff;
        color: #2563eb;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }

      .pill-tab.active {
        background-color: #dbeafe;
        color: #1d4ed8;
        border-color: #93c5fd;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }

      .track-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 500;
        background-color: #e5e5e5;
        color: #374151;
        transition: all 0.2s ease;
        margin-left: 0.25rem;
      }

      .pill-tab:hover .track-count {
        background-color: #bfdbfe;
        color: #1d4ed8;
      }

      .pill-tab.active .track-count {
        background-color: #93c5fd;
        color: #1e40af;
      }

      .action-btn {
        transition: all 0.2s ease;
        border: 1px solid #bfdbfe;
        background-color: #dbeafe;
        color: #1d4ed8;
        position: relative;
        overflow: hidden;
        transform-origin: center;
        border-radius: 0.375rem;
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
      }

      .action-btn:hover {
        background-color: #bfdbfe;
        border-color: #93c5fd;
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2),
          0 2px 4px -1px rgba(59, 130, 246, 0.1);
      }

      .action-btn:active {
        transform: translateY(0) scale(0.98);
        background-color: #93c5fd;
        box-shadow: none;
      }

      .tab-content-animate {
        animation: fadeIn 0.3s ease;
        min-height: 200px;
      }

      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translateY(10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class GeneModalComponent {
  dialogRef = inject(DialogRef);
  private data = inject<GeneModalData>(DIALOG_DATA);

  gene: NamedGenomicRange = this.data.gene;
  description: Promise<string> | undefined = this.data.description;
  pathways: Pathway[] = this.data.pathways;

  activeTab = signal('info');

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }
}
