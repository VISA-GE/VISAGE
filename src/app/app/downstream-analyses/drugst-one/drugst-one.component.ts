import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import { NamedGenomicRange, State } from '../../../state.store';
import { ElementSelectorComponent } from '../../elements/element-selector/element-selector.component';
import { ElementTrackerComponent } from '../../elements/element-tracker/element-tracker.component';

interface Node {
  id: string;
  group: string;
  label: string;
}

@Component({
  selector: 'lib-drugst-one',
  imports: [ElementSelectorComponent, ElementTrackerComponent],
  templateUrl: './drugst-one.component.html',
  styleUrl: './drugst-one.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DrugstOneComponent {
  state = inject(State);
  genes = this.state.activeGenes;

  networkString = computed(() => this.getNetworkString(this.genes()));

  private getNetworkString(genes: NamedGenomicRange[]) {
    const network: { nodes: Node[] } = {
      nodes: Array.from(genes).map((gene) => {
        return {
          id: gene.name,
          group: 'gene',
          label: gene.name,
        };
      }),
    };

    return JSON.stringify(network);
  }
}
