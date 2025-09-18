import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  effect,
  inject,
  ViewEncapsulation,
  signal,
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
    this.state.setAndValidateGeneNames(parsed);
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

  @Input({ alias: 'tracks' })
  set tracks(value: string | null) {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          this.state.setTracks(parsed);
        } else {
          console.warn('tracks must be a JSON array');
        }
      } catch (error) {
        console.warn('Invalid JSON format for tracks:', error);
      }
    } else {
      this.state.setTracks([]);
    }
  }

  // Location control from host page
  private _pendingLocation = signal<string | null>(null);
  
  @Input({ alias: 'location' })
  set locationInput(value: string | null) {
    const input = value?.trim() ?? '';
    if (input.length === 0) {
      this._pendingLocation.set(null);
      return;
    }
    
    // Try immediate parse (locus/region) - silent to avoid premature warnings
    const handled = this.state.setLocationFromString(input, { deferIfGenesMissing: false, silent: true });
    if (handled === false) {
      // Looks like a gene but genes not loaded - store for later
      this._pendingLocation.set(input);
    } else {
      this._pendingLocation.set(null);
    }
  }

  // Visibility signal plumbed from index.html to IGV component
  private _visibilitySignal = signal<number | null>(null);
  visibilitySignal = this._visibilitySignal;

  @Input({ alias: 'visibility-signal' })
  set visibilitySignalInput(value: string | number | null) {
    if (value === null || value === undefined || value === '') {
      this._visibilitySignal.set(null);
      return;
    }
    const num = typeof value === 'number' ? value : Number(value);
    const parsed = Number.isFinite(num) ? num : Date.now();
    this._visibilitySignal.set(parsed);
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

    // Validate existing genes when reference genome data loads
    effect(() => {
      const genes = this.state.genes.value();
      if (genes) {
        this.state.validateExistingGenes();
      }
    });

    // Resolve pending location when genes become available
    effect(() => {
      const pending = this._pendingLocation();
      const genes = this.state.genes.value();
      if (!pending) return;
      if (!genes) return;
      
    // Normalize with the same logic as selected-genes, then focus
    const normalized = this.state.resolveGeneName(pending);
    if (normalized) {
      this.state.focusGene(normalized);
      this._pendingLocation.set(null);
      return;
    }
    // Fallback: try generic parser silently
    const handled = this.state.setLocationFromString(pending, { deferIfGenesMissing: false, silent: true });
    if (handled !== false) this._pendingLocation.set(null);
    });
  }
}
