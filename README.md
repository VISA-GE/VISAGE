# Visage

Visage is a genomic visualization component built with Angular that provides an interactive genome browser interface. This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.4.

## Component Interface

The main component `VisageComponent` provides the following interfaces for integration:

### Input Properties

- **`genome-id`** (string | null): Sets the genome identifier for visualization
- **`selected-genes`** (string | null): Comma-separated list of gene names to highlight
- **`selected-regions`** (string | null): JSON array of genomic regions to display

### Output Events

- **`genomeIdChange`**: Emits when the genome ID changes
- **`selectedGenesChange`**: Emits when selected genes change (comma-separated string)
- **`selectedRegionsChange`**: Emits when selected regions change (JSON string)

### Usage Example

```html
<visage-component 
  [genome-id]="'hg38'"
  [selected-genes]="'BRCA1,BRCA2'"
  [selected-regions]="'[{\"chr\":\"chr17\",\"start\":43000000,\"end\":43100000}]'"
  (genomeIdChange)="onGenomeChange($event)"
  (selectedGenesChange)="onGenesChange($event)"
  (selectedRegionsChange)="onRegionsChange($event)">
</visage-component>
```

### Data Interfaces

The component uses the following TypeScript interfaces:

#### Location Interface
```typescript
interface Location {
  chr: string;
  range?: {
    start: number;
    end: number;
  };
}
```

#### Track Interface
```typescript
interface Track {
  type?: 'annotation' | 'wig' | 'alignment' | 'variant' | 'seg' | 'mut' | 'interact' | 'gwas' | 'arc' | 'junction' | 'qtl' | 'pytor' | 'merged' | 'sequence';
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
```

#### Reference Interface
```typescript
interface Reference {
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
```
