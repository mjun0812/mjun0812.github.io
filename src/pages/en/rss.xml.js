import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export const siteTitle = "MJUN Tech Note";
export const description = "Technical notes from a graduate student in computer science";
export const siteUrl = "https://mjunya.com";

export async function GET() {
  let posts = await getCollection("posts_en");
  posts = posts.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
  );

  return rss({
    title: siteTitle + " (English)",
    description: description,
    site: siteUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      link: `/en/posts/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}