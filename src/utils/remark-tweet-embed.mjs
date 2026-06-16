const TWEET_URL_RE = /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^/]+\/status\/\d+/i;

export default function remarkTweetEmbed() {
  return (tree) => {
    if (!tree || !Array.isArray(tree.children)) return;

    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type !== "paragraph") continue;
      if (!Array.isArray(node.children) || node.children.length !== 1) continue;

      const child = node.children[0];
      if (child.type !== "link") continue;
      if (typeof child.url !== "string") continue;
      if (!TWEET_URL_RE.test(child.url)) continue;

      const linkText =
        child.children && child.children.length === 1 && child.children[0].type === "text"
          ? child.children[0].value
          : null;
      if (linkText !== null && linkText !== child.url) continue;

      const url = child.url.split("?")[0];

      tree.children[i] = {
        type: "html",
        value:
          `<blockquote class="twitter-tweet" data-dnt="true">` +
          `<a href="${url}"></a>` +
          `</blockquote>`,
      };
    }
  };
}
