import {
  Component,
  computed,
  effect,
  inject,
  model,
  ElementRef,
  viewChild,
  OnDestroy,
} from '@angular/core';
import { ResourceRef, resource } from '@angular/core';
import { isEqual } from 'lodash-es';
import { State } from '../../../state.store';

//@ts-ignore
declare const igv: any;

export interface Location {
  chr: string;
  range?: {
    start: number;
    end: number;
  };
}

export interface Track {
  type?:
    | 'annotation'
    | 'wig'
    | 'alignment'
    | 'variant'
    | 'seg'
    | 'mut'
    | 'interact'
    | 'gwas'
    | 'arc'
    | 'junction'
    | 'qtl'
    | 'pytor'
    | 'merged'
    | 'sequence';
  sourceType?: 'file' | 'htsget' | 'custom';
  format?: string;
  name: string;
  url: string;
  indexURL?: string;
  indexed?: boolean;
  order?: number;
  color?: string;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  visibilityWindow?: string;
  removable?: boolean;
  headers?: {};
  oauthToken?: string;
  displayMode?: 'SQUISHED' | 'EXPANDED' | 'FULL';
}

export interface Reference {
  id: string;
  name?: string;
  assembly?: string;
  fastaURL?: string;
  indexURL?: string;
  compressedIndexURL?: string;
  twoBitURL?: string;
  cytobandURL?: string;
  aliasURL?: string;
  chromSizesURL?: string;
  chromosomeOrder?: string;
  headers?: {};
  wholeGenomeView?: boolean;
}

@Component({
  selector: 'lib-igv',
  templateUrl: './igv.component.html',
  styleUrl: './igv.component.css',
})
export class IgvComponent implements OnDestroy {
  state = inject(State);
  genome$ = this.state.genome;
  tracks$ = this.state.allTracks;
  location$ = this.state.location;

  lastLocationUpdate = 0;
  igvDiv$ = viewChild<ElementRef<HTMLDivElement>>('igv');

  locString$ = computed(() => {
    const location = this.location$();
    return location.range
      ? `${location.chr}:${location.range.start}-${location.range.end}`
      : location.chr;
  });

  refGenome = computed(() => {
    const genome = this.genome$();
    return genome;
  });

  browser$: ResourceRef<any> = resource({
    request: this.igvDiv$,
    loader: async (param) => {
      const element = param.request?.nativeElement;
      if (!element) {
        return;
      }
      const browser = await igv.createBrowser(element, {
        genome: this.refGenome(),
        locus: this.locString$(),
        tracks: this.tracks$(),
      });
      browser.on('locuschange', (loci: any[]) => {
        if (!loci || loci.length === 0) {
          return;
        }
        const locus = loci[0];
        const location: Location = {
          chr: locus.chr,
        };
        if (locus.chr !== 'all') {
          location.range = {
            start: locus.start + 1,
            end: locus.end,
          };
        }
        this.onLocationChange(location);
      });

      browser.on('trackremoved', (removedTracks: any) => {
        if (!removedTracks) {
          return;
        }

        // Handle different data types that IGV.js might pass
        let tracksArray: any[] = [];

        if (Array.isArray(removedTracks)) {
          tracksArray = removedTracks;
        } else if (removedTracks.name) {
          // Single track object
          tracksArray = [removedTracks];
        } else {
          // Skip if we can't determine the track structure
          return;
        }

        // Emit track removal events for each removed track
        tracksArray.forEach((track) => {
          if (track && track.name && track.name !== 'Refseq Genes') {
            this.onTrackRemoved(track.name);
          }
        });
      });
      return browser;
    },
  });

  updateGenome$ = effect(async () => {
    const browser = this.browser$.value();
    if (!browser) {
      return;
    }
    await browser.loadGenome(this.refGenome());
    browser.search(this.locString$());
    this.visibilityChange(browser);
  });

  updateLocation$ = effect(() => {
    const browser = this.browser$.value();
    if (!browser) {
      return;
    }

    browser.search(this.locString$());
    this.visibilityChange(browser);
  });

  updateTracks$ = effect(() => {
    const browser = this.browser$.value();
    if (!browser) {
      return;
    }

    const currentTracks: Track[] = browser
      .toJSON()
      .tracks.filter((track: Track) => track.name !== 'Refseq Genes');
    const newTracks = this.tracks$();

    const toKeep = currentTracks.filter((cur) =>
      newTracks.some((ne) => isEqual(cur, ne))
    );

    // Remove existing tracks that are not marked to keep
    const toRemove = currentTracks.filter(
      (cur) => !toKeep.some((ne) => cur.name === ne.name)
    );

    // Add new tracks that are not already in the browser
    const toAdd = newTracks.filter(
      (ne) => !toKeep.some((cur) => cur.name === ne.name)
    );

    toRemove.forEach(async (track) => {
      await browser.removeTrackByName(track.name);
      this.visibilityChange(browser);
    });

    toAdd.forEach(async (track) => {
      await browser.loadTrack(track);
      this.visibilityChange(browser);
    });
  });

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

  ngOnDestroy() {
    this.updateGenome$.destroy();
    this.updateLocation$.destroy();
    this.updateTracks$.destroy();
    this.browser$.destroy();
  }

  private visibilityChange(browser?: any) {
    const _browser = browser || this.browser$.value();

    if (!_browser) {
      return;
    }

    _browser.visibilityChange();
  }
}
