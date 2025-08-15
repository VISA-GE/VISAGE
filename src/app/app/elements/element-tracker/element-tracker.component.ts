import { Component, inject } from '@angular/core';
import { State } from '../../../state.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-element-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './element-tracker.component.html',
  styleUrl: './element-tracker.component.css',
})
export class ElementTrackerComponent {
  state = inject(State);
  geneNames = this.state.geneNames;
  visibleGenes = this.state.visibleGenes;

  remove(geneName: string): void {
    this.state.removeGeneName(geneName);
  }

  focusGene(geneName: string): void {
    this.state.focusGene(geneName);
  }
}
