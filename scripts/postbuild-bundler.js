// ES Module that properly loads polyfills first, then igv.js, then main module
export async function loadModules() {
  // Import the polyfills and wait for them to finish
  await import('./polyfills.js');

  // Dynamically load igv.js from CDN
  await new Promise((resolve, reject) => {
    if (window.igv) {
      // Already loaded
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/igv@3.1.3/dist/igv.min.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  // Import the main module after igv.js is loaded
  await import('./main.js');

  // Do any extra stuff you need for init here.
}

// Auto-initialize when imported
loadModules();
