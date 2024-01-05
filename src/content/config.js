import { defineCollection, z } from 'astro:content';

const postCollection = defineCollection({
    type: 'content',
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
