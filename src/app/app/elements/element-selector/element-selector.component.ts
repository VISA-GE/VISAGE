import { Component, computed, inject, signal } from '@angular/core';
import { NamedGenomicRange, State } from '../../../state.store';
import { FormsModule } from '@angular/forms';

// Keyboard key codes
const ENTER = 13;
const COMMA = 188;
const UP_ARROW = 38;
const DOWN_ARROW = 40;

@Component({
  selector: 'lib-element-selector',
  imports: [FormsModule],
  templateUrl: './element-selector.component.html',
  styleUrl: './element-selector.component.css',
})
export class ElementSelectorComponent {
  state = inject(State);
  genes = this.state.genes;
  geneNames = this.state.geneNames;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  currentGeneInput = signal('');
  showDropdown = signal(false);
  selectedIndex = signal(0);

  readonly filteredGenes = computed(() => {
    const searchTerm = this.currentGeneInput().toLowerCase();
    const allGenes = this.genes.value() ?? [];
    const selectedGeneNames = new Set(this.geneNames());

    // First filter out selected genes
    const availableGenes = allGenes.filter(
      (gene) => !selectedGeneNames.has(gene.name)
    );

    // Then apply search filter if there's a search term
    const filtered = searchTerm
      ? availableGenes.filter((gene) =>
          gene.name.toLowerCase().includes(searchTerm)
        )
      : availableGenes;

    // Finally sort and limit results
    return filtered.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 50);
  });

  handleInputChange(): void {
    this.showDropdown.set(true);
    // Reset selected index to 0 when input changes
    this.selectedIndex.set(0);
  }

  handleGeneSelection(geneName: string): void {
    this.state.addGeneName(geneName);
    this.currentGeneInput.set('');
    this.showDropdown.set(false);
  }

  handleKeyDown(event: KeyboardEvent): void {
    const genes = this.filteredGenes();

    if (this.showDropdown() && genes.length > 0) {
      // Handle arrow navigation
      if (event.keyCode === UP_ARROW) {
        this.selectedIndex.update((index) =>
          index > 0 ? index - 1 : genes.length - 1
        );
        event.preventDefault();
      } else if (event.keyCode === DOWN_ARROW) {
        this.selectedIndex.update((index) =>
          index < genes.length - 1 ? index + 1 : 0
        );
        event.preventDefault();
      } else if (event.keyCode === ENTER) {
        // Select the currently highlighted gene
        const selectedGene = genes[this.selectedIndex()];
        if (selectedGene) {
          this.handleGeneSelection(selectedGene.name);
          event.preventDefault();
        }
      }
    } else if (this.separatorKeysCodes.includes(event.keyCode)) {
      if (this.currentGeneInput().trim()) {
        // Try to find an exact match or first option
        if (genes.length > 0) {
          this.handleGeneSelection(genes[0].name);
        }
      }
      event.preventDefault();
    }
  }

  selectItem(index: number): void {
    this.selectedIndex.set(index);
  }

  addGeneNames(geneNames: NamedGenomicRange[]): void {
    this.state.addGeneNames(geneNames.map((gene) => gene.name));
  }
}
