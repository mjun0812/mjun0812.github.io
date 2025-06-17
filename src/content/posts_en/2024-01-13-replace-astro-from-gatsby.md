---
title: "Migrated This Site from Gatsby.js to Astro"
tags: [Gatsby, Astro, Javascript]
category: Web
date: 2024-01-13
update: 2024-01-13
# for Zenn
type: tech
emoji: 😖
topics: [None]
published: true
---

Hello. This time I'll discuss migrating this site's framework from Gatsby.js to Astro.

## Reasons for Change

Originally, this site was created with Gatsby.js, a static site generator framework.
However, even with simple site configurations, Gatsby.js requires many additional plugins, so when trying to work on it after a while, I often had to update plugins and resolve dependencies, which was quite troublesome.

So I decided to choose Astro, which has strong official support for various features. Since Astro can also use React, Vue, and Svelte components, migration and combination seemed easy.

Specifically, the number of dependency packages in `package.json` decreased as follows:

- Gatsby.js era

```json
"dependencies": {
  "gatsby": "^5.7.0",
  "gatsby-awesome-pagination": "^0.3.8",
  "gatsby-plugin-feed": "^5.7.0",
  "gatsby-plugin-google-tagmanager": "^5.7.0",
  "gatsby-plugin-image": "^3.7.0",
  "gatsby-plugin-sass": "^6.7.0",
  "gatsby-plugin-sharp": "^5.7.0",
  "gatsby-plugin-sitemap": "^6.7.0",
  "gatsby-remark-amazon-link": "^1.0.0",
  "gatsby-remark-autolink-headers": "^6.7.0",
  "gatsby-remark-images": "^7.7.0",
  "gatsby-remark-link-beautify": "^2.2.1",
  "gatsby-remark-prismjs": "^7.7.0",
  "gatsby-remark-responsive-iframe": "^6.7.0",
  "gatsby-source-filesystem": "^5.7.0",
  "gatsby-transformer-remark": "^6.7.0-next",
  "gatsby-transformer-sharp": "^5.7.0",
  "prismjs": "^1.23.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "sass": "^1.50.0",
  "sharp": "^0.31.3"
},
"devDependencies": {
  "gatsby-cli": "^5.12.2",
  "gh-pages": "^5.0.0",
  "prettier": "2.8.4"
},
```

- When changed to Astro

```json
"dependencies": {
  "@astrojs/partytown": "^2.0.3",
  "@astrojs/rss": "^4.0.1",
  "@astrojs/sitemap": "^3.0.4",
  "astro": "^4.0.9",
  "astro-icon": "^1.0.2",
  "remark-link-card": "^1.3.1",
  "sharp": "^0.33.1"
},
"devDependencies": {
  "@iconify-json/mdi": "^1.1.64",
  "@iconify-json/simple-icons": "^1.1.86",
  "sass": "^1.69.7"
}
```

Reduced to less than half.

## Impressions After Migration

Since this site originally wrote CSS from scratch without using CSS frameworks, it was very easy to migrate. I want to continue this approach.

- Significantly reduced dependency packages  
As explained above, I was able to reduce them by more than half. Astro comes with built-in features like remark for converting Markdown to HTML, syntax highlighting with shiki, pagination, image optimization, and SEO features like RSS and sitemap that can be introduced with minimal code, which was very helpful.

- Can handle elements with relative paths (file-based) instead of GraphQL  
With Gatsby.js, even handling images required going through GraphQL, which I found quite difficult to use. With Astro, you can handle them with relative paths, making it much clearer.

- Simply better performance  
I feel this when starting development servers and during builds - it seems significantly faster than Gatsby. The site's performance itself also seems improved.

- Svelte-like syntax  
Previously used Gatsby was React-based, requiring special syntax like JSX, but with Astro, similar to Svelte, you can write scripts at the top of files and HTML/CSS at the bottom, making it possible to write with very basic syntax only.

## Summary

This migration to Astro was easy to do and simplified things by reducing dependency packages and file count, so I'm very satisfied.

The source code for this blog is published here:

<https://github.com/mjun0812/mjun0812.github.io>