import { Component, computed, effect, inject, model } from '@angular/core';
import { NgxIgvComponent, Location } from 'ngx-igv';
import { State } from '../../../state.store';

@Component({
  selector: 'lib-igv',
  imports: [NgxIgvComponent],
  templateUrl: './igv.component.html',
  styleUrl: './igv.component.css',
})
export class IgvComponent {
  state = inject(State);
  genome$ = this.state.genome;
  tracks$ = this.state.allTracks;
  location$ = this.state.location;

  lastLocationUpdate = 0;

  constructor() {
    effect(() => {
      this.location$();
      this.lastLocationUpdate = Date.now();
    });
  }

  onLocationChange(location: Location) {
    const now = Date.now();
    if (now - this.lastLocationUpdate < 300) {
      return;
    }
    this.lastLocationUpdate = now;
    this.state.setLocation(location);
  }

  onTrackRemoved(trackName: string) {
    this.state.removeTrack(trackName);
  }
}
