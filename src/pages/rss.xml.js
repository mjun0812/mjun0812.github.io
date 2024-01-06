import rss from '@astrojs/rss';
import { getCollection } from "astro:content";

export const siteTitle = "MJUN Tech Note";
export const description = "とある情報系の院生の技術ノートです";
export const siteUrl = "https://note.mjunya.com";

export async function GET() {
    let posts = await getCollection("posts");
    posts = posts.sort(
        (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
    );

    return rss({
        title: siteTitle,
        description: description,
        site: siteUrl,
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: new Date(post.data.date),
            link: `/post/${post.slug}/`
        })),
        customData: `<language>ja-jp</language>`,
    });
}