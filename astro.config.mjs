import { defineConfig } from 'astro/config';

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: "https://note.mjunya.com",
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "./src/styles/_mixin.scss";'
        }
      }
    }
  },
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro'
    }
  },
  integrations: [partytown()]
});