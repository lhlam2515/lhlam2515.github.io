import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPublishedPosts, postUrl } from "../lib/content";
import { SITE } from "../lib/site";

/** RSS của blog, bỏ bài draft (IA-001, IA-005). */
export const GET: APIRoute = async ({ site }) => {
  const posts = await getPublishedPosts();
  return rss({
    title: `${SITE.name} — Blog`,
    description: SITE.tagline,
    site: site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postUrl(post),
    })),
    customData: "<language>vi</language>",
  });
};
