// Build a single IIFE bundle suitable for <script> in <head>, resolving imports
// Inputs: dist/visage/polyfills.js, dist/visage/main.js (built by ng)
// Output: dist/standalone/visage-standalone.iife.js
const fs = require('fs');
const path = require('path');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}

const distRoot = path.resolve(__dirname, '..', 'dist', 'visage');
const outRoot = path.resolve(__dirname, '..', 'dist', 'standalone');

const polyfillsPath = path.join(distRoot, 'polyfills.js');
const mainPath = path.join(distRoot, 'main.js');

for (const f of [polyfillsPath, mainPath]) {
  if (!fs.existsSync(f)) {
    console.error(`[standalone] Missing file: ${f}. Did you run ng build?`);
    process.exit(1);
  }
}

ensureDirSync(outRoot);

let esbuild;
try {
  esbuild = require('esbuild');
} catch (e) {
  console.error('[standalone] esbuild is required. Install with: npm i -D esbuild');
  process.exit(1);
}

(async () => {
  const outFile = path.join(outRoot, 'visage.js');
  // Use a virtual entry that loads polyfills first, then main
  const entryContents = `import './polyfills.js';\nimport * as igv from 'igv';\nif (!window.igv) window.igv = igv;\nimport './main.js';`;
  await esbuild.build({
    stdin: {
      contents: entryContents,
      resolveDir: distRoot,
      sourcefile: 'entry-standalone.js'
    },
    bundle: true,
    write: true,
    outfile: outFile,
    platform: 'browser',
    format: 'iife',
    target: ['es2018'],
    sourcemap: false,
    legalComments: 'none',
    minify: true,
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  const cssSrc = path.join(distRoot, 'styles.css');
  if (fs.existsSync(cssSrc)) {
    copyFile(cssSrc, path.join(outRoot, 'styles.css'));
  }

  const favSrc = path.join(distRoot, 'favicon.ico');
  if (fs.existsSync(favSrc)) {
    copyFile(favSrc, path.join(outRoot, 'favicon.ico'));
  }

  console.log(`[standalone] Wrote ${outFile}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

