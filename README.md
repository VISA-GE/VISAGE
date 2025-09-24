# VISAGE

Visage is a genomic visualization component built with Angular that provides an interactive genome browser interface.

## How to get VISAGE working in your application

The optimal way for how to get VISAGE into your application depends on how your application is structured. If your are using a node-based frontend framework like React, Angular, Vue, etc., you can install VISAGE as an NPM package.

If you want to use VISAGE in an application that does not use node, you can add VISAGE by sourcing the standalone JavaScript bundle and stylesheet directly from a CDN (e.g., jsDelivr).

After either installation option, the `<visa-ge>` element is available and you can proceed with [the usage documentation](#how-to-use-the-custom-element).

### Using NPM

Install the package:

```bash
npm install @visa-ge/visage
```

Register the element by importing the package once at app startup (this executes the entry that defines `<visa-ge>`):

```ts
// e.g., in your app entry
import '@visa-ge/visage';
```

Load the stylesheet:

```html
<link rel="stylesheet" href="/node_modules/@visa-ge/visage/dist/visage/styles.css">
```

### Using CDN / direct `<script>` (no build step)

Use jsDelivr (mirrors npm):

```html
<script src="https://unpkg.com/@visa-ge/visage@latest/visage.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@visa-ge/visage@latest/styles.css">
```

## How to use the custom element

The element usage is the same regardless of how you imported it.

## Component Interface

The main component `VisageComponent` provides the following interfaces for integration:

### Input Properties

- **`genome-id`** (string | null): Sets the genome identifier for visualization
- **`selected-genes`** (string | null): Comma-separated list of gene names to highlight
- **`selected-regions`** (string | null): JSON array of genomic regions to display
- **`tracks`** (string | null): JSON array of IGV track objects to load
- **`visibility-signal`** (number | string | null): Any change triggers IGV `visibilityChange()`

### Output Events

- **`genomeIdChange`**: Emits when the genome ID changes
- **`selectedGenesChange`**: Emits when selected genes change (comma-separated string)
- **`selectedRegionsChange`**: Emits when selected regions change (JSON string)

### Usage Example (Web Component via NPM)

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

<!-- Trigger IGV visibility refresh from host page by bumping the signal -->
<script>
  const el = document.querySelector('visa-ge');
  let tick = 0;
  function triggerIGVVisibility() {
    el.setAttribute('visibility-signal', String(++tick));
  }
  // Example: call after tab becomes visible or layout changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') triggerIGVVisibility();
  });
  window.addEventListener('resize', triggerIGVVisibility);
}</script>
```


### Tracks Input

Visage is exposed as a web component (custom element). Web components receive attributes as strings, so complex values like arrays must be passed as JSON strings. The `tracks` input accepts a JSON-serialized array of IGV track definitions and replaces the current set of tracks when changed.

What this means in practice:
- You construct a regular JavaScript array of track objects (shape described by the `Track` interface).
- You convert it to a string with `JSON.stringify(tracks)`.
- You set that string on the `tracks` attribute of the `<visa-ge>` element.

Behavior and safeguards:
- **Validation**: items missing required fields (`name`, `url`) are skipped.
- **Deduplication**: duplicates by `name` or by `url` are ignored (first occurrence wins).
- **Replace semantics**: every time you set the `tracks` attribute, the component replaces its internal list of tracks with the validated, de-duplicated array you provided.

Example (as attribute on the custom element):

```html
<visa-ge genome-id="mm10" tracks='[
  {"name":"RefSeq Genes","type":"annotation","format":"refgene","url":"/assets/refgene.gz"},
  {"name":"My Peaks","type":"annotation","format":"bed","url":"https://example.org/peaks.bed"}
]'></visa-ge>
```

### Using Blob URLs

Sometimes your data does not live at a fixed URL (e.g., a file the user drags-and-drops or content generated in memory). In those cases, you can create a temporary object URL with `URL.createObjectURL(...)` and pass that URL in a track definition. IGV.js can read from these blob-backed URLs just like from remote files.

Typical use cases:
- **User uploads**: accept files from `<input type="file">` and visualize immediately, without any server upload.
- **On-the-fly generation**: build small VCF/BED content client-side (e.g., results of a quick filter) and preview in the browser.

Lifecycle note: When the blob is no longer needed, call `URL.revokeObjectURL(url)` to release memory. If you later want to refresh visibility/size after mounting or layout changes, see the section below about `visibility-signal`.

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


### Triggering IGV visibility updates from the host page

Browsers can change layout or visibility (tab switches, container show/hide, resizes) in ways that make IGV's tracks temporarily miscalculate sizes. To handle this, IGV.js exposes `visibilityChange()` to re-measure and repaint. Visage provides a simple, attribute-based trigger that you can bump whenever your host page layout changes.

How it works:
- The custom element accepts a `visibility-signal` attribute (string or number).
- Any change to this value (e.g., incrementing a counter) causes Visage to call `IGV.js`'s `visibilityChange()` internally.
- You decide when to bump it: on tab activation, after a sidebar toggles, on window resize, etc.

Example strategy:
- Maintain a counter in your host page and write it to `visibility-signal` whenever a relevant event occurs. You don’t need specific values; only changes matter.

This avoids direct refs into the Visage internals and keeps the integration purely declarative and DOM-based.

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
