type TaggablePost = {
  data: {
    date: Date | string | number;
    tags: string[];
  };
};

export type TagGroup<TPost extends TaggablePost> = {
  name: string;
  posts: TPost[];
  slug: string;
};

export function tagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/(\s|_)+/g, "-")
    .replace(/-+/g, "-");
}

export function getTagGroups<TPost extends TaggablePost>(
  posts: TPost[]
): TagGroup<TPost>[] {
  const groups = new Map<string, TagGroup<TPost>>();

  for (const post of posts) {
    const postSlugs = new Set<string>();

    for (const tag of post.data.tags) {
      const slug = tagSlug(tag);

      if (postSlugs.has(slug)) {
        continue;
      }

      postSlugs.add(slug);

      const group = groups.get(slug);
      if (group) {
        group.posts.push(post);
        continue;
      }

      groups.set(slug, {
        name: tag,
        posts: [post],
        slug,
      });
    }
  }

  return [...groups.values()].map((group) => ({
    ...group,
    posts: group.posts.sort(
      (a, b) =>
        new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
    ),
  }));
}
