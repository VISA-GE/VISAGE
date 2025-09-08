import { computed, effect, resource, signal, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';

import { Location, Track } from './app/genome-views/igv/igv.component';

import { decompressSync, strFromU8 } from 'fflate';
import { genomes } from './assets/genomes/genomes';
import { pathways } from './assets/pathways/pathways';
import { SNP, fetchAllSNPsInRange } from './helpers/eva';
import { ToastService } from './app/services/toast/toast.service';

export interface Pathway {
  id: string;
  url: string;
  name: string;
  species: string;
  revision: string;
  authors: string;
  description: string;
  citedIn: string;
}

export interface PathwayComponent {
  label: string;
  type: string;
  identifier: string;
  comment: string;
  ensembl: string;
  ncbi: string;
  hgnc: string;
  uniprot: string;
  wikidata: string;
  chebi: string;
  inchi: string;
}

export type Genome = {
  id: string;
  name: string;
  fastaURL: string;
  indexURL: string;
  tracks: Track[];
  description: string;
  organism: string;
  orderKey: number;
  genome: string;
  htmlPath: string;
  sourceName: string;
  taxId: number;
  evaSpecies: string;
  trackHubId: string;
};

export type VisagePage =
  | 'track-hubs'
  | 'custom-upload'
  | 'igv'
  | 'genes'
  | 'drugst-one';

type VisageState = {
  location: Location;
  genomeId: string | null;
  page: VisagePage;
  tracks: Track[];
  geneNames: Set<string>;
  snps: SNP[];
  selectedRegions: NamedGenomicRange[];
  searchedRegions: {
    chr: string;
    range: {
      start: number;
      end: number;
    };
  }[];
};

const initialState: VisageState = {
  location: {
    chr: 'all',
  },
  genomeId: null,
  page: 'igv',
  tracks: [],
  geneNames: new Set(),
  snps: [],
  selectedRegions: [],
  searchedRegions: [],
};

export interface NamedGenomicRange extends Location {
  strand?: string;
  type: string;
  name: string;
}

function readRefseqGenes(content: string) {
  const geneLocations = new Map<string, NamedGenomicRange>();

  content.split('\n').forEach((line: string) => {
    const [, , chromosome, strand, start, end, , , ...rest] = line.split('\t');
    const name = rest[4];
    const gene: NamedGenomicRange = {
      chr: chromosome,
      strand,
      range: {
        start: Number(start),
        end: Number(end),
      },
      type: 'gene',
      name,
    };

    const existing = geneLocations.get(name);

    if (existing) {
      geneLocations.set(gene.name, {
        name: gene.name,
        chr: gene.chr,
        range: {
          start: Math.min(existing.range!.start, gene.range!.start),
          end: Math.max(existing.range!.end, gene.range!.end),
        },
        type: 'gene',
      });
    } else {
      geneLocations.set(gene.name, gene);
    }
  });

  return Array.from(geneLocations.values()).filter((gene) => gene.name);
}

export interface GeneProduct {
  database: string;
  id: string;
  symbol: string;
  name: string;
  synonyms: string[];
  type: string;
  taxonId: number;
  databaseSubset: string;
  parentId: string;
  proteome: string;
}

export interface PageInfo {
  resultsPerPage: number;
  total: number;
  current: number;
}

export interface GeneProductSearchResult {
  numberOfHits: number;
  results: GeneProduct[];
  pageInfo: PageInfo;
}

export const MAX_REGION_SIZE = 1_000_000; // 1 Mb

export const State = signalStore(
  {
    providedIn: 'root',
  },
  // withStorageSync('state'),
  withState(initialState),
  withMethods((store) => {
    const toastService = inject(ToastService);

    // Helper function to add a region with duplicate checking
    const addRegionWithDuplicateCheck = (region: NamedGenomicRange) => {
      const existingRegions = store.selectedRegions();
      const isDuplicate = existingRegions.some(
        (existingRegion) => existingRegion.name === region.name
      );

      if (isDuplicate) {
        toastService.warning(`Region "${region.name}" is already selected!`);
        return;
      }

      // Validate region size (< 1 Mb)
      const range = region.range;
      if (!range || range.start === undefined || range.end === undefined) {
        toastService.warning('Cannot add region: invalid range');
        return;
      }
      const regionSize = Math.abs(range.end - range.start);
      if (regionSize >= MAX_REGION_SIZE) {
        toastService.warning(
          `Region "${region.name}" is too large (>= 1 Mb) and was not added`
        );
        return;
      }

      patchState(store, { selectedRegions: [...existingRegions, region] });
      toastService.success(`Region "${region.name}" successfully added!`);
    };

    return {
      setLocation: (location: Location) => patchState(store, { location }),
      setGenomeId: (genomeId: string | null) => patchState(store, { genomeId }),
      unsetGenome: () =>
        patchState(store, {
          genomeId: null,
          location: { chr: 'all' },
          page: 'custom-upload',
          tracks: [],
          geneNames: new Set<string>(),
          snps: [],
          selectedRegions: [],
          searchedRegions: [],
        }),
      addTrack: (track: Track) => {
        const existingTracks = store.tracks();

        // Check if track already exists by name or URL
        const isDuplicate = existingTracks.some(
          (existingTrack) =>
            existingTrack.name === track.name || existingTrack.url === track.url
        );

        if (isDuplicate) {
          // Show warning toast for duplicate track
          toastService.warning(`Track "${track.name}" is already added!`);
          return;
        }

        patchState(store, { tracks: [...existingTracks, track] });
        // Show success toast when track is successfully added
        toastService.success(`Track "${track.name}" successfully added!`);
      },
      removeTrack: (trackName: string) => {
        const existingTracks = store.tracks();
        const updatedTracks = existingTracks.filter(
          (track) => track.name !== trackName
        );

        if (updatedTracks.length < existingTracks.length) {
          patchState(store, { tracks: updatedTracks });
          // Show info toast when track is removed
          toastService.info(`Track "${trackName}" removed`);
        }
      },
      reset: () => {
        patchState(store, initialState);
      },
      setPage: (page: VisagePage) => patchState(store, { page }),
      setGeneNames: (geneNames: string[]) =>
        patchState(store, { geneNames: new Set(geneNames) }),
      addSelectedRegion: (region: NamedGenomicRange) => {
        addRegionWithDuplicateCheck(region);
      },
      removeSelectedRegionByIndex: (index: number) => {
        const existingRegions = store.selectedRegions();
        if (index >= 0 && index < existingRegions.length) {
          const removedRegion = existingRegions[index];
          const updatedRegions = existingRegions.filter((_, i) => i !== index);
          patchState(store, { selectedRegions: updatedRegions });
          toastService.info(`Region "${removedRegion.name}" removed`);
        }
      },
      removeSelectedRegionByName: (name: string) => {
        const existingRegions = store.selectedRegions();
        const updatedRegions = existingRegions.filter(
          (region) => region.name !== name
        );

        if (updatedRegions.length < existingRegions.length) {
          patchState(store, { selectedRegions: updatedRegions });
          toastService.info(`Region "${name}" removed`);
        }
      },
      setSelectedRegions: (regions: NamedGenomicRange[]) => {
        const filtered = regions.filter((r) => {
          const range = r.range;
          if (!range || range.start === undefined || range.end === undefined)
            return false;
          return Math.abs(range.end - range.start) < MAX_REGION_SIZE;
        });

        if (filtered.length !== regions.length) {
          const excluded = regions.length - filtered.length;
          toastService.warning(
            `${excluded} region(s) were too large (>= 1 Mb) and were excluded`
          );
        }

        patchState(store, { selectedRegions: filtered });
      },
      addCurrentLocationAsRegion: (name: string) => {
        const currentLocation = store.location();
        if (currentLocation.chr === 'all') {
          toastService.warning(
            'Cannot add region: no specific chromosome is focused'
          );
          return;
        }

        const region: NamedGenomicRange = {
          ...currentLocation,
          name,
          type: 'custom',
        };

        addRegionWithDuplicateCheck(region);
      },
    };
  }),
  withComputed((store) => ({
    genome: computed(() => genomes.find((g) => g.id === store.genomeId())),
  })),
  withComputed((store) => ({
    refGeneTrack: computed(() =>
      store.genome()?.tracks.find((t) => t.format === 'refgene')
    ),
    pathways: computed<Pathway[]>(() =>
      pathways.filter((p) => p.species === store.genome()?.scientificName)
    ),
    geneProducts: computed<{
      [gene: string]: Promise<GeneProduct[]>;
    }>(() => {
      const geneNames = store.geneNames();
      const taxonId = store.genome()?.taxId;

      if (!taxonId) return {};

      return Object.fromEntries(
        Array.from(geneNames).map((gene) => {
          return [
            gene,
            fetch(
              `https://www.ebi.ac.uk/QuickGO/services/geneproduct/search?taxonId=${taxonId}&query=${gene}`
            ).then((response) => response.json().then((data) => data.results)),
          ];
        })
      );
    }),
    geneDescriptions: computed<{ [gene: string]: Promise<string> }>(() => {
      const geneNames = store.geneNames();
      const taxonId = store.genome()?.taxId;

      if (!taxonId) return {};

      return Object.fromEntries(
        Array.from(geneNames).map((gene) => {
          return [
            gene,
            fetch(
              `https://mygene.info/v3/query?q=${gene}&fields=name&species=${taxonId}&size=10&from=0`
            ).then((response) =>
              response.json().then((data) => data.hits[0].name)
            ),
          ];
        })
      );
    }),
    snpTrack: computed(() => {
      const snps = store.snps();
      if (snps.length === 0) return null;

      // Create VCF content
      const header =
        '##fileformat=VCFv4.2\n' +
        '##INFO=<ID=RS,Number=1,Type=String,Description="dbSNP ID">\n' +
        '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n';

      const rows = snps.map(
        (snp) =>
          `${snp.chr}\t${snp.range.start}\t${snp.name}\t${snp.ref}\t${snp.alt}\t.\t.\tRS=${snp.name}`
      );

      const vcfContent = header + rows.join('\n');
      const file = new File([vcfContent], 'snps.vcf', {
        type: 'text/plain;charset=utf-8',
      });

      // Create track with a fixed name to ensure it's always recognized as the same track
      return {
        name: 'SNPs',
        type: 'variant',
        format: 'vcf',
        url: URL.createObjectURL(file),
        removable: true,
        displayMode: 'EXPANDED',
      } as Track;
    }),
  })),
  withProps((store) => ({
    genes: resource({
      request: store.refGeneTrack,
      loader: async (param) => {
        const track = param.request;
        if (!track) return null;
        const response = await fetch(track.url);
        const blob = await response.blob();
        const content = strFromU8(
          decompressSync(new Uint8Array(await blob.arrayBuffer()))
        );
        return readRefseqGenes(content);
      },
    }),
    pathwayComponents: resource({
      request: store.pathways,
      loader: async (param) => {
        const pathways = param.request;

        const pathwayComponents: Record<string, PathwayComponent[]> =
          Object.fromEntries(
            await Promise.all(
              pathways.map(async (p) => {
                const response = await fetch(
                  `https://www.wikipathways.org/wikipathways-assets/pathways/${p.id}/${p.id}-datanodes.tsv`
                );

                const content = await response.text();

                const lines = content
                  .split('\n')
                  .map((line) => line.split('\t'));
                lines.shift();
                return [
                  p.id,
                  lines.map((line: string[]) => ({
                    label: line[0],
                    type: line[1],
                    identifier: line[2],
                    comment: line[3],
                    ensembl: line[4],
                    ncbi: line[5],
                    hgnc: line[6],
                    uniprot: line[7],
                    wikidata: line[8],
                    chebi: line[9],
                    inchi: line[10],
                  })),
                ];
              })
            )
          );
        return pathwayComponents;
      },
    }),
  })),
  withComputed((store) => ({
    activeGenes: computed<NamedGenomicRange[]>(() =>
      Array.from(store.geneNames())
        .map((geneName) =>
          store.genes.value()?.find((g) => g.name === geneName)
        )
        .filter((g) => g !== undefined)
    ),
    visibleGenes: computed<NamedGenomicRange[]>(() => {
      const genes = store.genes.value();
      const location = store.location();
      if (!genes) return [];
      if (location.chr === 'all') {
        return genes;
      }
      const locationRange = location.range;
      if (locationRange) {
        return genes.filter((g) => {
          const range = g.range!;
          return (
            g.chr === location.chr &&
            range.start <= locationRange.end &&
            range.end >= locationRange.start
          );
        });
      } else {
        return genes.filter((g) => g.chr === location.chr);
      }
    }),
    genePathways: computed<Record<string, Pathway[]>>(() => {
      const genes = store.geneNames();
      const pathways = store.pathways();
      const pathwayComponents = store.pathwayComponents.value();

      if (!pathwayComponents) return {};

      return Object.fromEntries(
        Array.from(genes).map((gene) => {
          const matchingPathways = pathways.filter((p) => {
            const components = pathwayComponents[p.id];
            return components.some(
              (c) => c.label.toLowerCase() === gene.toLowerCase()
            );
          });
          return [gene, matchingPathways];
        })
      );
    }),
    allTracks: computed<Track[]>(() => {
      const snpTrack = store.snpTrack();
      if (!snpTrack) return store.tracks();
      return [...store.tracks(), snpTrack];
    }),
  })),
  withMethods((store) => ({
    focusGene: (geneName: string) => {
      const gene = store.genes.value()?.find((g) => g.name === geneName);
      if (gene) {
        const range = gene.range!;
        const length = range.end - range.start;
        const location: Location = {
          chr: gene.chr,
          range: {
            start: Math.floor(range.start - length / 2),
            end: Math.ceil(range.end + length / 2),
          },
        };
        store.setLocation(location);
      }
    },
  })),
  withMethods((store) => ({
    addGeneName: (geneName: string) => {
      patchState(store, {
        geneNames: new Set(store.geneNames()).add(geneName),
      });
      store.focusGene(geneName);
    },
    removeGeneName: (geneName: string) => {
      const newGeneNames = new Set(store.geneNames());
      newGeneNames.delete(geneName);
      patchState(store, {
        geneNames: newGeneNames,
      });
    },
    addGeneNames: (geneNames: string[]) => {
      const newGeneNames = new Set(store.geneNames());
      geneNames.forEach((geneName) => newGeneNames.add(geneName));
      patchState(store, {
        geneNames: newGeneNames,
      });
    },
    fetchSNPsInRange: async (chr: string, start: number, end: number) => {
      const genome = store.genome();
      if (!genome?.evaSpecies) {
        console.warn('No EVA species specified for current genome');
        return;
      }

      // Check if this region has already been searched
      const isAlreadySearched = store
        .searchedRegions()
        .some(
          (region) =>
            region.chr === chr &&
            region.range.start <= start &&
            region.range.end >= end
        );

      if (isAlreadySearched) {
        console.log('Region already searched for SNPs');
        return;
      }

      try {
        // Use the new fetchAllSNPsInRange function with batched requests
        // This callback will be called after each batch with the new SNPs
        const onProgressUpdate = (
          current: number,
          total: number,
          newSnps: SNP[]
        ) => {
          // Add the new batch of SNPs to the store
          if (newSnps.length > 0) {
            // Update the SNPs array
            patchState(store, {
              snps: [...store.snps(), ...newSnps],
            });
          }

          console.log(`Fetched ${current} of ${total} SNPs`);
        };

        // Mark the region as searched immediately
        patchState(store, {
          searchedRegions: [
            ...store.searchedRegions(),
            { chr, range: { start, end } },
          ],
        });

        const allSnps = await fetchAllSNPsInRange(
          genome.evaSpecies,
          chr,
          start,
          end,
          onProgressUpdate
        );

        return allSnps;
      } catch (error) {
        console.error('Error fetching SNPs:', error);
        return [];
      }
    },
  }))
);
