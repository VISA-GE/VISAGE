import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  effect,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { State } from './state.store';
import { GenomeSelectorComponent } from './genome-selector/genome-selector.component';
import { AppComponent } from './app/app.component';

@Component({
  standalone: true,
  imports: [GenomeSelectorComponent, AppComponent],
  templateUrl: './visage.component.html',
  styleUrls: ['./theme.css', './visage.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class VisageComponent {
  @Output() genomeIdChange = new EventEmitter<string | null>();
  @Output() selectedGenesChange = new EventEmitter<string>();
  @Output() selectedRegionsChange = new EventEmitter<string>();

  @Input({ alias: 'genome-id' })
  set genomeId(value: string | null) {
    this.state.setGenomeId(value ?? null);
  }

  @Input({ alias: 'selected-genes' })
  set selectedGenes(value: string | null) {
    const parsed = (value ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    this.state.setGeneNames(parsed);
  }

  @Input({ alias: 'selected-regions' })
  set selectedRegions(value: string | null) {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          this.state.setSelectedRegions(parsed);
        } else {
          console.warn('selected-regions must be a JSON array');
        }
      } catch (error) {
        console.warn('Invalid JSON format for selected-regions:', error);
      }
    } else {
      this.state.setSelectedRegions([]);
    }
  }

  state = inject(State);
  hasGenome = computed(() => this.state.genomeId() !== null);

  constructor() {
    effect(() => {
      const currentGenomeId = this.state.genomeId();
      this.genomeIdChange.emit(currentGenomeId);
    });

    effect(() => {
      const currentGeneNames = Array.from(this.state.geneNames());
      this.selectedGenesChange.emit(currentGeneNames.join(','));
    });

    effect(() => {
      const currentRegions = this.state.selectedRegions();
      this.selectedRegionsChange.emit(JSON.stringify(currentRegions));
    });
  }
}
