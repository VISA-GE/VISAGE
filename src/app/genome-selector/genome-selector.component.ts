import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Genome, State } from '../state.store';
import { genomes } from '../assets/genomes/genomes';

interface GenomesByOrganism {
  [organism: string]: Genome[];
}

@Component({
  selector: 'lib-genome-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './genome-selector.component.html',
  styleUrl: './genome-selector.component.css',
})
export class GenomeSelectorComponent {
  state = inject(State);
  allGenomes = genomes as Genome[];
  genomesByOrganism: GenomesByOrganism = this.groupGenomesByOrganism(
    this.allGenomes
  );
  // Prioritize Human and Mouse organisms, then sort the rest alphabetically
  organisms: string[] = this.prioritizeOrganisms(
    Object.keys(this.genomesByOrganism)
  );
  // Initialize with Human selected if available
  selectedOrganism = signal<string | null>(
    this.organisms.includes('Human') ? 'Human' : null
  );

  genomesForSelectedOrganism = computed(() => {
    const organism = this.selectedOrganism();
    if (!organism) return [];
    // Sort genomes by orderKey (smaller values come first, indicating newer versions)
    return [...this.genomesByOrganism[organism]].sort(
      (a, b) => a.orderKey - b.orderKey
    );
  });

  groupGenomesByOrganism(genomes: Genome[]) {
    // Group genomes by organism
    return genomes.reduce((acc, genome) => {
      const organism = genome.organism;
      if (!acc[organism]) {
        acc[organism] = [];
      }
      acc[organism].push(genome);
      return acc;
    }, {} as GenomesByOrganism);
  }

  // New method to prioritize Human and Mouse organisms
  prioritizeOrganisms(organisms: string[]): string[] {
    const prioritized = [];

    // Add Human first if it exists
    if (organisms.includes('Human')) {
      prioritized.push('Human');
    }

    // Add Mouse second if it exists
    if (organisms.includes('Mouse')) {
      prioritized.push('Mouse');
    }

    // Add the rest of the organisms alphabetically
    const remaining = organisms
      .filter((org) => org !== 'Human' && org !== 'Mouse')
      .sort();

    return [...prioritized, ...remaining];
  }

  setGenome(genome: Genome) {
    this.state.setGenomeId(genome.id);
  }
}
