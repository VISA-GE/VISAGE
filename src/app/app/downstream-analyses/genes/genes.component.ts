import { Component, inject } from '@angular/core';
import { State } from '../../../state.store';
import { GeneComponent } from './gene/gene.component';
import { ElementSelectorComponent } from '../../elements/element-selector/element-selector.component';

@Component({
  selector: 'lib-genes',
  imports: [GeneComponent, ElementSelectorComponent],
  templateUrl: './genes.component.html',
  styleUrl: './genes.component.css',
})
export class GenesComponent {
  state = inject(State);
  genes = this.state.activeGenes;
}
