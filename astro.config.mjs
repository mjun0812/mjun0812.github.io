import { defineConfig } from 'astro/config';
import partytown from "@astrojs/partytown";
import remarkLinkCard from "remark-link-card";
import icon from "astro-icon";

import sitemap from "@astrojs/sitemap";

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
    remarkPlugins: [remarkLinkCard],
    shikiConfig: {
      theme: 'one-dark-pro'
    }
  },
  integrations: [partytown(), icon(), sitemap()]
});