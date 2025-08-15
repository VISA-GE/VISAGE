import { httpResource } from '@angular/common/http';
import { inject, Injectable, resource } from '@angular/core';
import { State } from '../../../state.store';

export type UcscGenome = {
  active: number;
  defaultPos: string;
  description: string;
  genome: string;
  hgNearOk: number;
  hgPbOk: number;
  htmlPath: string;
  nibPath: string;
  orderKey: number;
  organism: string;
  scientificName: string;
  sourceName: string;
  taxId: number;
  id: string;
};

export type PublicHub = {
  dbCount: number;
  dbList: string;
  descriptionUrl: string;
  hubUrl: string;
  longLabel: string;
  registrationTime: string;
  shortLabel: string;
};

export interface TrackMetadata {
  shortLabel: string;
  longLabel: string;
  type: string;
  group: string;
  visibility?: string;
  priority?: string;
  color?: string;
  parent?: string;
  bigDataUrl?: string;
  compositeTrack?: string;
  subGroups?: string;
  url?: string;
  [key: string]: any; // For other track-specific properties
}

export interface GenomeTracksResponse {
  [trackName: string]:
    | TrackMetadata
    | {
        [subTrackName: string]: TrackMetadata;
      };
}

@Injectable({
  providedIn: 'root',
})
export class UcscService {
  private static readonly BASE_URL = 'https://api.genome.ucsc.edu';
  state = inject(State);
  genome$ = this.state.genome;

  publicHubs = httpResource<{ publicHubs: PublicHub[] }>({
    url: `${UcscService.BASE_URL}/list/publicHubs`,
  });

  ucscGenomes = resource({
    loader: async () => {
      const response = await fetch(`${UcscService.BASE_URL}/list/ucscGenomes`);
      const data = await response.json();

      const genomes = data.ucscGenomes;

      const enhancedGenomes: UcscGenome[] = Object.keys(genomes).map((key) => ({
        ...genomes[key],
        id: key,
      }));

      return enhancedGenomes;
    },
  });

  genomeFiles = httpResource<{ genomeFiles: any[] }>(() => {
    const genome = this.genome$();
    if (!genome) return undefined;
    return `${UcscService.BASE_URL}/list/files?genome=${genome.id}`;
  });

  genomeTracks = resource({
    request: this.genome$,
    loader: async (param): Promise<TrackMetadata[] | undefined> => {
      const genome = param.request;
      if (!genome) return undefined;
      const response = await fetch(
        `${UcscService.BASE_URL}/list/tracks?genome=${genome.id}`
      );
      const data = await response.json();
      const genomeTracks = data[genome.id];
      return Object.values(genomeTracks).filter((track) =>
        this.hasBigDataUrl(track)
      ) as TrackMetadata[];
    },
  });

  genomeChromosomes = httpResource<{ genomeChromosomes: any[] }>(() => {
    const genome = this.genome$();
    if (!genome) return undefined;
    return `${UcscService.BASE_URL}/list/chromosomes?genome=${genome.id}`;
  });

  // Recursively check if the object has a bigDataUrl property
  hasBigDataUrl(obj: any) {
    if (obj.bigDataUrl !== undefined) {
      return true;
    }
    if (obj.subTracks) {
      return obj.subTracks.some((subTrack: any) =>
        this.hasBigDataUrl(subTrack)
      );
    }
    return false;
  }
}
