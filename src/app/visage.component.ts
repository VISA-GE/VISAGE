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

  @Input({ alias: 'genome-id' })
  set genomeId(value: string | null) {
    this.state.setGenomeId(value ?? null);
  }

  state = inject(State);
  hasGenome = computed(() => this.state.genomeId() !== null);

  constructor() {
    effect(() => {
      const currentGenomeId = this.state.genomeId();
      this.genomeIdChange.emit(currentGenomeId);
    });
  }
}
