import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const postCollection = defineCollection({
    loader: glob({ base: "./src/content/posts", pattern: '*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        date: z.date(),
        update: z.date().optional(),
        tags: z.array(z.string()),
        category: z.string(),
    })
});

export const collections = {
    posts: postCollection,
}
