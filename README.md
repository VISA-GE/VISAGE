# Visage

Visage is a genomic visualization component built with Angular that provides an interactive genome browser interface. This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.4.

## Component Interface

The main component `VisageComponent` provides the following interfaces for integration:

### Input Properties

- **`genome-id`** (string | null): Sets the genome identifier for visualization
- **`selected-genes`** (string | null): Comma-separated list of gene names to highlight
- **`selected-regions`** (string | null): JSON array of genomic regions to display
- **`tracks`** (string | null): JSON array of IGV track objects to load

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
  [tracks]="'[{\"name\":\"Variants\",\"type\":\"variant\",\"format\":\"vcf\",\"url\":\"https://example.org/variants.vcf.gz\",\"indexURL\":\"https://example.org/variants.vcf.gz.tbi\"}]'"
  (genomeIdChange)="onGenomeChange($event)"
  (selectedGenesChange)="onGenesChange($event)"
  (selectedRegionsChange)="onRegionsChange($event)">
</visage-component>
### Tracks Input

Provide an array of track definitions as a JSON string. The shape follows the `Track` interface below. Invalid entries (missing `name` or `url`) and duplicates (same `name` or `url`) are ignored. When set, the list replaces any existing tracks in the component state.

Example (as attribute on the custom element):

```html
<visa-ge genome-id="mm10" tracks='[
  {"name":"RefSeq Genes","type":"annotation","format":"refgene","url":"/assets/refgene.gz"},
  {"name":"My Peaks","type":"annotation","format":"bed","url":"https://example.org/peaks.bed"}
]'></visa-ge>
```

### Using Blob URLs

You can create Blob URLs at runtime and pass them via the `tracks` JSON. This is useful for user-provided files or dynamically generated content.

```html
<script>
  // Example: user uploads a BED file
  async function attachUploadedBed(file) {
    const url = URL.createObjectURL(file);
    const tracks = [
      { name: 'Uploaded BED', type: 'annotation', format: 'bed', url }
    ];
    const el = document.querySelector('visa-ge');
    el.setAttribute('tracks', JSON.stringify(tracks));
  }

  // Example: dynamically generate a small VCF in the browser
  function attachGeneratedVCF() {
    const header = '##fileformat=VCFv4.2\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n';
    const rows = ['chr1\t10001\trs1\tA\tG\t.\t.\t.'];
    const blob = new Blob([header + rows.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const tracks = [
      { name: 'Generated VCF', type: 'variant', format: 'vcf', url, displayMode: 'EXPANDED' }
    ];
    const el = document.querySelector('visa-ge');
    el.setAttribute('tracks', JSON.stringify(tracks));
  }
</script>
```
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
