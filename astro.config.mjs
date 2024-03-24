import { defineConfig } from 'astro/config';
import partytown from "@astrojs/partytown";
import remarkLinkCard from "remark-link-card";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://mjunya.com",
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