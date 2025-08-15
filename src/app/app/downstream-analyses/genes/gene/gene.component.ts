import {
  Component,
  input,
  inject,
  AfterViewInit,
  ElementRef,
  computed,
} from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { NamedGenomicRange, State } from '../../../../state.store';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import {
  GeneModalComponent,
  GeneModalData,
} from '../../../components/gene-modal/gene-modal.component';

@Component({
  selector: 'lib-gene',
  imports: [CommonModule, AsyncPipe, DialogModule],
  templateUrl: './gene.component.html',
  styleUrl: './gene.component.css',
})
export class GeneComponent implements AfterViewInit {
  gene = input.required<NamedGenomicRange>();
  private state = inject(State);
  private el = inject(ElementRef);
  private dialog = inject(Dialog);

  pathways = computed(() => this.state.genePathways()[this.gene().name]);
  description = computed(() => this.state.geneDescriptions()[this.gene().name]);

  ngAfterViewInit() {
    // Get parent element's data-index attribute
    const parentElement = this.el.nativeElement.parentElement;
    if (parentElement && parentElement.hasAttribute('data-index')) {
      const index = parentElement.getAttribute('data-index');
      // Set the CSS variable for animation delay
      const cardElement =
        this.el.nativeElement.querySelector('.staggered-card');
      if (cardElement) {
        cardElement.style.setProperty('--data-index', index);
      }
    }
  }

  focusGene() {
    this.state.focusGene(this.gene().name);
    this.state.setPage('igv');
  }

  removeGene() {
    this.state.removeGeneName(this.gene().name);
  }

  showGeneModal() {
    const dialogRef = this.dialog.open<unknown, GeneModalData>(
      GeneModalComponent,
      {
        width: '100%',
        maxWidth: '900px',
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
          gene: this.gene(),
          description: this.description(),
          pathways: this.pathways(),
        },
        autoFocus: false,
      }
    );
  }
}
