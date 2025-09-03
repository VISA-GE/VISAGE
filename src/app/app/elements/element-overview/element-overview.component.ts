import { Component, effect, inject, computed } from '@angular/core';
import { State } from '../../../state.store';
import { ElementSelectorComponent } from '../element-selector/element-selector.component';
import { ElementTrackerComponent } from '../element-tracker/element-tracker.component';

@Component({
  selector: 'app-element-overview',
  standalone: true,
  imports: [ElementSelectorComponent, ElementTrackerComponent],
  templateUrl: './element-overview.component.html',
  styleUrl: './element-overview.component.css',
})
export class ElementOverviewComponent {
  state = inject(State);
  visibleGenesCount = computed(() => this.state.visibleGenes().length);
  location = this.state.location;
  isFetchingSNPs = false;

  selectAllVisibleGenes(): void {
    const visibleGenes = this.state.visibleGenes();
    if (visibleGenes.length <= 20) {
      const geneNames = visibleGenes.map((gene) => gene.name);
      this.state.addGeneNames(geneNames);
    }
  }

  async fetchSNPsInVisibleRegion(): Promise<void> {
    const location = this.location();

    // Only fetch SNPs if we have a chromosome and a range
    if (location.chr === 'all' || !location.range) {
      console.warn(
        'Cannot fetch SNPs for whole genome view or when no range is selected'
      );
      return;
    }

    // Limit the size of the region to prevent fetching too many SNPs
    const rangeSize = location.range.end - location.range.start;
    const maxRangeSize = 5000000; // 5Mb limit (reasonable for pagination)

    if (rangeSize > maxRangeSize) {
      console.warn(
        `Region too large (${rangeSize.toLocaleString()}bp). Please zoom in to a region smaller than ${maxRangeSize.toLocaleString()}bp.`
      );
      return;
    }

    try {
      this.isFetchingSNPs = true;
      await this.state.fetchSNPsInRange(
        location.chr,
        location.range.start,
        location.range.end
      );
    } catch (error) {
      console.error('Error fetching SNPs:', error);
    } finally {
      this.isFetchingSNPs = false;
    }
  }
}
