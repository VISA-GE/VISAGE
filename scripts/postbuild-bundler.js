// ES Module that properly loads polyfills first, then main module
export async function loadModules() {
  // Import the polyfills and main modules and wait for them to finish
  await import('./polyfills.js');
  await import('./main.js');

  // Do any extra stuff you need for init here.
}

// Auto-initialize when imported
loadModules();
