// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://ikhsank6.github.io',
  integrations: [react()],
  build: {
    // Single page, ~7KB gzipped CSS: inline it so first paint needs no extra
    // round-trip. Astro's 'auto' externalises anything over ~4KB, which made
    // the one stylesheet render-blocking (~380ms on throttled mobile).
    inlineStylesheets: 'always',
  },
});