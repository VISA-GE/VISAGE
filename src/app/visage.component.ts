import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { State } from './state.store';
import { GenomeSelectorComponent } from './genome-selector/genome-selector.component';
import { AppComponent } from './app/app.component';

@Component({
  standalone: true,
  imports: [GenomeSelectorComponent, AppComponent],
  templateUrl: './visage.component.html',
  styleUrl: './visage.component.css',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class VisageComponent {
  state = inject(State);
  hasGenome = computed(() => this.state.genomeId() !== null);
}
