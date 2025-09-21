import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { State, VisagePage } from '../../state.store';
import { ConfirmationDialogComponent } from '../components';

@Component({
  selector: 'lib-sidebar',
  imports: [CommonModule, DialogModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('250ms ease', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('250ms ease', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class SidebarComponent {
  state = inject(State);
  dialog = inject(Dialog);
  page = this.state.page;

  entries = [
    {
      label: 'Data sources',
      collapsed: false,
      children: [
        {
          label: 'Track hubs',
          id: 'track-hubs',
        },
        {
          label: 'Custom upload',
          id: 'custom-upload',
        },
      ],
    },
    {
      label: 'Genome views',
      collapsed: false,
      children: [
        {
          label: 'IGV',
          id: 'igv',
        },
      ],
    },
    {
      label: 'Downstream analyses',
      collapsed: false,
      children: [
        {
          label: 'Genes',
          id: 'genes',
        },
        {
          label: 'Drugst.One',
          id: 'drugst-one',
          disabled: true,
        },
      ],
    },
  ];

  toggleSection(section: any) {
    section.collapsed = !section.collapsed;
  }

  setActiveItem(itemId: string) {
    this.state.setPage(itemId as VisagePage);
  }

  unsetGenome() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      panelClass: [
        'gene-modal-dialog-panel',
        'flex',
        'items-center',
        'justify-center',
      ],
      backdropClass: [
        'gene-modal-backdrop',
        'flex',
        'items-center',
        'justify-center',
      ],
      data: {
        title: 'Clear Reference Genome',
        message:
          'Are you sure you want to clear the reference genome? This will reset all your current data including selected genes, tracks, location, and analysis results, and return you to the genome selector.',
        confirmText: 'Clear All Data',
        cancelText: 'Cancel',
      },
      autoFocus: false,
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        this.state.unsetGenome();
      }
    });
  }
}
