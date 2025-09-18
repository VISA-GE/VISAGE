import { Component, inject, computed } from '@angular/core';
import { TrackMetadata, UcscService } from '../../services/ucsc/ucsc.service';
import { State } from '../../../state.store';
import { Track } from '../../genome-views/igv/igv.component';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast/toast.service';
import { LoadingComponent } from '../../components/loading/loading.component';

@Component({
  selector: 'lib-track-hubs',
  imports: [CommonModule, LoadingComponent],
  templateUrl: './track-hubs.component.html',
  styleUrl: './track-hubs.component.css',
})
export class TrackHubsComponent {
  ucscService = inject(UcscService);
  state = inject(State);
  toastService = inject(ToastService);
  genome$ = this.state.genome;
  tracks$ = this.ucscService.genomeTracks;
  isLoading = this.tracks$.isLoading;
  activeTabIndex = 0;

  groupedTracks = computed(() => {
    return (this.tracks$.value() ?? []).reduce((acc, track) => {
      const prettyName = this.groupPrettyNames[track.group] ?? track.group;
      acc[prettyName] = [...(acc[prettyName] || []), track];
      return acc;
    }, {} as Record<string, TrackMetadata[]>);
  });

  // Computed property to check if a track is already added
  isTrackAdded = computed(() => {
    const addedTracks = this.state.tracks();
    return (track: TrackMetadata) => {
      const url = track.bigDataUrl ?? track.url;
      if (!url) return false;

      const formattedUrl = 'https://hgdownload.soe.ucsc.edu' + url;
      return addedTracks.some(
        (addedTrack) =>
          addedTrack.name === track.shortLabel ||
          addedTrack.url === formattedUrl
      );
    };
  });

  groupPrettyNames: Record<string, string> = {
    compGeno: 'Comparative Genomics',
    expression: 'Expression',
    genes: 'Genes and Gene Predictions',
    hprc: 'Human Pangenome - HPRC',
    map: 'Mapping and Sequencing',
    phenDis: 'Phenotypes, Variants and Literature',
    regulation: 'Regulation',
    rep: 'Repeats',
    singleCell: 'Single Cell',
    varRep: 'Variation',
    rna: 'RNA',
  };

  setActiveTab(index: number): void {
    this.activeTabIndex = index;
    // Reset animations by forcing a DOM reflow
    setTimeout(() => {
      const cards = document.querySelectorAll('.staggered-card');
      cards.forEach((card) => {
        // Trick to reset animation
        card.classList.remove('staggered-card');
        // Force reflow with a safer approach
        requestAnimationFrame(() => {
          card.classList.add('staggered-card');
        });
      });
    }, 10);
  }

  addTrack(track: TrackMetadata) {
    const url = track.bigDataUrl ?? track.url;

    if (!url) {
      console.error('No URL found for track', track);
      this.toastService.error('Failed to add track: No URL found');
      return;
    }

    const formattedTrack: Track = {
      name: track.shortLabel,
      url: 'https://hgdownload.soe.ucsc.edu' + url,
    };

    // The state store will handle duplicate checking and show appropriate toasts
    this.state.addTrack(formattedTrack);
  }

  removeTrack(track: TrackMetadata) {
    // Remove track by name from the state store
    this.state.removeTrack(track.shortLabel);
  }
}
