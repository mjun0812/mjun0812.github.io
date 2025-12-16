import { defineConfig } from 'astro/config';
import remarkLinkCard from "remark-link-card-plus";
import remarkGithubAlerts from "remark-github-alerts";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import partytown from "@astrojs/partytown";


// https://astro.build/config
export default defineConfig({
  site: "https://mjunya.com",
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "src/styles/_mixin.scss" as *;`
        }
      }
    }
  },
  markdown: {
    remarkPlugins: [
      [
        remarkLinkCard,
        {
          cache: false,
          shortenUrl: true,
          thumbnailPosition: "right"
        },
      ],
      remarkGithubAlerts,
    ],
    shikiConfig: {
      themes: {
        dark: 'one-dark-pro',
        light: 'one-light'
      }
    }
  },
  integrations: [
    icon(),
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push", "gtm"],
      }
    }),
  ],
});