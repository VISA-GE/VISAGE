// ES Module that properly loads polyfills first, then igv.js, then main module
export async function loadModules() {
  // Import the polyfills and wait for them to finish
  await import('./polyfills.js');

  // Import igv.js from local dependency
  if (!window.igv) {
    const igv = await import('igv');
    window.igv = igv.default || igv;
  }

  // Import the main module after igv.js is loaded
  await import('./main.js');

  // Do any extra stuff you need for init here.
}

// Auto-initialize when imported
loadModules();
